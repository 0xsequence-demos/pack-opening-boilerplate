import { Card } from "@0xsequence-demos/boilerplate-design-system";
import UserInventory from "./UserInventory";
import { AddressList } from "./AddressList";
import { AddressListItem } from "./AddressList/AddressListItem";
import { itemsContractAddress, packContractAddress } from "../configs/chains";
import { allNetworks, ChainId } from "@0xsequence/network";
import { TokenBalance } from "@0xsequence/indexer";

export default function ExtraInfo(props: {
  itemsCollectionBalanceData: TokenBalance[] | undefined;
  itemsCollection2BalanceData: TokenBalance[] | undefined;
  itemCollectionBalanceIsLoading: boolean;
  userAddress: `0x${string}`;
  chainId: ChainId;
}) {
  const {
    userAddress,
    chainId,
    itemCollectionBalanceIsLoading,
    itemsCollectionBalanceData,
    itemsCollection2BalanceData,
  } = props;
  const addressListData: Array<[string, string]> = [];
  if (userAddress) {
    addressListData.push(["User Address", userAddress]);
  }
  addressListData.push(["Items Contract", itemsContractAddress]);
  addressListData.push(["Pack Contract", packContractAddress]);

  const urlBase = chainId
    ? allNetworks.find((chain) => chain.chainId === chainId)?.blockExplorer
        ?.rootUrl
    : undefined;

  return (
    <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
      <UserInventory
        title={"Demo Items"}
        itemsCollectionBalanceData={itemsCollectionBalanceData}
        itemsCollection2BalanceData={itemsCollection2BalanceData}
        itemCollectionBalanceIsLoading={itemCollectionBalanceIsLoading}
      />
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
  );
}
