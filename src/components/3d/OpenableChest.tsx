import { useEffect, useState } from "react";
import Chest from "./Chest";
import GenericItem from "./GenericItem";
import { TokenMetadata } from "@0xsequence/indexer";
import { animationStates } from "../../views/chestAnimationStates";
import { chestStates } from "../../views/chestStates";
import { PackOpeningState } from "../../views/packOpeningStates";
import { PackData } from "../../hooks/PackData";
import { PackOpener } from "../../hooks/PackOpener";

export default function OpenableChest(props: {
  id: number;
  x: number;
  y: number;
  z: number;
  userAddress: `0x${string}`;
  openInitiated: boolean;
  showPrizes: boolean;
  packMetadatas: TokenMetadata[] | undefined;
  itemMetadatas: TokenMetadata[] | undefined;
  animOverride: (typeof animationStates)[number] | undefined;
  refetchPackCollectionBalance: () => void;
  setChestState: (chestState: (typeof chestStates)[number]) => void;
}) {
  const {
    id,
    userAddress,
    openInitiated,
    itemMetadatas,
    packMetadatas,
    animOverride,
    refetchPackCollectionBalance,
    showPrizes,
    setChestState,
    x,
    y,
    z,
  } = props;

  const [packState, setPackState] = useState<PackOpeningState>("idle");
  useEffect(() => {
    if (openInitiated && (packState === "idle" || packState === "fail")) {
      setPackState("startingOpeningProcess");
    }
  }, [openInitiated]);
  const [packData, setPackData] = useState<PackData | undefined>();

  useEffect(() => {
    switch (packState) {
      case "idle":
        setChestState("idle");
        break;
      case "commiting":
      case "receiving":
      case "revealing":
        setChestState("busy");
        break;
      case "success":
        setChestState("opened");
        break;
      case "fail":
        setChestState("failed");
        break;
    }
  }, [packState]);

  useEffect(() => {
    if (packData) {
      refetchPackCollectionBalance();
    }
  }, [packData]);

  const packChestTokenMetadata = packMetadatas?.find(
    (item) => item.tokenId === "1",
  );

  const chestGltfUri = packChestTokenMetadata?.animation_url;

  const packTokens: string[] = [];
  if (packData && packState === "success" && showPrizes) {
    for (let i = 0; i < packData.tokenIds.length; i++) {
      for (let j = 0; j < packData.amounts[i]; j++) {
        packTokens.push(packData.tokenIds[i]);
      }
    }
  }

  const [away, setAway] = useState(false);
  useEffect(() => {
    if (packData) {
      setTimeout(() => {
        setAway(true);
      }, 4000);
    }
  }, [packData]);

  return (
    <>
      {packState !== "idle" &&
        packState !== "success" &&
        packState !== "fail" && (
          <PackOpener
            id={id}
            address={userAddress}
            packState={packState}
            setPackState={setPackState}
            setPackData={setPackData}
          />
        )}
      {packChestTokenMetadata && chestGltfUri ? (
        <Chest
          gltfUrl={chestGltfUri}
          x={x}
          y={y}
          z={z}
          scale={1}
          busy={
            (animOverride === undefined && packState === "commiting") ||
            animOverride === "unlocking"
          }
          shaking={
            (animOverride === undefined &&
              (packState === "revealing" || packState === "receiving")) ||
            animOverride === "strugglingToOpen"
          }
          open={
            (animOverride === undefined && !!packData) ||
            animOverride === "opening"
          }
          innerLight={
            (animOverride === undefined && !!packData) ||
            animOverride === "opening"
          }
          underlit={
            (animOverride === undefined &&
              (packState === "revealing" || packState === "receiving")) ||
            animOverride === "strugglingToOpen"
          }
          red={
            (animOverride === undefined && packState === "fail") ||
            animOverride === "hasProblem"
          }
        />
      ) : null}
      {itemMetadatas &&
        packTokens
          .map((id, i) => {
            const v = itemMetadatas.find((v) => v.tokenId === id);

            let x = 0;
            let y = 0;

            //hexagonal spiral algorithm
            if (i > 0) {
              const layer = Math.round(Math.sqrt(i / 3.0));

              const firstIdxInLayer = 3 * layer * (layer - 1) + 1;
              const side = (i - firstIdxInLayer) / layer;
              const idx = (i - firstIdxInLayer) % layer;
              x =
                layer * Math.cos(((side - 1) * Math.PI) / 3) +
                (idx + 1) * Math.cos(((side + 1) * Math.PI) / 3);
              y =
                -layer * Math.sin(((side - 1) * Math.PI) / 3) -
                (idx + 1) * Math.sin(((side + 1) * Math.PI) / 3);
            }

            if (away) {
              x = 3;
              y = 3;
            }

            return (
              v?.animation_url && (
                <GenericItem
                  key={`${v.tokenId}-${i}`}
                  gltfUrl={v.animation_url}
                  x={x}
                  y={y}
                  z={packData ? 2 : 0}
                  scale={v.properties?.type === "Resource" ? 0.15 : 0.35}
                />
              )
            );
          })
          .filter((v) => v)}
    </>
  );
}
