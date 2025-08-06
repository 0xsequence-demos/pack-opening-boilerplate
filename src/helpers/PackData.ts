export type PackDataItem = {
  contract: string;
  tokenId: string;
  amount: number;
  type: "erc1155" | "erc721";
};
export type PackData = Array<PackDataItem>;
