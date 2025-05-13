import { AddressList } from "../components/AddressList";
import { AddressListItem } from "../components/AddressList/AddressListItem";
import { Button, Card } from "boilerplate-design-system";
import { Address } from "viem";
import UserInventory from "../components/UserInventory";
import {
  initialChainId,
  itemsContractAddress,
  packContractAddress,
} from "../configs/chains";
import View3D from "../components/3d/View3D";
import ItemViewer3D from "../components/3d/ItemViewer3D";
import { useCollectionBalance } from "../hooks/data";
import MintPacks from "../components/MintPacks";
import { useGetTokenMetadata } from "@0xsequence/hooks";
import { allNetworks } from "@0xsequence/network";
import { useEffect, useState } from "react";
import OpenableChest from "../components/3d/OpenableChest";
import { animationStates } from "./chestAnimationStates";
import { chestStates } from "./chestStates";

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress, chainId } = props;

  const addressListData: Array<[string, string]> = [];

  if (userAddress) {
    addressListData.push(["User Address", userAddress]);
  }
  addressListData.push(["Items Contract", itemsContractAddress]);
  addressListData.push(["Pack Contract", packContractAddress]);

  const urlBase = chainId
    ? allNetworks.find((chain) => chain.chainId === chainId)?.blockExplorer
        ?.rootUrl
    : undefined;

  const {
    data: packCollectionBalanceData,
    refetch: refetchPackCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: packContractAddress,
  });

  const { data: itemMetadatas } = useGetTokenMetadata({
    chainID: String(initialChainId),
    contractAddress: itemsContractAddress,
    tokenIDs: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
    ],
  });

  const { data: packMetadatas } = useGetTokenMetadata({
    chainID: String(initialChainId),
    contractAddress: packContractAddress,
    tokenIDs: ["1"],
  });

  const chestsRemaining = packCollectionBalanceData
    ? packCollectionBalanceData.reduce((pv, cv) => Number(cv.balance) + pv, 0)
    : "";

  const [openChestInitiated, setOpenChestInitiated] = useState(false);

  const [focusedChestState, setFocusedChestState] =
    useState<(typeof chestStates)[number]>("idle");

  const [chestSuccessCount, setChestSuccessCount] = useState(0);

  const [animOverride, setAnimOverride] = useState<
    (typeof animationStates)[number] | undefined
  >(undefined);

  const {
    data: itemsCollectionBalanceData,
    isLoading: itemCollectionBalanceIsLoading,
    refetch: refetchItemsCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: itemsContractAddress,
  });

  useEffect(() => {
    if (focusedChestState === "opened") {
      refetchItemsCollectionBalance();
      setTimeout(() => {
        setChestSuccessCount(chestSuccessCount + 1);
      }, 5000);
    }
  }, [focusedChestState]);

  return (
    <div className="flex flex-col gap-12">
      <div className="relative">
        <View3D>
          <ItemViewer3D>
            {Array.from({ length: 2 }, (_v, i) => {
              if (chestSuccessCount === 0 && i === 0) {
                return null;
              }
              if (
                chestsRemaining === 0 &&
                i === 1 &&
                focusedChestState === "idle"
              ) {
                return null;
              }
              const j = i + chestSuccessCount;
              return (
                <OpenableChest
                  key={j}
                  id={j}
                  x={i * 10 - 10}
                  y={0}
                  z={-2}
                  userAddress={userAddress}
                  showPrizes={i === 1}
                  openInitiated={i === 1 && openChestInitiated}
                  refetchPackCollectionBalance={refetchPackCollectionBalance}
                  setChestState={setFocusedChestState}
                  itemMetadatas={itemMetadatas}
                  packMetadatas={packMetadatas}
                  animOverride={animOverride}
                />
              );
            })}
          </ItemViewer3D>
        </View3D>
        {chestsRemaining && chestsRemaining > 0 ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center mt-60">
              {focusedChestState !== "busy" &&
                focusedChestState !== "opened" &&
                !openChestInitiated && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setOpenChestInitiated(true);
                      setTimeout(() => setOpenChestInitiated(false), 100);
                    }}
                  >
                    {focusedChestState === "failed"
                      ? "Retry Opening Pack"
                      : "Open Pack"}
                  </Button>
                )}
            </div>
            <div className="absolute bottom-4 left-4 text-36 font-heavy">
              x{chestsRemaining}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MintPacks
              refetchPackCollection={() => refetchPackCollectionBalance()}
            />
          </div>
        )}
      </div>
      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        <UserInventory
          title={"Collectibles"}
          itemsCollectionBalanceData={itemsCollectionBalanceData}
          itemCollectionBalanceIsLoading={itemCollectionBalanceIsLoading}
          refetchItemsCollectionBalance={refetchItemsCollectionBalance}
        />
      </Card>
      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        {chainId && (
          <Card
            collapsable
            title="Extra info for nerds"
            className="border-t border-white/10 rounded-none bg-transparent"
          >
            <AddressList>
              {addressListData.map((data) => (
                <AddressListItem
                  key={data[0]}
                  label={data[0]}
                  address={data[1]}
                  url={urlBase ? `${urlBase}address/` : ""}
                />
              ))}
            </AddressList>
          </Card>
        )}
      </Card>

      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        <Card
          collapsable
          title="Animation debug"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
          <div className="flex flex-row gap-3">
            {animationStates.map((i) => {
              return (
                <div
                  key={i}
                  onClick={() =>
                    setAnimOverride(i === animOverride ? undefined : i)
                  }
                  className={`stroke-20 stroke-amber-50 inline-block m-1 p-3 rounded-2xl font-bold ${i === animOverride ? "bg-purple-500" : "bg-purple-800"}`}
                >
                  {i}
                </div>
              );
            })}
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default Connected;
