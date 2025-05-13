import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { ERC1155_PACK_ABI } from "../abi/pack/ERC1155Pack";
import { packContractAddress } from "../configs/chains";
import { packOpeningStates } from "../views/packOpeningStates";

export function useOpenPack({
  id,
  address,
}: {
  id: number;
  address: `0x${string}`;
}) {
  const [packState, setPackState] =
    useState<(typeof packOpeningStates)[number]>("idle");
  const { chainId } = useAccount();
  const [revealHash, setRevealHash] = useState<string>();

  const myLog = useCallback(
    (msg: string) => {
      console.log(`[${id}]`, msg);
    },
    [id],
  );

  useEffect(() => {
    myLog(`((${packState}))`);
  }, [packState]);

  // commit
  const { writeContract, isError: isCommitError } = useWriteContract({
    mutation: {
      onSuccess: () => {
        myLog("Commit successful. Reveal event is expected");
        setPackState("revealing");
      },
      onError: (error) => {
        console.error("Error committing pack", error);
        setPackState("fail");
      },
    },
  });

  const openPack = () => {
    setPackState("commiting");
    writeContract({
      chainId,
      address: packContractAddress,
      abi: ERC1155_PACK_ABI,
      functionName: "commit",
      args: [],
    });
  };

  //reveal
  const { data: receipt, isError: isReceiptError } = useTransactionReceipt({
    chainId,
    scopeKey: `revealReceipt${id}`,
    hash: revealHash! as `0x${string}`,
    query: { enabled: !!revealHash },
  });

  const [packData, setPackData] = useState<
    | {
        tokenIds: string[];
        amounts: number[];
      }
    | undefined
  >();

  useEffect(() => {
    if (!receipt) {
      return;
    }
    myLog("found transaction receipt");
    const abiInterface = new ethers.Interface(ERC1155_PACK_ABI);
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      const parsedLog = abiInterface.parseLog(log);
      if (parsedLog?.name === "TransferBatch" && parsedLog?.args) {
        myLog(`- log ${i} has some items`);
        const { _to, _ids, _amounts } = parsedLog.args;
        if (_to === address) {
          myLog("  - that belong to me");

          const tokenIds: string[] = _ids.map((id: bigint) => id.toString());
          const amounts: number[] = _amounts.map((amount: bigint) =>
            Number(amount),
          );

          const result = { tokenIds, amounts };
          setPackData(result);
          myLog(JSON.stringify(result));
          setPackState("success");
        } else {
          myLog("  - that belong to someone else");
        }
      } else {
        myLog(`- log ${i} does not have items`);
      }
    }
    setPackData({ tokenIds: [], amounts: [] });
  }, [receipt]);

  const isError = isCommitError || isReceiptError;

  useEffect(() => {
    if (isError) {
      setPackState("fail");
    }
  }, [isError]);

  useWatchContractEvent({
    chainId,
    address: packContractAddress,
    abi: ERC1155_PACK_ABI,
    eventName: "Reveal(address user)",
    args: { user: address },
    enabled: packState === "revealing" || packState === "receiving", //this seems not to disable
    onError() {
      setRevealHash(undefined);
    },
    onLogs(logs) {
      if (revealHash) {
        return;
      }
      const [log] = logs;
      const hash = log.transactionHash as `0x${string}`;
      const alreadyHadOne = !!revealHash;
      myLog(`reveal hash found: ${hash}`);
      if (alreadyHadOne) {
        myLog(`even though I already had one`);
      }
      setPackState("receiving");
      setRevealHash(hash);
    },
  });

  return {
    packData: packState === "success" ? packData : null,
    openPack,
    packState,
  };
}
