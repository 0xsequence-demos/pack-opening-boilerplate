import { Spinner, Switch } from "@0xsequence/design-system";
import { Button, Card } from "boilerplate-design-system";
import { PackOpener } from "./PackOpener";
import MintPacks from "./MintPacks";
import BurnItems from "./BurnItems";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PackOpeningState } from "../helpers/packOpeningStates";
import { PackData } from "../helpers/PackData";
import { TokenBalance } from "@0xsequence/indexer";
import {
  ChestAnimationState,
  chestAnimationStates,
} from "../helpers/chestAnimationStates";

export default function DebuggingAndUtils(props: {
  packsRemaining: number;
  userAddress: `0x${string}`;
  refetchItemsCollectionBalance: () => void;
  refetchPackCollectionBalance: () => void;
  itemsCollectionBalanceData: TokenBalance[] | undefined;
  animOverride?: ChestAnimationState;
  setAnimOverride: Dispatch<SetStateAction<ChestAnimationState | undefined>>;
}) {
  const {
    packsRemaining,
    refetchItemsCollectionBalance,
    refetchPackCollectionBalance,
    itemsCollectionBalanceData,
    userAddress,
    animOverride,
    setAnimOverride,
  } = props;

  const [autoOpen, setAutoOpen] = useState(false);

  const [debugPackState, setDebugPackState] =
    useState<PackOpeningState>("idle");

  const [debugPackData, setDebugPackData] = useState<PackData | undefined>();
  const [currentDebugPackId, setCurrentDebugPackId] = useState(1);

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
    <>
      <b>Testing & Debugging:</b>
      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        <Card
          collapsable
          title="Headless Pack Opening"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
          {packsRemaining === -1 ? (
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

        <Card
          collapsable
          title="Animation State"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
          <div className="flex flex-row gap-3">
            {chestAnimationStates.map((i) => {
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
    </>
  );
}
