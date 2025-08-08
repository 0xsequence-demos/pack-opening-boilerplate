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
import { packContractAddress } from "../configs/chains";
import { PackOpeningState } from "../helpers/packOpeningStates";
import { PackData } from "../helpers/PackData";
import { ERC1155_SALE_ITEMS_ABI, ERC721_SALE_ITEMS_ABI } from "@0xsequence/abi";

export function PackOpener({
  id,
  address,
  packState,
  setPackState,
  setPackData,
  packTokenId,
}: {
  id: number;
  address: `0x${string}`;
  packState: PackOpeningState;
  setPackState: Dispatch<SetStateAction<PackOpeningState>>;
  setPackData: Dispatch<SetStateAction<PackData | undefined>>;
  packTokenId: string;
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
    if (packState === "startingOpeningProcess" && blockNumber !== undefined) {
      setPackState("commiting");
      writeContract({
        chainId,
        address: packContractAddress,
        abi: ERC1155_PACK_ABI,
        functionName: "commit",
        args: [BigInt(packTokenId)],
      });
    }
  }, [packState, blockNumber]);

  //reveal
  const transactionReceiptQueryEnabled =
    (packState === "commiting" ||
      packState === "revealing" ||
      packState === "receiving") &&
    !!revealHash;

  // useEffect(() => {
  //   if (packState === "revealing") {
  //     setTimeout(() => {
  //       setPackState("revealBackup");
  //     }, 2000);
  //   }
  // });

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
    const abi1155 = new ethers.Interface(ERC1155_SALE_ITEMS_ABI);
    const abi721 = new ethers.Interface(ERC721_SALE_ITEMS_ABI);
    console.log(receipt);
    const packData: PackData = [];
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      const parsed1155Log = abi1155.parseLog(log);
      const parsed721Log = abi721.parseLog(log);
      console.log(log.address);
      console.log(parsed1155Log || parsed721Log);
      const logName = (parsed1155Log || parsed721Log)?.name;
      if (
        (logName === "TransferBatch" || logName === "Transfer") &&
        parsed1155Log?.args
      ) {
        myLog(`- log ${i} has some items`);
        const { _to, _ids, _amounts } = parsed1155Log.args;
        if (_to === address) {
          myLog("  - that belong to me");
          for (let i = 0; i < _ids.length; i++) {
            packData.push({
              contract: log.address,
              tokenId: _ids[i],
              amount: _amounts[i],
              type: "erc1155",
            });
          }
        } else {
          myLog("  - that belong to someone else");
        }
      } else if (
        (logName === "TransferBatch" || logName === "Transfer") &&
        parsed721Log?.args
      ) {
        myLog(`- log ${i} has some items`);
        const { to, tokenId } = parsed721Log.args;
        if (to === address) {
          myLog("  - that belong to me");
          packData.push({
            contract: log.address,
            tokenId,
            amount: 1,
            type: "erc721",
          });
        } else {
          myLog("  - that belong to someone else");
        }
      } else {
        myLog(
          `- log ${i} (${parsed1155Log?.name}) (${parsed721Log?.name}) does not have items`,
        );
      }
    }
    if (packData.length > 0) {
      setPackData(packData);
      setPackState("success");
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
      packState === "receiving",
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
  return <></>;
}
