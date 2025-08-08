import { chainIdFromString, chainIdsFromString } from "../helpers/chainIdUtils";

const chainIds = chainIdsFromString(import.meta.env.VITE_CHAINS);
export const defaultChainId = chainIdFromString(
  import.meta.env.VITE_DEFAULT_CHAIN,
);

if (defaultChainId && !chainIds.includes(defaultChainId)) {
  console.warn(
    `Your preferred default chain ${defaultChainId} is not on your list of supported chains (${import.meta.env.VITE_DEFAULT_CHAIN})`,
  );
}

export const initialChainId = defaultChainId || chainIds[0];

export const packContractAddress = import.meta.env
  .VITE_PACK_CONTRACT_ADDRESS as `0x${string}`;

export const itemsContractAddress = import.meta.env
  .VITE_ITEMS_CONTRACT_ADDRESS as `0x${string}`;

export const itemsContract2Address = import.meta.env
  .VITE_ITEMS_CONTRACT2_ADDRESS as `0x${string}`;
