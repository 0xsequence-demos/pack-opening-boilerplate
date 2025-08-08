import { TokenBalance } from "@0xsequence/indexer";
import { Card, Image } from "@0xsequence-demos/boilerplate-design-system";

export default function UserInventory(props: {
  title: string;
  itemsCollectionBalanceData: TokenBalance[] | undefined;
  itemsCollection2BalanceData: TokenBalance[] | undefined;
  itemCollectionBalanceIsLoading: boolean;
}) {
  const {
    title,
    itemCollectionBalanceIsLoading,
    itemsCollectionBalanceData,
    itemsCollection2BalanceData,
  } = props;

  const count1 = itemsCollectionBalanceData
    ? itemsCollectionBalanceData.reduce((pv, cv) => Number(cv.balance) + pv, 0)
    : 0;

  const count2 = itemsCollection2BalanceData
    ? itemsCollection2BalanceData.reduce((pv, cv) => Number(cv.balance) + pv, 0)
    : 0;

  const count = count1 + count2;

  const countUnique = itemsCollectionBalanceData
    ? itemsCollectionBalanceData.length
    : 0;

  const countUnique2 = itemsCollection2BalanceData
    ? itemsCollection2BalanceData.length
    : 0;

  const countUniqueLabel = itemsCollectionBalanceData
    ? "(" + countUnique + countUnique2 + " Unique)"
    : "";

  return !itemCollectionBalanceIsLoading &&
    itemsCollectionBalanceData &&
    itemsCollection2BalanceData ? (
    <Card
      collapsable
      title={`Your ${count} ${title} ${countUniqueLabel}`}
      className="border-t border-white/10 rounded-none bg-transparent"
    >
      <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4">
        {([] as TokenBalance[])
          .concat(itemsCollection2BalanceData, itemsCollectionBalanceData)
          .map((balanceData) => {
            const { name, description, image, tokenId } =
              balanceData?.tokenMetadata ?? {};
            return (
              <div key={`${tokenId}:${name}`} className="p-1 w-full flex-col">
                <Card>
                  <div className="flex-row gap-6">
                    <div className="flex flex-col gap-2 items-center">
                      #{tokenId || "No metadata"}: {name}
                      <div className="relative aspect-square w-full">
                        <Image src={image} className="absolute rounded-2xl" />
                        <div className="absolute left-2 bottom-1 text-24">
                          x{balanceData.balance}
                        </div>
                      </div>
                      <div className=" text-12">{description}</div>
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
