import { Address } from "viem";
import { useState } from "react";
import { ChestAnimationState } from "../helpers/chestAnimationStates";
import { useCollectionBalance } from "../hooks/data";
import { itemsContractAddress, packContractAddress } from "../configs/chains";
import ExtraInfo from "../components/ExtraInfo";
import DebuggingAndUtils from "../components/DebuggingAndUtils";
import PackOpeningInteractive3D from "../components/3d/PackOpeningInteractive3D";

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress, chainId } = props;

  const {
    data: packCollectionBalanceData,
    refetch: refetchPackCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: packContractAddress,
  });

  const packsRemaining = packCollectionBalanceData
    ? parseInt(
        packCollectionBalanceData?.find((v) => v.tokenID === "4")?.balance ||
          "0",
      )
    : -1;

  const [animOverride, setAnimOverride] = useState<
    ChestAnimationState | undefined
  >(undefined);

  const {
    data: itemsCollectionBalanceData,
    isLoading: itemCollectionBalanceIsLoading,
    refetch: refetchItemsCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: itemsContractAddress,
  });

  return (
    <div className="flex flex-col gap-12">
      <PackOpeningInteractive3D
        userAddress={userAddress}
        packsRemaining={packsRemaining}
        refetchItemsCollectionBalance={refetchItemsCollectionBalance}
        refetchPackCollectionBalance={refetchPackCollectionBalance}
        animOverride={animOverride}
      />
      <ExtraInfo
        itemsCollectionBalanceData={itemsCollectionBalanceData}
        itemCollectionBalanceIsLoading={itemCollectionBalanceIsLoading}
        refetchItemsCollectionBalance={refetchItemsCollectionBalance}
        userAddress={userAddress}
        chainId={chainId}
      />
      <DebuggingAndUtils
        packsRemaining={packsRemaining}
        userAddress={userAddress}
        refetchItemsCollectionBalance={refetchItemsCollectionBalance}
        refetchPackCollectionBalance={refetchPackCollectionBalance}
        itemsCollectionBalanceData={itemsCollectionBalanceData}
        animOverride={animOverride}
        setAnimOverride={setAnimOverride}
      />
    </div>
  );
};

export default Connected;
