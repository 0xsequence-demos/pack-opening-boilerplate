import { Spinner, Switch } from "@0xsequence/design-system";
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

  const [autoOpen, setAutoOpen] = useState(false);

  const [debugPackState, setDebugPackState] =
    useState<PackOpeningState>("idle");

  const [debugPackData, setDebugPackData] = useState<PackData | undefined>();
  const [currentDebugPackId, setCurrentDebugPackId] = useState(1);

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
    : -1;

  const {
    data: itemsCollectionBalanceData,
    isLoading: itemCollectionBalanceIsLoading,
    refetch: refetchItemsCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: itemsContractAddress,
  });

  useEffect(() => {
    let openAnother = false;
    if (debugPackState === "success") {
      setCurrentDebugPackId(currentDebugPackId + 1);
      refetchItemsCollectionBalance();
      refetchPackCollectionBalance();
      setDebugPackState("idle");
      openAnother = autoOpen && packsRemaining > 0;
    } else if (debugPackState === "commiting") {
      setDebugPackData(undefined);
    } else if (debugPackState === "idle") {
      openAnother = autoOpen && packsRemaining > 0;
    }
    if (openAnother) {
      setTimeout(() => {
        if (debugPackState === "idle" && packsRemaining > 0) {
          setDebugPackState("startingOpeningProcess");
        }
      }, 3000);
    }
  }, [debugPackState, autoOpen]);

  return (
    <div className="flex flex-col gap-12">
      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        <Card
          collapsable
          open={true}
          title="Packs"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
          {packsRemaining === undefined ? (
            <div>Loading your packs...</div>
          ) : (
            <div>
              You have {packsRemaining} pack{packsRemaining === 1 ? "" : "s"}
            </div>
          )}

          <Switch
            label="Auto-Open"
            checked={autoOpen}
            onCheckedChange={setAutoOpen}
          />
          {packsRemaining !== undefined &&
          packsRemaining > 0 &&
          !autoOpen &&
          (debugPackState === "idle" || debugPackState === "fail") ? (
            <Button
              variant="primary"
              onClick={() => {
                setDebugPackState("startingOpeningProcess");
              }}
            >
              {`${debugPackState === "fail" ? "Retry Opening Pack" : "Open Pack"} ${currentDebugPackId}`}
            </Button>
          ) : (
            <div style={{ display: "flex" }}>
              <Spinner size={"md"} />
              <div className="px-4">
                Pack {currentDebugPackId}: {debugPackState}
              </div>
            </div>
          )}
          <div className="flex flex-row gap-3">
            {debugPackState !== "idle" &&
              debugPackState !== "success" &&
              debugPackState !== "fail" && (
                <PackOpener
                  key={currentDebugPackId}
                  id={currentDebugPackId}
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
        </Card>
        <UserInventory
          title={"Demo Items"}
          itemsCollectionBalanceData={itemsCollectionBalanceData}
          itemCollectionBalanceIsLoading={itemCollectionBalanceIsLoading}
          refetchItemsCollectionBalance={refetchItemsCollectionBalance}
        />
        <Card
          collapsable
          title="Item Utils"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
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
