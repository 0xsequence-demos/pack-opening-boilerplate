import { AddressList } from "../components/AddressList";
import { AddressListItem } from "../components/AddressList/AddressListItem";
import { getChain } from "../configs/erc20/getChain";
import { Button, Card, Group } from "boilerplate-design-system";
import { Address } from "viem";
import UserInventory from "../components/UserInventory";
import { useOpenPack } from "../hooks/useOpenPack";
import { itemsContractAddress, packContractAddress } from "../configs/chains";
import View3D from "../components/3d/View3D";
import ItemViewer3D from "../components/3d/ItemViewer3D";
import GenericItem from "../components/3d/GenericItem";
import { useCollectionBalance } from "../hooks/data";

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

  const { data: packCollectionBalanceData } = useCollectionBalance({
    accountAddress: userAddress,
    contractAddress: packContractAddress,
  });

  const packChest = packCollectionBalanceData?.find(
    (item) => item.tokenID === "1",
  );

  const packModelUri = packChest?.tokenMetadata?.animation_url;

  console.log(packChest);

  return (
    <div className="flex flex-col gap-12">
      <View3D>
        <ItemViewer3D>
          {packChest && Number(packChest.balance) > 0 && packModelUri ? (
            <GenericItem gltfUrl={packModelUri} />
          ) : null}
        </ItemViewer3D>
      </View3D>
      <Group title="Pack Opening">
        <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
          <UserInventory
            userAddress={userAddress}
            chainId={chainId}
            contractAddress={packContractAddress}
            title={"Packs"}
          />
        </Card>
        <Button variant="primary" onClick={() => openPack()}>
          Open a Pack
        </Button>
        <p>isLoading: {isLoading ? "yes" : "..."}</p>
        <p>isError: {isError ? "yes" : "..."}</p>
        <div>
          {packData.map((v, i) => {
            return <p key={`token-${i}`}>{v.tokenID}</p>;
            // return "ha";
          })}
        </div>

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
