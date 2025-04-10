import { useQuery } from "@tanstack/react-query";

import { useMetadataClient } from "./useMetadataClient";
import { useIndexerClient } from "./useIndexerClient";
import { initialChainId, nftTokenAddress } from "../configs/chains";
import { Address } from "viem";

const time = {
  oneSecond: 1 * 1000,
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000,
};

export const useContractInfo = (
  chainId: number,
  contractAddress: string | undefined,
) => {
  const metadataClient = useMetadataClient();

  return useQuery({
    queryKey: ["contractInfo", chainId, contractAddress],
    queryFn: async () => {
      const res = await metadataClient.getContractInfo({
        chainID: String(chainId),
        contractAddress: contractAddress || "",
      });

      return res.contractInfo;
    },
    retry: true,
    staleTime: time.oneMinute * 10,
    enabled: !!chainId && !!contractAddress,
  });
};

export function useCollectionBalance(props: { accountAddress: Address }) {
  const indexerClient = useIndexerClient(initialChainId);

  const query = useQuery({
    queryKey: ["collectionBalance"],
    queryFn: async () => {
      const res = await indexerClient.getTokenBalances({
        accountAddress: props.accountAddress,
        contractAddress: nftTokenAddress,
        includeMetadata: true,
        metadataOptions: {
          verifiedOnly: true,
          includeContracts: [nftTokenAddress],
        },
      });
      return res?.balances || [];
    },
    retry: true,
    // The query is considered stale after 30 seconds (staleTime),
    // so it will automatically refetch every 30 seconds to update the data.
    staleTime: time.oneSecond * 30,
    enabled: !!props.accountAddress,
  });

  return {
    ...query,
    refetch: query.refetch,
  };
}
