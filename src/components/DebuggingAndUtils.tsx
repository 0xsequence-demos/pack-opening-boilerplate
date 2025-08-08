import { Spinner, Switch } from "@0xsequence/design-system";
import {
  Button,
  Card,
  Select,
} from "@0xsequence-demos/boilerplate-design-system";
import { PackOpener } from "./PackOpener";
// import MintPacks from "./MintPacks";
import BurnItems from "./BurnItems";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PackOpeningState } from "../helpers/packOpeningStates";
import { PackData } from "../helpers/PackData";
import { TokenBalance, TokenMetadata } from "@0xsequence/indexer";
import {
  ChestAnimationState,
  chestAnimationStates,
} from "../helpers/chestAnimationStates";
import { useRef } from "react";

export default function DebuggingAndUtils(props: {
  packsRemaining: TokenBalance[] | undefined;
  userAddress: `0x${string}`;
  refetchItemsCollectionBalance: () => void;
  refetchPackCollectionBalance: () => void;
  itemsCollectionBalanceData: TokenBalance[] | undefined;
  animOverride?: ChestAnimationState;
  setAnimOverride: Dispatch<SetStateAction<ChestAnimationState | undefined>>;
  packMetadatas: TokenMetadata[] | undefined;
}) {
  const {
    packsRemaining,
    refetchItemsCollectionBalance,
    refetchPackCollectionBalance,
    itemsCollectionBalanceData,
    userAddress,
    animOverride,
    setAnimOverride,
    packMetadatas,
  } = props;

  const packsRemainingRef = useRef(packsRemaining);

  useEffect(() => {
    packsRemainingRef.current = packsRemaining;
  }, [packsRemaining]);

  const [autoOpen, setAutoOpen] = useState(false);

  const [debugPackState, setDebugPackState] =
    useState<PackOpeningState>("idle");

  const debugPackStateRef = useRef(debugPackState);
  useEffect(() => {
    debugPackStateRef.current = debugPackState;
  }, [debugPackState]);

  const [debugPackData, setDebugPackData] = useState<PackData | undefined>();
  const [currentDebugPackId, setCurrentDebugPackId] = useState(1);

  const [packPerformanceHistory, setPackPerformanceHistory] = useState<
    number[]
  >([]);

  const [lastStartTime, setLastStartTime] = useState(0);

  useEffect(() => {
    if (debugPackState === "startingOpeningProcess") {
      setLastStartTime(Date.now());
    }
  }, [debugPackState]);

  useEffect(() => {
    let openAnother = false;
    if (debugPackState === "success") {
      const now = Date.now();
      setPackPerformanceHistory(
        packPerformanceHistory.concat([now - lastStartTime]),
      );
      setCurrentDebugPackId(currentDebugPackId + 1);
      refetchItemsCollectionBalance();
      refetchPackCollectionBalance();
      setDebugPackState("idle");
      openAnother = autoOpen;
      // openAnother = autoOpen && packsRemaining > 0;
    } else if (debugPackState === "commiting") {
      setDebugPackData(undefined);
    } else if (debugPackState === "idle") {
      openAnother = autoOpen;
      // openAnother = autoOpen && packsRemaining > 0;
    }
    if (openAnother) {
      setTimeout(() => {
        if (
          debugPackStateRef.current === "idle"
          // debugPackStateRef.current === "idle" &&
          // packsRemainingRef.current > 0
        ) {
          setDebugPackState("startingOpeningProcess");
        }
      }, 4000);
    }
  }, [debugPackState, autoOpen]);

  const packPerformanceMax = packPerformanceHistory.reduce(
    (pv, cv) => Math.max(cv, pv),
    0,
  );

  const [packTokenId, setPackTokenId] = useState("0");

  const packBalance = parseInt(
    packsRemaining?.find((tb) => tb.tokenID! === packTokenId)?.balance || "0",
  );

  return (
    <>
      <b>Testing & Debugging:</b>
      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        <Card
          collapsable
          title="Headless Pack Opening"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
          {!packsRemaining || !packMetadatas ? (
            <div>Loading your packs...</div>
          ) : (
            <>
              <Select
                defaultValue={packTokenId}
                options={packMetadatas.map((v) => {
                  return { value: v.tokenId, label: `#${v.tokenId} ${v.name}` };
                })}
                onValueChange={(opt) => setPackTokenId(opt)}
              ></Select>
              <div>
                You have {packBalance} pack
                {packBalance === 1 ? "" : "s"}
              </div>
            </>
          )}
          <div className="flex justify-between p-2">
            <Switch
              label="Auto-Open"
              checked={autoOpen}
              onCheckedChange={setAutoOpen}
            />
            {packBalance > 0 &&
              !autoOpen &&
              (debugPackState === "idle" || debugPackState === "fail" ? (
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
              ))}
          </div>
          <div className="flex flex-row gap-3">
            {debugPackState !== "idle" &&
              debugPackState !== "success" &&
              debugPackState !== "fail" && (
                <PackOpener
                  key={currentDebugPackId}
                  id={currentDebugPackId}
                  packTokenId={packTokenId}
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
              {debugPackData.map((v, i) => (
                <div key={i}>
                  Token {v.contract} ({v.type}) #{v.tokenId} (x{v.amount})
                </div>
              ))}
            </>
          )}
          {/* {packsRemaining === 0 && (
            <MintPacks refetchPackCollection={refetchPackCollectionBalance} />
          )} */}
          {packPerformanceHistory.length > 0 && (
            <div className="bg-gray-600 scroll-auto h-40 overflow-scroll rounded-md">
              <>
                <div className="px-2">
                  Pack Performance History (durations):
                </div>
                {packPerformanceHistory.map((v, i) => {
                  const ratio = v / packPerformanceMax;
                  const ratioColor = ratio * ratio;
                  return (
                    <div
                      key={i}
                      className="m-1 px-2 transition-all duration-1000"
                      style={{
                        width: `${ratio * 100}%`,
                        backgroundColor: `rgb(${~~(Math.sqrt(ratioColor) * 200)}, ${~~((1 - ratioColor * ratioColor) * 100 + 100)}, 0)`,
                      }}
                    >
                      {i + 1}:{"\u00A0"}
                      {(v * 0.001).toFixed(1)}s
                    </div>
                  );
                })}
              </>
            </div>
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
