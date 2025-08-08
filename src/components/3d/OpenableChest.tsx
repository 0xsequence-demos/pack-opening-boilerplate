import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Chest from "./Chest";
import GenericItem from "./GenericItem";
import { TokenMetadata } from "@0xsequence/indexer";
import { ChestAnimationState } from "../../helpers/chestAnimationStates";
import { ChestState } from "../../helpers/chestStates";
import { PackOpeningState } from "../../helpers/packOpeningStates";
import { PackData, PackDataItem } from "../../helpers/PackData";
import { PackOpener } from "../PackOpener";
import { useGetTokenMetadata } from "@0xsequence/hooks";
import {
  initialChainId,
  itemsContract2Address,
  itemsContractAddress,
} from "../../configs/chains";

export default function OpenableChest(props: {
  id: number;
  x: number;
  y: number;
  z: number;
  userAddress: `0x${string}`;
  openInitiated: boolean;
  showPrizes: boolean;
  packMetadata: TokenMetadata;
  animOverride?: ChestAnimationState;
  refetchPackCollectionBalance: () => void;
  setChestState: Dispatch<SetStateAction<ChestState>>;
}) {
  const {
    id,
    userAddress,
    openInitiated,
    packMetadata,
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

  const chestGltfUri = packMetadata.animation_url;

  const packItems: PackDataItem[] = [];
  if (packData && packState === "success" && showPrizes) {
    for (let i = 0; i < packData.length; i++) {
      for (let j = 0; j < packData[i].amount; j++) {
        packItems.push(packData[i]);
      }
    }
  }

  const tokenIds1 =
    packData
      ?.filter((v) => v.contract === itemsContractAddress)
      .map((v) => v.tokenId.toString()) || [];
  const tokenIds2 =
    packData
      ?.filter((v) => v.contract === itemsContract2Address)
      .map((v) => v.tokenId.toString()) || [];

  const { data: itemMetadatas } = useGetTokenMetadata({
    chainID: String(initialChainId),
    contractAddress: itemsContractAddress,
    tokenIDs: tokenIds1,
  });
  const { data: item2Metadatas } = useGetTokenMetadata({
    chainID: String(initialChainId),
    contractAddress: itemsContract2Address,
    tokenIDs: tokenIds2,
  });

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
            packTokenId={packMetadata.tokenId}
            address={userAddress}
            packState={packState}
            setPackState={setPackState}
            setPackData={setPackData}
          />
        )}
      {packMetadata && chestGltfUri ? (
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
        item2Metadatas &&
        packItems
          .map((packItem, i) => {
            const v =
              itemMetadatas.find(
                (v) =>
                  packItem.contract === itemsContractAddress &&
                  v.tokenId === packItem.tokenId.toString(),
              ) ||
              item2Metadatas.find(
                (v) =>
                  packItem.contract === itemsContract2Address &&
                  v.tokenId === packItem.tokenId.toString(),
              );

            let x = 0;
            let y = 0;
            let z = packData ? 2.5 : 0;

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
              y = 4;
              z = 4;
            }

            return (
              v?.animation_url && (
                <GenericItem
                  key={`${v.tokenId}-${i}`}
                  gltfUrl={v.animation_url}
                  x={x * 1.2}
                  y={y * 1.2 + 3.75}
                  z={z}
                  scale={v.properties?.type === "Resource" ? 0.2 : 0.4}
                />
              )
            );
          })
          .filter((v) => v)}
    </>
  );
}
