import { ethers } from "ethers";
import { networks, findSupportedNetwork } from "@0xsequence/network";
import { Session, SessionSettings } from "@0xsequence/auth";
import { IEnv } from "./IEnv";

function fastResponse(message: string, status = 200) {
  return new Response(message, { status });
}

export async function mint(request: Request, env: IEnv) {
  let response: Response | undefined;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        // Allow POST method - add any other methods you need to support
        "Access-Control-Allow-Methods": "POST",

        // Preflight cache period
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  if (request.method !== "POST") {
    return fastResponse(`Method not supported: ${request.method}`, 405);
  }

  if (env.PKEY === undefined || env.PKEY === "" || BigInt(env.PKEY) === 0n) {
    return fastResponse(
      "Make sure PKEY is configured in your environment",
      500,
    );
  }

  if (
    env.PACK_CONTRACT_ADDRESS === undefined ||
    env.PACK_CONTRACT_ADDRESS === ""
  ) {
    return fastResponse(
      "Make sure PACK_CONTRACT_ADDRESS is configured in your environment",
      500,
    );
  }

  if (
    env.BUILDER_PROJECT_ACCESS_KEY === undefined ||
    env.BUILDER_PROJECT_ACCESS_KEY === ""
  ) {
    return fastResponse(
      "Make sure PROJECT_ACCESS_KEY is configured in your environment",
      500,
    );
  }

  if (env.CHAIN_HANDLE === undefined || env.CHAIN_HANDLE === "") {
    return fastResponse(
      "Make sure CHAIN_HANDLE is configured in your environment",
      500,
    );
  }

  const network = findSupportedNetwork(env.CHAIN_HANDLE);

  if (network === undefined) {
    return fastResponse("Unsupported network or unknown CHAIN_HANDLE", 500);
  }

  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { address, tokenId, amount } = body as any;
  console.log(body);
  const dataRaw = [address, tokenId, BigInt(amount), "0x00"];
  const contractAddress = env.PACK_CONTRACT_ADDRESS;
  
  const relayerUrl = `https://${env.CHAIN_HANDLE}-relayer.sequence.app`;
  console.log(relayerUrl);
  
  console.log("dataRaw:", dataRaw);
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
    signer: env.PKEY,
    projectAccessKey: env.BUILDER_PROJECT_ACCESS_KEY,
  });

  // get signer
  const signer = session.account.getSigner(network.chainId);
  console.log(dataRaw);
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
}
