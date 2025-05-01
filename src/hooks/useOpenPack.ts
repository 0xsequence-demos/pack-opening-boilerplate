import { ethers } from "ethers";
import { useState } from "react";
import {
  useAccount,
  useTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { ERC1155_PACK_ABI } from "../abi/pack/ERC1155Pack";
import { packContractAddress } from "../configs/chains";

export function useOpenPack({ address }: { address: `0x${string}` }) {
  const { chainId } = useAccount();
  const [revealHash, setRevealHash] = useState<string>();
  const [packTokenIds, setPackTokenIds] = useState<string[]>();
  const [isWaitingForReveal, setIsWaitingForReveal] = useState(false);

  const {
    writeContract,
    isPending: isCommitLoading,
    isError: isCommitError,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        console.log("Commit successful. Reveal event is expected");
        setIsWaitingForReveal(true);
      },
      onError: (error) => console.error("Error committing pack", error),
    },
  });
  const {
    isLoading: isReceiptLoading,
    data,
    isError: isReceiptError,
  } = useTransactionReceipt({
    chainId,
    hash: revealHash! as `0x${string}`,
    query: {
      select: (receipt) => {
        const abiInterface = new ethers.Interface(ERC1155_PACK_ABI);
        for (const log of receipt.logs) {
          const parsedLog = abiInterface.parseLog(log);
          console.log("parsedLog: ", parsedLog);
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

  const isLoading = isCommitLoading || (revealHash && isReceiptLoading);

  const isError = isCommitError || isReceiptError;

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
      console.log("hash:", hash);
      if (hash === revealHash) {
        return;
      }
      setRevealHash(hash);
      setIsWaitingForReveal(false);
    },
  });

  return {
    packData: !isLoading && !isWaitingForReveal ? data : null,
    openPack,
    isLoading,
    isWaitingForReveal,
    isError,
  };
}
