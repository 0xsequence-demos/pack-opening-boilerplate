import { useCollectionBalance } from "../hooks/data";
import { Card, Image } from "boilerplate-design-system";
import { Address } from "viem";

export default function UserInventory(props: {
  userAddress: Address;
  contractAddress: Address;
  chainId: number;
  title: string;
}) {
  const { userAddress } = props;

  const { data: collectionBalanceData, isLoading: collectionBalanceIsLoading } =
    useCollectionBalance({
      accountAddress: userAddress,
      contractAddress: props.contractAddress,
    });

  const count = collectionBalanceData
    ? collectionBalanceData.reduce((pv, cv) => Number(cv.balance) + pv, 0)
    : "";

  const countUnique = collectionBalanceData
    ? "(" + collectionBalanceData.length + " Unique)"
    : "";

  return !collectionBalanceIsLoading && collectionBalanceData ? (
    <Card
      collapsable
      title={`Your ${count} ${props.title} ${countUnique}`}
      className="border-t border-white/10 rounded-none bg-transparent"
    >
      <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4">
        {collectionBalanceData?.map((balanceData) => {
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
