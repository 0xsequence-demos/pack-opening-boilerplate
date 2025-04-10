import { chainIdFromString, chainIdsFromString } from "../helpers/chainIdUtils";

const chainIds = chainIdsFromString(import.meta.env.VITE_CHAINS);
export const defaultChainId = chainIdFromString(
  import.meta.env.VITE_DEFAULT_CHAIN,
);

if (defaultChainId && !chainIds.includes(defaultChainId)) {
  console.warn(
    `Your preferred default chain ${defaultChainId} is not on your l76ist of supported chains (${import.meta.env.VITE_DEFAULT_CHAIN})`,
  );
}

export const initialChainId = defaultChainId || chainIds[0];

export const salesContractAddress = import.meta.env
  .VITE_SALES_CONTRACT_ADDRESS as `0x${string}`;

export const nftTokenAddress = import.meta.env
  .VITE_NFT_TOKEN_ADDRESS as `0x${string}`;
