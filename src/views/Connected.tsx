import { Address } from "viem";
import { useState } from "react";
import { ChestAnimationState } from "../helpers/chestAnimationStates";
import { useCollectionBalance } from "../hooks/data";
import {
  initialChainId,
  itemsContract2Address,
  itemsContractAddress,
  packContractAddress,
} from "../configs/chains";
import ExtraInfo from "../components/ExtraInfo";
import DebuggingAndUtils from "../components/DebuggingAndUtils";
import PackOpeningInteractive3D from "../components/3d/PackOpeningInteractive3D";
import { useGetTokenMetadata } from "@0xsequence/hooks";
import { Button } from "@0xsequence-demos/boilerplate-design-system";

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress, chainId } = props;

  const {
    data: packCollectionBalanceData,
    refetch: refetchPackCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: packContractAddress,
  });

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
  const {
    data: itemsCollection2BalanceData,
    isLoading: itemCollection2BalanceIsLoading,
    refetch: refetchItemsCollection2Balance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: itemsContract2Address,
  });
  const { data: packMetadatas } = useGetTokenMetadata({
    chainID: String(initialChainId),
    contractAddress: packContractAddress,
    tokenIDs: ["0", "1", "2"],
  });

  const [activePackId, setActivePackId] = useState<string | undefined>(
    undefined,
  );

  const activePackMetadata = packMetadatas?.find(
    (pd) => pd.tokenId === activePackId,
  );

  return (
    <div className="flex flex-col gap-12">
      {packCollectionBalanceData &&
        (activePackId !== undefined && activePackMetadata ? (
          <div>
            <div className="flex justify-between p-2 text-24">
              <div>#{activePackId}</div>
              <div className="font-bold">{activePackMetadata.name}</div>
              <Button
                variant="primary"
                onClick={() => setActivePackId(undefined)}
              >
                Back to Packs
              </Button>
            </div>
            <PackOpeningInteractive3D
              userAddress={userAddress}
              packsRemaining={parseInt(
                packCollectionBalanceData.find(
                  (t) => t.tokenID === activePackId,
                )?.balance || "0",
              )}
              refetchItemsCollectionsBalance={() => {
                refetchItemsCollectionBalance();
                refetchItemsCollection2Balance();
              }}
              refetchPackCollectionBalance={refetchPackCollectionBalance}
              animOverride={animOverride}
              packMetadata={activePackMetadata}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {packMetadatas?.map((tokenData) => {
              return (
                <div
                  key={tokenData.tokenId}
                  className={`aspect-square relative cursor-pointer`}
                  onClick={() => setActivePackId(tokenData.tokenId)}
                >
                  <div
                    className={`w-full h-full rounded-lg bg-white opacity-10 bg-[url(${tokenData.image})] bg-cover bg-center absolute`}
                  />
                  <img
                    src={tokenData.image}
                    className={`rounded-lg bg-[url(${tokenData.image})] absolute`}
                  />
                  <div className="absolute top-1 left-2">
                    #{tokenData.tokenId}
                  </div>
                  <div className="absolute w-full bottom-0 p-1">
                    <div className="w-full text-center font-black">
                      {tokenData.name}
                    </div>
                    <br />
                    {packCollectionBalanceData
                      ? // eslint-disable-next-line no-constant-binary-expression
                        `x${packCollectionBalanceData.find((tb) => tb.tokenID === tokenData.tokenId)?.balance || "0"}` ||
                        ""
                      : ""}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      <ExtraInfo
        itemsCollectionBalanceData={itemsCollectionBalanceData}
        itemsCollection2BalanceData={itemsCollection2BalanceData}
        itemCollectionBalanceIsLoading={
          itemCollectionBalanceIsLoading || itemCollection2BalanceIsLoading
        }
        userAddress={userAddress}
        chainId={chainId}
      />
      <DebuggingAndUtils
        packsRemaining={packCollectionBalanceData}
        userAddress={userAddress}
        packMetadatas={packMetadatas}
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
