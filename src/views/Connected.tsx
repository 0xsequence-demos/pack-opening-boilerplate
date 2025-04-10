import { useCollectionBalance } from "../hooks/data";
import { AddressList } from "../components/AddressList";
import { AddressListItem } from "../components/AddressList/AddressListItem";
import { getChain } from "../configs/erc20/getChain";
import { useSaleCurrency } from "../contexts/SaleCurrencyContext";
import { nftTokenAddress, salesContractAddress } from "../configs/chains";
import { Card, Group } from "boilerplate-design-system";
import SaleInfo from "../components/SaleInfo";
import ItemForSale from "../components/ItemForSale";
import { Address } from "viem";
import UserInventory from "../components/UserInventory";
import { useSaleProgress } from "../contexts/SaleProgressContext";

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress, chainId } = props;

  const { info: currencyInfo } = useSaleCurrency();

  const saleProgress = useSaleProgress();

  const { refetch: refetchCollectionBalance } = useCollectionBalance({
    accountAddress: userAddress,
  });

  const addressListData: Array<[string, string]> = [];

  if (userAddress) {
    addressListData.push(["User Address", userAddress]);
  }
  addressListData.push(["Sales Contract", salesContractAddress]);
  addressListData.push(["NFT Token Contract", nftTokenAddress]);
  if (currencyInfo) {
    addressListData.push(["Payment Currency Address", currencyInfo.address]);
  }

  const urlBase = chainId ? getChain(chainId)?.explorerUrl : undefined;

  return (
    <div className="flex flex-col gap-12">
      <Group title="Primary Sale Info">
        <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
          <div className="p-4">
            <SaleInfo />
          </div>
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
          <ItemForSale
            onPurchaseSuccess={() => {
              refetchCollectionBalance();
              saleProgress.refetchTotalMinted();
            }}
          />
          <UserInventory userAddress={userAddress} chainId={chainId} />
        </Card>
      </Group>
    </div>
  );
};

export default Connected;
