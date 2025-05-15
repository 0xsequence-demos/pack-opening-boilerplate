import { Button, Card } from "boilerplate-design-system";
import { Address } from "viem";
import { useEffect, useState } from "react";
import { PackOpener } from "../hooks/PackOpener";
import { PackOpeningState } from "./packOpeningStates";
import { PackData } from "../hooks/PackData";
import MintPacks from "../components/MintPacks";
import BurnItems from "../components/BurnItems";
import UserInventory from "../components/UserInventory";
import { useCollectionBalance } from "../hooks/data";
import { itemsContractAddress, packContractAddress } from "../configs/chains";

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress } = props;

  const [debugPackState, setDebugPackState] =
    useState<PackOpeningState>("idle");

  const [debugPackData, setDebugPackData] = useState<PackData | undefined>();
  const [debugPackCount, setDebugPackCount] = useState(0);

  const {
    data: packCollectionBalanceData,
    refetch: refetchPackCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: packContractAddress,
  });

  const packsRemaining = packCollectionBalanceData
    ? parseInt(
        packCollectionBalanceData?.find((v) => v.tokenID === "1")?.balance ||
          "0",
      )
    : undefined;

  const {
    data: itemsCollectionBalanceData,
    isLoading: itemCollectionBalanceIsLoading,
    refetch: refetchItemsCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: itemsContractAddress,
  });

  useEffect(() => {
    if (debugPackState === "success") {
      setDebugPackState("idle");
      setDebugPackCount(debugPackCount + 1);
      refetchItemsCollectionBalance();
      refetchPackCollectionBalance();
    } else if (debugPackState === "commiting") {
      setDebugPackData(undefined);
    }
  });

  return (
    <div className="flex flex-col gap-12">
      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        <Card
          collapsable
          title="Pack opening debug"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
          {packsRemaining === undefined ? (
            <div>Loading your packs...</div>
          ) : (
            <div>
              You have {packsRemaining} pack{packsRemaining === 1 ? "" : "s"}
            </div>
          )}
          {packsRemaining !== undefined &&
          packsRemaining > 0 &&
          (debugPackState === "idle" || debugPackState === "fail") ? (
            <Button
              variant="primary"
              onClick={() => {
                setDebugPackState("startingOpeningProcess");
              }}
            >
              {`${debugPackState === "fail" ? "Retry Opening Pack" : "Open Pack"} ${debugPackCount + 1}`}
            </Button>
          ) : (
            <div>{debugPackState}</div>
          )}
          <div className="flex flex-row gap-3">
            {debugPackState !== "idle" &&
              debugPackState !== "success" &&
              debugPackState !== "fail" && (
                <PackOpener
                  key={debugPackCount}
                  id={debugPackCount}
                  address={userAddress}
                  packState={debugPackState}
                  setPackState={setDebugPackState}
                  setPackData={setDebugPackData}
                />
              )}
          </div>
          {debugPackData && (
            <>
              <div> Pack Contents:</div>
              {debugPackData.tokenIds.map((v, i) => (
                <div key={i}>
                  Token {v} (x{debugPackData.amounts[i]})
                </div>
              ))}
            </>
          )}
          {packsRemaining === 0 && (
            <MintPacks refetchPackCollection={refetchPackCollectionBalance} />
          )}
          <UserInventory
            title={"Inventory"}
            itemsCollectionBalanceData={itemsCollectionBalanceData}
            itemCollectionBalanceIsLoading={itemCollectionBalanceIsLoading}
            refetchItemsCollectionBalance={refetchItemsCollectionBalance}
          />
          <BurnItems
            refetchItemsCollection={refetchItemsCollectionBalance}
            itemBalances={itemsCollectionBalanceData}
          />
        </Card>
      </Card>
    </div>
  );
};

export default Connected;
