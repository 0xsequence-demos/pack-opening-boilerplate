import { ethers } from "ethers";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useAccount,
  useBlockNumber,
  useTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { ERC1155_PACK_ABI } from "../abi/pack/ERC1155Pack";
import { initialChainId, packContractAddress } from "../configs/chains";
import { PackOpeningState } from "../helpers/packOpeningStates";
import { PackData } from "../helpers/PackData";
import { useAPIClient } from "@0xsequence/hooks";
import { OnChainRevealState } from "../helpers/onChainRevealStates";
import OnChainRevealStateChecker from "./OnChainRevealStateChecker";
import { useRef } from "react";

export function PackOpener({
  id,
  address,
  packState,
  setPackState,
  setPackData,
}: {
  id: number;
  address: `0x${string}`;
  packState: PackOpeningState;
  setPackState: Dispatch<SetStateAction<PackOpeningState>>;
  setPackData: Dispatch<SetStateAction<PackData | undefined>>;
}) {
  const { chainId } = useAccount();
  const [revealHash, setRevealHash] = useState<string>();
  const { data: blockNumber } = useBlockNumber();
  const [earliestPossibleRevealBlock, setEarliestPossibleRevealBlock] =
    useState<bigint | undefined>();

  const myLog = useCallback(
    (msg: string) => {
      console.log(`[${id}] ${msg}`);
    },
    [id],
  );

  useEffect(() => {
    myLog(`((${packState}))`);
  }, [packState]);

  const [onChainRevealState, setOnChainRevealState] =
    useState<OnChainRevealState>("unknown");

  useEffect(() => {
    if (onChainRevealState !== "unknown") {
      myLog(`onChainRevealState: ${onChainRevealState}`);
    }
  }, [onChainRevealState]);

  useEffect(() => {
    if (packState === "startingOpeningProcess") {
      setPackState("checkingRevealStatus");
    }
  }, [packState]);

  // commit
  const { writeContract, isError: isCommitError } = useWriteContract({
    mutation: {
      onSuccess: () => {
        myLog("Commit successful. Reveal event is expected");
        setEarliestPossibleRevealBlock(blockNumber);
        setPackState("revealing");
      },
      onError: (error) => {
        console.error("Error committing pack", error);
        setPackState("fail");
      },
    },
  });

  useEffect(() => {
    if (blockNumber !== undefined) {
      if (onChainRevealState === "ready") {
        setPackState("commiting");
        writeContract({
          chainId,
          address: packContractAddress,
          abi: ERC1155_PACK_ABI,
          functionName: "commit",
          args: [],
        });
      } else if (onChainRevealState === "pending") {
        setPackState("revealBackup");
      }
    }
  }, [blockNumber, onChainRevealState]);

  const apiClient = useAPIClient();

  useEffect(() => {
    if (packState === "revealBackup") {
      apiClient
        .getRevealTxData({
          chainId: initialChainId,
          contractAddress: packContractAddress,
          userAddress: address,
        })
        .then((data) => {
          myLog(JSON.stringify(data));
        })
        .catch((reason) => {
          myLog("API getRevealTxData() failed:" + reason);
        });
    }
  }, [packState]);

  //reveal
  const transactionReceiptQueryEnabled =
    (packState === "commiting" ||
      packState === "revealing" ||
      packState === "revealBackup" ||
      packState === "receiving") &&
    !!revealHash;

  const packStateRef = useRef(packState);

  useEffect(() => {
    packStateRef.current = packState;
  }, [packState]);

  useEffect(() => {
    if (packState === "revealing") {
      setTimeout(() => {
        if (packStateRef.current === "revealing") {
          setPackState("revealBackup");
        }
      }, 20000);
    }
  });

  // myLog(`transactionReceiptQueryEnabled: ${transactionReceiptQueryEnabled}`);

  const { data: receipt, isError: isReceiptError } = useTransactionReceipt({
    chainId,
    scopeKey: `revealReceipt-${revealHash}`,
    hash: revealHash! as `0x${string}`,
    query: {
      enabled: transactionReceiptQueryEnabled,
    },
  });

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
        myLog(`- log ${i} (${parsedLog?.name}) does not have items`);
      }
    }
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
    eventName: "Reveal",
    fromBlock: earliestPossibleRevealBlock,
    args: { user: address },
    enabled:
      packState === "commiting" ||
      packState === "revealing" ||
      packState === "revealBackup" ||
      packState === "receiving", //this seems not to disable
    onError() {
      setRevealHash(undefined);
    },
    onLogs(logs) {
      for (const log of logs) {
        myLog(`event args: ${log.args}`);
        const hash = log.transactionHash as `0x${string}`;
        myLog(`reveal hash found: ${hash}`);
        setPackState("receiving");
        setRevealHash(hash);
      }
    },
  });
  return (
    <>
      {packState === "checkingRevealStatus" && blockNumber && (
        <OnChainRevealStateChecker
          address={address}
          blockNumber={blockNumber}
          setOnChainPackState={setOnChainRevealState}
        />
      )}
    </>
  );
}
