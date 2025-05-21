import { useReadContract } from "wagmi";
import { packContractAddress } from "../configs/chains";
import { ERC1155_PACK_ABI } from "../abi/pack/ERC1155Pack";
import { useEffect } from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { OnChainRevealState } from "../helpers/onChainRevealStates";

export default function OnChainRevealStateChecker(props: {
  address: `0x${string}`;
  blockNumber: bigint;
  setOnChainPackState: Dispatch<SetStateAction<OnChainRevealState>>;
}) {
  const { address, blockNumber, setOnChainPackState } = props;
  const {
    isError: isGetRevealidxError,
    isSuccess: isGetRevealIdxSuccess,
    data: revealIdxData,
  } = useReadContract({
    address: packContractAddress,
    abi: ERC1155_PACK_ABI,
    functionName: "getRevealIdx",
    args: [address],
    scopeKey: `${blockNumber}`,
  });

  void revealIdxData;

  useEffect(() => {
    if (isGetRevealIdxSuccess) {
      setOnChainPackState("pending");
    } else if (isGetRevealidxError) {
      setOnChainPackState("ready");
    }
  });

  return <></>;
}
