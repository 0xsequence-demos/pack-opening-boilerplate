import { useEffect, useState } from "react";
import ItemViewer3D from "./ItemViewer3D";
import OpenableChest from "./OpenableChest";
import View3D from "./View3D";
import MintPacks from "../MintPacks";
import { ChestState } from "../../helpers/chestStates";
import { ChestAnimationState } from "../../helpers/chestAnimationStates";
import { Button } from "@0xsequence-demos/boilerplate-design-system";
import { TokenMetadata } from "@0xsequence/indexer";

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
                packMetadata={packMetadata}
                animOverride={animOverride}
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
    </div>
  );
}
