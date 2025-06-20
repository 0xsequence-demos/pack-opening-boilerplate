import { ethers } from "ethers";
import { networks, findSupportedNetwork } from "@0xsequence/network";
import { Session, SessionSettings } from "@0xsequence/auth";

interface IEnv {
  PKEY: string; // Private key for EOA wallet
  PACK_CONTRACT_ADDRESS: string; // Deployed ERC1155 or ERC721 contract address
  BUILDER_PROJECT_ACCESS_KEY: string; // From sequence.build
  CHAIN_HANDLE: string; // Standardized chain name – See https://docs.sequence.xyz/multi-chain-support
}

function fastResponse(message: string, status = 400) {
  return new Response(message, { status });
}

export const onRequest: PagesFunction<IEnv> = async (ctx) => {
  let response: Response | undefined;

  if (ctx.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        // Allow POST method - add any other methods you need to support
        "Access-Control-Allow-Methods": "POST",

        // Preflight cache period
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  if (ctx.request.method !== "POST") {
    return fastResponse(`Method not supported: ${ctx.request.method}`, 405);
  }

  if (ctx.env.PKEY === undefined || ctx.env.PKEY === "") {
    return fastResponse(
      "Make sure PKEY is configured in your environment",
      500,
    );
  }

  if (
    ctx.env.PACK_CONTRACT_ADDRESS === undefined ||
    ctx.env.PACK_CONTRACT_ADDRESS === ""
  ) {
    return fastResponse(
      "Make sure PACK_CONTRACT_ADDRESS is configured in your environment",
      500,
    );
  }

  if (
    ctx.env.BUILDER_PROJECT_ACCESS_KEY === undefined ||
    ctx.env.BUILDER_PROJECT_ACCESS_KEY === ""
  ) {
    return fastResponse(
      "Make sure PROJECT_ACCESS_KEY is configured in your environment",
      500,
    );
  }

  if (ctx.env.CHAIN_HANDLE === undefined || ctx.env.CHAIN_HANDLE === "") {
    return fastResponse(
      "Make sure CHAIN_HANDLE is configured in your environment",
      500,
    );
  }

  const network = findSupportedNetwork(ctx.env.CHAIN_HANDLE);

  if (network === undefined) {
    return fastResponse("Unsupported network or unknown CHAIN_HANDLE", 500);
  }

  const body = await ctx.request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { address, tokenId, amount } = body as any;
  console.log(body);
  const dataRaw = [address, tokenId, amount, "0x00"];
  const contractAddress = ctx.env.PACK_CONTRACT_ADDRESS;

  const relayerUrl = `https://${ctx.env.CHAIN_HANDLE}-relayer.sequence.app`;
  console.log(relayerUrl);

  console.log(contractAddress);

  // instantiate settings
  const settings: Partial<SessionSettings> = {
    networks: [
      {
        ...networks[network.chainId],
        rpcUrl: network.rpcUrl,
        relayer: {
          url: relayerUrl,
          provider: {
            url: network.rpcUrl,
          },
        },
      },
    ],
  };

  // create a single signer sequence wallet session
  const session = await Session.singleSigner({
    settings: settings,
    signer: ctx.env.PKEY,
    projectAccessKey: ctx.env.BUILDER_PROJECT_ACCESS_KEY,
  });

  // get signer
  const signer = session.account.getSigner(network.chainId);
  console.log(signer.account.address);
  // create interface from partial abi
  const collectibleInterface = new ethers.Interface([
    "function mint(address to, uint256 tokenId, uint256 amount, bytes data)",
  ]);
  const data = collectibleInterface.encodeFunctionData("mint", dataRaw);
  try {
    const res = await signer.sendTransaction({ to: contractAddress, data });
    response = fastResponse(JSON.stringify({ transactionHash: res.hash }), 200);
  } catch (err) {
    console.log(err);
    response = fastResponse(
      `Something went wrong: ${JSON.stringify(err)}`,
      500,
    );
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );

  return response;
};
