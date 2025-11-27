import { useEffect, useMemo, useState } from "react";
import ItemViewer3D from "./ItemViewer3D";
import OpenableChest from "./OpenableChest";
import View3D from "./View3D";
import MintPacks from "../MintPacks";
import { ChestState } from "../../helpers/chestStates";
import { ChestAnimationState } from "../../helpers/chestAnimationStates";
import { Button } from "@0xsequence-demos/boilerplate-design-system";
import { TokenMetadata } from "@0xsequence/indexer";
import { PackData } from "../../helpers/PackData";

export default function PackOpeningInteractive3D(props: {
  userAddress: `0x${string}`;
  packMetadata: TokenMetadata;
  packsRemaining: number;
  refetchItemsCollectionsBalance: () => void;
  refetchPackCollectionBalance: () => void;
  animOverride?: ChestAnimationState;
}) {
  const {
    packsRemaining,
    userAddress,
    refetchItemsCollectionsBalance,
    refetchPackCollectionBalance,
    animOverride,
    packMetadata,
  } = props;

  const [openChestInitiated, setOpenChestInitiated] = useState(false);
  const [focusedChestState, setFocusedChestState] =
    useState<ChestState>("idle");

  const [chestSuccessCount, setChestSuccessCount] = useState(0);
  const [lastOpenedPack, setLastOpenedPack] = useState<PackData | undefined>();

  useEffect(() => {
    if (lastOpenedPack) {
      console.log("Pack opened with items:", lastOpenedPack);
    }
  }, [lastOpenedPack]);

  useEffect(() => {
    if (focusedChestState === "opened") {
      refetchItemsCollectionsBalance();
      setTimeout(() => {
        setChestSuccessCount(chestSuccessCount + 1);
      }, 5000);
    }
  }, [focusedChestState]);

  return (
    <div className="relative">
      <View3D lookUp={focusedChestState === "opened"}>
        <ItemViewer3D>
          {Array.from({ length: 2 }, (_v, i) => {
            if (chestSuccessCount === 0 && i === 0) {
              return null;
            }
            if (
              packsRemaining === 0 &&
              i === 1 &&
              focusedChestState === "idle"
            ) {
              return null;
            }
            const j = i + chestSuccessCount;

            const openInitiated = i === 1 && openChestInitiated;
            if (openInitiated) {
              console.log("Setting openChestInitiated to false after opening");
              setTimeout(() => setOpenChestInitiated(false), 2000);
            }
            return (
              <OpenableChest
                key={j}
                id={j}
                x={i * 10 - 10}
                y={0}
                z={-2}
                userAddress={userAddress}
                showPrizes={i === 1}
                openInitiated={openInitiated}
                refetchPackCollectionBalance={refetchPackCollectionBalance}
                setChestState={setFocusedChestState}
                packMetadata={packMetadata}
                animOverride={animOverride}
                onPackOpened={setLastOpenedPack}
              />
            );
          })}
        </ItemViewer3D>
      </View3D>
      {packsRemaining > 0 ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center mt-60">
            {focusedChestState !== "busy" &&
              focusedChestState !== "opened" &&
              !openChestInitiated && (
                <Button
                  variant="primary"
                  onClick={() => {
                    console.log("Button clicked: Open Pack");
                    console.log("packsRemaining:", packsRemaining);
                    setOpenChestInitiated(true);
                  }}
                  data-testid="open-pack-3d"
                >
                  {focusedChestState === "failed"
                    ? "Retry Opening Pack"
                    : "Open Pack"}
                </Button>
              )}
          </div>
          <div className="absolute bottom-4 left-4 text-36 font-heavy">
            x{packsRemaining}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <MintPacks
            refetchPackCollection={() => refetchPackCollectionBalance()}
            tokenId={packMetadata.tokenId}
          />
        </div>
      )}
      {useMemo(
        () =>
          lastOpenedPack && lastOpenedPack.length > 0 ? (
            <div
              data-testid="pack-opened-items"
              style={{
                position: "fixed",
                inset: 0,
                opacity: 0,
                pointerEvents: "none",
                visibility: "hidden",
              }}
              aria-hidden="true"
            >
              {lastOpenedPack.map((item, idx) => (
                <span
                  key={`${item.contract}-${item.tokenId.toString()}-${idx}`}
                  data-testid="pack-opened-item"
                >
                  {item.contract}:{item.tokenId.toString()}:{item.type}
                </span>
              ))}
            </div>
          ) : null,
        [lastOpenedPack],
      )}
    </div>
  );
}
