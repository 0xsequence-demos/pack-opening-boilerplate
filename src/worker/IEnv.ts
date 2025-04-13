export interface IEnv {
  ASSETS: Fetcher;
  PKEY: string; // Private key for EOA wallet
  PACK_CONTRACT_ADDRESS: string; // Deployed ERC1155 or ERC721 contract address
  BUILDER_PROJECT_ACCESS_KEY: string; // From sequence.build
  CHAIN_HANDLE: string; // Standardized chain name – See https://docs.sequence.xyz/multi-chain-support
}
