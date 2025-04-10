import { TokenBalance } from "@0xsequence/indexer";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  useAccount,
  useTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { useCollectionBalance } from "./data";
import { ERC1155_PACK_ABI } from "../abi/pack/ERC1155Pack";
import { itemsContractAddress, packContractAddress } from "../configs/chains";

export function useOpenPack({ address }: { address: `0x${string}` }) {
  const { chainId } = useAccount();
  const [revealHash, setRevealHash] = useState<string>();
  const [packTokenIds, setPackTokenIds] = useState<string[]>();
  const [frontImageUrl, setFrontImageUrl] = useState<string>();

  const {
    writeContract,
    isPending: isCommitLoading,
    isError: isCommitError,
  } = useWriteContract({
    mutation: {
      onSuccess: () =>
        console.log("Commit successful. Reveal event is expected"),
      onError: (error) => console.error("Error committing pack", error),
    },
  });
  const {
    isLoading: isReceiptLoading,
    data: packData,
    isError: isReceiptError,
  } = useTransactionReceipt({
    chainId,
    hash: revealHash! as `0x${string}`,
    query: {
      select: (receipt) => {
        const abiInterface = new ethers.Interface(ERC1155_PACK_ABI);
        for (const log of receipt.logs) {
          const parsedLog = abiInterface.parseLog(log);
          if (parsedLog?.name === "TransferBatch" && parsedLog?.args) {
            const { _to, _ids, _amounts } = parsedLog.args;
            if (_to === address) {
              const tokenIds: string[] = _ids.map((id: bigint) =>
                id.toString(),
              );
              const amounts: number[] = _amounts.map((amount: bigint) =>
                Number(amount),
              );

              if (!packTokenIds) setPackTokenIds(tokenIds);

              return { tokenIds, amounts };
            }
          }
        }
        return { tokenIds: [], amounts: [] };
      },
    },
  });

  const {
    refetch,
    data: collectionBalance,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useCollectionBalance({
    accountAddress: address!,
    contractAddress: itemsContractAddress,
  });

  const isLoading =
    isCommitLoading || (revealHash && isReceiptLoading) || isBalanceLoading;

  const isError = isCommitError || isReceiptError || isBalanceError;

  const openPack = () => {
    writeContract({
      chainId,
      address: packContractAddress,
      abi: ERC1155_PACK_ABI,
      functionName: "commit",
      args: [],
    });
  };

  useWatchContractEvent({
    chainId,
    address: packContractAddress,
    abi: ERC1155_PACK_ABI,
    eventName: "Reveal(address user)",
    args: { user: address },
    onError() {
      setRevealHash(undefined);
    },
    onLogs(logs) {
      const [log] = logs;
      const hash = log.transactionHash as `0x${string}`;

      if (hash === revealHash) {
        return;
      }

      setRevealHash(log.transactionHash as `0x${string}`);
      console.log("Reveal event received. Fetching collection metadata");
      refetch();
    },
  });

  useEffect(() => {
    if (frontImageUrl) return;

    const tokens = collectionBalance?.filter(
      ({ tokenID }) =>
        tokenID && packData?.tokenIds && packData.tokenIds.includes(tokenID),
    );
    const hasAny = !!tokens?.length;
    const imgUrl = hasAny ? tokens[0].tokenMetadata?.image : "";

    if (imgUrl) {
      setFrontImageUrl(imgUrl);
    }
  }, [collectionBalance, frontImageUrl]);

  const data: TokenBalance[] =
    collectionBalance
      ?.filter(
        ({ tokenID }) =>
          tokenID && packData?.tokenIds && packData.tokenIds.includes(tokenID),
      )
      .flatMap((card) =>
        Array(
          packData?.amounts[packData?.tokenIds.indexOf(card.tokenID!)],
        ).fill(card),
      ) || [];

  return {
    data,
    openPack,
    isLoading,
    isError,
  };
}
