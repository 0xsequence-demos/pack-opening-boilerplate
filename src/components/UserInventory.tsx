import { TokenBalance } from "@0xsequence/indexer";
import { Card, Image } from "boilerplate-design-system";

export default function UserInventory(props: {
  title: string;
  itemsCollectionBalanceData: TokenBalance[] | undefined;
  itemCollectionBalanceIsLoading: boolean;
  refetchItemsCollectionBalance: () => void;
}) {
  const { title, itemCollectionBalanceIsLoading, itemsCollectionBalanceData } =
    props;

  const count = itemsCollectionBalanceData
    ? itemsCollectionBalanceData.reduce((pv, cv) => Number(cv.balance) + pv, 0)
    : "";

  const countUnique = itemsCollectionBalanceData
    ? "(" + itemsCollectionBalanceData.length + " Unique)"
    : "";

  return !itemCollectionBalanceIsLoading && itemsCollectionBalanceData ? (
    <Card
      collapsable
      title={`Your ${count} ${title} ${countUnique}`}
      className="border-t border-white/10 rounded-none bg-transparent"
    >
      <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4">
        {itemsCollectionBalanceData?.map((balanceData) => {
          const { name, description, image, tokenId } =
            balanceData?.tokenMetadata ?? {};
          return (
            <div key={tokenId} className="p-1 w-full flex-col">
              <Card>
                <div className="flex-row gap-6">
                  <div className="flex flex-col gap-6 items-center">
                    #{tokenId || "No metadata"}: {name} (x
                    {balanceData.balance}
                    )
                    <br />
                    {description}
                    <Image src={image} style={{ borderRadius: "12px" }} />
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </Card>
  ) : null;
}
