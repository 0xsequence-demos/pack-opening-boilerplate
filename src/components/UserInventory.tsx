import { useCollectionBalance } from "../hooks/data";
import { Card, Image } from "boilerplate-design-system";
import { Address } from "viem";

export default function UserInventory(props: {
  userAddress: Address;
  chainId: number;
}) {
  const { userAddress } = props;

  const { data: collectionBalanceData, isLoading: collectionBalanceIsLoading } =
    useCollectionBalance({
      accountAddress: userAddress,
    });

  return !collectionBalanceIsLoading && collectionBalanceData ? (
    <Card
      collapsable
      title="User Inventory"
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
                    <h3 className="flex flex-col mb-6 gap-4">
                      {name}
                      <br />
                      {description} #{tokenId || "No metadata"}
                    </h3>
                    <div className="flex flex-row gap-6 justify-center">
                      <Image src={image} style={{ borderRadius: "12px" }} />
                    </div>
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
