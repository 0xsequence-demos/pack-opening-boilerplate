import { useState } from "react";
import { useWriteContract } from "wagmi";
import { Button } from "boilerplate-design-system";
import { defaultChainId, itemsContractAddress } from "../configs/chains";
import { TokenBalance } from "@0xsequence/indexer";
import { ERC1155_SALE_ITEMS_ABI } from "@0xsequence/abi";

export default function BurnItems(props: {
  itemBalances: TokenBalance[] | undefined;
  refetchItemsCollection: () => void;
}) {
  const { itemBalances, refetchItemsCollection } = props;
  const [burnState, setBurnState] = useState<"idle" | "burning" | "fail">(
    "idle",
  );

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        console.log("Burn successful");
        setTimeout(() => {
          refetchItemsCollection();
          setBurnState("idle");
        }, 1000);
      },
      onError: (error) => {
        console.error("Error committing pack", error);
        setBurnState("fail");
      },
    },
  });

  return (
    <Button
      variant="primary"
      className="purchase"
      style={{
        background:
          burnState === "idle"
            ? "linear-gradient(89.69deg, #e62265 0.27%, #910020 99.73%)"
            : "linear-gradient(89.69deg, #777777 0.27%, #555555 99.73%)",
      }}
      onClick={() => {
        if (burnState === "idle" && itemBalances) {
          setBurnState("burning");
          writeContract({
            chainId: defaultChainId,
            address: itemsContractAddress,
            abi: ERC1155_SALE_ITEMS_ABI,
            functionName: "batchBurn",
            args: [
              itemBalances.map((b) => BigInt(parseInt(b.tokenID!))),
              itemBalances.map((b) => BigInt(parseInt(b.balance!))),
            ],
          });
        }
      }}
      type="button"
      disabled={burnState !== "idle" || !itemBalances}
    >
      {burnState !== "idle" ? `Please wait...` : `Burn All Demo Items`}
    </Button>
  );
}
