import { AddressList } from "../components/AddressList";
import { AddressListItem } from "../components/AddressList/AddressListItem";
import { getChain } from "../configs/erc20/getChain";
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

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress, chainId } = props;

  const addressListData: Array<[string, string]> = [];

  if (userAddress) {
    addressListData.push(["User Address", userAddress]);
  }
  addressListData.push(["Items Contract", itemsContractAddress]);
  addressListData.push(["Pack Contract", packContractAddress]);

  const urlBase = chainId ? getChain(chainId)?.explorerUrl : undefined;
  const {
    data: packData,
    isLoading,
    isError,
    openPack,
  } = useOpenPack({ address: userAddress });

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
  if (packData) {
    for (let i = 0; i < packData.tokenIds.length; i++) {
      for (let j = 0; j < packData.amounts[i]; j++) {
        packTokens.push(packData.tokenIds[i]);
      }
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <View3D>
        <ItemViewer3D>
          {packChest && Number(packChest.balance) > 0 && packModelUri ? (
            <GenericItem gltfUrl={packModelUri} />
          ) : null}
          {tokenMetadatas &&
            packTokens
              .map((id, i) => {
                const v = tokenMetadatas.find((v) => v.tokenId === id);
                return (
                  v?.animation_url && (
                    <GenericItem
                      key={`${v.tokenId}-${i}`}
                      gltfUrl={v.animation_url}
                    />
                  )
                );
              })
              .filter((v) => v)}
        </ItemViewer3D>
      </View3D>
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
        <div>
          {packTokens.map((id, i) => (
            <p key={`token-${id}-${i}`}>id</p>
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
                    url={urlBase ? `${urlBase}address/` : ""}
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
