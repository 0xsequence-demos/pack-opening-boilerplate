import { AddressList } from "../components/AddressList";
import { AddressListItem } from "../components/AddressList/AddressListItem";
import { Button, Card, Group } from "boilerplate-design-system";
import { Address } from "viem";
import UserInventory from "../components/UserInventory";
import { useOpenPack } from "../hooks/useOpenPack";
import {
  initialChainId,
  itemsContractAddress,
  packContractAddress,
} from "../configs/chains";
import View3D from "../components/3d/View3D";
import ItemViewer3D from "../components/3d/ItemViewer3D";
import GenericItem from "../components/3d/GenericItem";
import { useCollectionBalance } from "../hooks/data";
import MintPacks from "../components/MintPacks";
import { useGetTokenMetadata } from "@0xsequence/hooks";
import { allNetworks } from "@0xsequence/network";
import { useState } from "react";
import Chest from "../components/3d/Chest";

const animationStates = [
  "idle",
  "unlocking",
  "strugglingToOpen",
  "opening",
  "hasProblem",
] as const;

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress, chainId } = props;

  const addressListData: Array<[string, string]> = [];

  const [animOverride, setAnimOverride] = useState<
    (typeof animationStates)[number] | undefined
  >(undefined);

  if (userAddress) {
    addressListData.push(["User Address", userAddress]);
  }
  addressListData.push(["Items Contract", itemsContractAddress]);
  addressListData.push(["Pack Contract", packContractAddress]);

  const urlBase = chainId
    ? allNetworks.find((chain) => chain.chainId === chainId)?.blockExplorer
        ?.rootUrl
    : undefined;

  const { packData, isLoading, isWaitingForReveal, isError, openPack } =
    useOpenPack({ address: userAddress });

  const {
    data: packCollectionBalanceData,
    refetch: refetchPackCollectionBalance,
  } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: packContractAddress,
  });

  const packChest = packCollectionBalanceData?.find(
    (item) => item.tokenID === "1",
  );

  const packModelUri = packChest?.tokenMetadata?.animation_url;

  const { data: tokenMetadatas } = useGetTokenMetadata({
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

  const count = packCollectionBalanceData
    ? packCollectionBalanceData.reduce((pv, cv) => Number(cv.balance) + pv, 0)
    : "";

  const packTokens: string[] = [];
  if (packData && !isLoading && !isWaitingForReveal) {
    for (let i = 0; i < packData.tokenIds.length; i++) {
      for (let j = 0; j < packData.amounts[i]; j++) {
        packTokens.push(packData.tokenIds[i]);
      }
    }
  }

  return (
    <div className="flex flex-col gap-12">
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
      <div className="relative">
        <View3D>
          <ItemViewer3D>
            {packChest && Number(packChest.balance) > 0 && packModelUri ? (
              <Chest
                gltfUrl={packModelUri}
                position={[0, 0, -2]}
                scale={1}
                busy={
                  (animOverride === undefined && !!isLoading) ||
                  animOverride === "unlocking"
                }
                shaking={
                  (animOverride === undefined && isWaitingForReveal) ||
                  animOverride === "strugglingToOpen"
                }
                open={
                  (animOverride === undefined && !!packData) ||
                  animOverride === "opening"
                }
                underlit={
                  (animOverride === undefined && isWaitingForReveal) ||
                  animOverride === "strugglingToOpen"
                }
                red={
                  (animOverride === undefined && isError) ||
                  animOverride === "hasProblem"
                }
                innerLight={true}
              />
            ) : null}
            {tokenMetadatas &&
              packTokens
                .map((id, i) => {
                  const v = tokenMetadatas.find((v) => v.tokenId === id);

                  //hexagonal spiral algorithm
                  let x = 0;
                  let y = 0;

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

                  return (
                    v?.animation_url && (
                      <GenericItem
                        key={`${v.tokenId}-${i}`}
                        gltfUrl={v.animation_url}
                        position={[x, y, 2]}
                        scale={0.25}
                      />
                    )
                  );
                })
                .filter((v) => v)}
          </ItemViewer3D>
        </View3D>
        {count && count > 0 && (
          <>
            <div className="absolute inset-0 flex items-center justify-center mt-60">
              {!isLoading && !isWaitingForReveal && (
                <Button variant="primary" onClick={() => openPack()}>
                  {isError
                    ? "Retry Opening Pack"
                    : packData
                      ? "Open Another Pack"
                      : "Open Pack"}
                </Button>
              )}
            </div>
            <div className="absolute bottom-4 left-4 text-36 font-heavy">
              x{count}
            </div>
          </>
        )}
      </div>
      <Group title="Pack Opening">
        {count === 0 ? (
          <MintPacks
            refetchPackCollection={() => refetchPackCollectionBalance()}
          />
        ) : (
          <>
            <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
              You own {count} pack{count === 1 ? "" : "s"}
            </Card>
            <Button variant="primary" onClick={() => openPack()}>
              Open a Pack
            </Button>
          </>
        )}
        <p>isLoading: {isLoading ? "yes" : "..."}</p>
        <p>isWaitingForReveal: {isWaitingForReveal ? "yes" : "..."}</p>
        <div>
          {packTokens.map((id, i) => (
            <p key={`token-${id}-${i}`}>{id}</p>
          ))}
        </div>
        <p>isError: {isError ? "yes" : "..."}</p>

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
                    url={urlBase ? `${urlBase}/address/` : ""}
                  />
                ))}
              </AddressList>
            </Card>
          )}
        </Card>
      </Group>
      <Group>
        <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
          <UserInventory
            userAddress={userAddress}
            chainId={chainId}
            contractAddress={itemsContractAddress}
            title={"Collectibles"}
          />
        </Card>
      </Group>
    </div>
  );
};

export default Connected;
