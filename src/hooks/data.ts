import { useQuery } from "@tanstack/react-query";

import { useIndexerClient } from "./useIndexerClient";
import { initialChainId } from "../configs/chains";
import { Address } from "viem";

const time = {
  oneSecond: 1 * 1000,
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000,
};

export function useCollectionBalance(props: {
  accountAddress: Address;
  contractAddress: Address;
}) {
  const indexerClient = useIndexerClient(initialChainId);

  const query = useQuery({
    queryKey: ["collectionBalance", props.contractAddress],
    queryFn: async () => {
      const res = await indexerClient.getTokenBalances({
        accountAddress: props.accountAddress,
        contractAddress: props.contractAddress,
        includeMetadata: true,
        metadataOptions: {
          verifiedOnly: true,
          includeContracts: [props.contractAddress],
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
