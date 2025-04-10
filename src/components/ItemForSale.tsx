import { BuyWithCryptoCardButton } from "./BuyWithCryptoCardButton";
import { useEffect, useState } from "react";
import PurchaseAnimation from "./PurchaseAnimation";
import { SendTransactionErrorType } from "viem";
import { toast } from "sonner";
import { useSaleCurrency } from "../contexts/SaleCurrencyContext";
import { formatPriceWithDecimals } from "../helpers/formatPriceWithDecimals";
import { Image, Svg } from "boilerplate-design-system";
import { useSaleDetails } from "../contexts/SaleDetailsContext";

interface ItemForSaleProps {
  onPurchaseSuccess: () => void;
}

export default function ItemForSale({ onPurchaseSuccess }: ItemForSaleProps) {
  const [amount, setAmount] = useState(1);
  const [txExplorerUrl, setTxExplorerUrl] = useState("");
  const { info: currencyInfo } = useSaleCurrency();
  const [txError, setTxError] = useState<SendTransactionErrorType | null>(null);
  const [purchasingNft, setPurchasingNft] = useState<boolean>(false);
  // const logoURI = currencyData?.logoURI;
  const saleDetails = useSaleDetails();

  const price = saleDetails?.cost || BigInt(0);
  const formattedPrice =
    currencyInfo !== undefined
      ? formatPriceWithDecimals(price, currencyInfo.decimals)
      : 0;

  useEffect(() => {
    if (!txError || JSON.stringify(txError) === "{}") return;
    toast(`Error to purchase NFT`);
    setPurchasingNft(false);
    console.error(txError);
  }, [txError]);

  const increaseAmount = () => {
    if (purchasingNft) return;
    setAmount(amount + 1);
  };

  const decreaseAmount = () => {
    if (amount === 0 || purchasingNft) return;
    setAmount(amount - 1);
  };

  const resetAmount = () => {
    setAmount(0);
  };

  return (
    <div className="p-1 w-full flex-col">
      <div className="flex-row gap-6">
        <div className="flex flex-col gap-6 items-center">
          <div className="flex flex-col my-4 gap-6">
            <h3 className="text-20 font-bold leading-tight">Buy Now</h3>
            <p className="text-14">
              In just a few days, all chest contents will be revealed.
            </p>
          </div>
          <div className="flex flex-row gap-6 justify-center">
            <Image src="/chest.png" style={{ borderRadius: "12px" }} />
          </div>

          <p className="text-14">Price: {formattedPrice}</p>
          <div
            className="flex p-4 rounded-lg gap-4"
            style={{ backgroundColor: "rgba(32, 32, 32, 1)", width: "25rem" }}
          >
            <div className="flex items-center border border-grey-600 rounded-[0.5rem]">
              <button
                type="button"
                onClick={decreaseAmount}
                className="size-12 flex items-center justify-center"
              >
                <Svg
                  name="Subtract"
                  className="text-white size-4"
                  alt="Decrease quantity"
                />
              </button>
              <span className="flex-1 text-center">{amount}</span>
              <button
                type="button"
                onClick={increaseAmount}
                className="size-12 flex items-center justify-center"
              >
                <Svg
                  name="Add"
                  className="text-white size-4"
                  alt="Increase quantity"
                />
              </button>
            </div>

            <BuyWithCryptoCardButton
              amount={amount}
              resetAmount={resetAmount}
              setTxExplorerUrl={setTxExplorerUrl}
              setTxError={setTxError}
              setPurchasingNft={setPurchasingNft}
              price={price}
              onPurchaseSuccess={onPurchaseSuccess}
            />
          </div>
          {purchasingNft && (
            <PurchaseAnimation
              amount={amount}
              image="/chest.png"
              name="Chest"
            />
          )}
          {txError && JSON.stringify(txError) != "{}" && (
            <span>Error to purchase NFT. Details in console</span>
          )}
          {txExplorerUrl && (
            <div className="flex flex-col mb-3">
              <h3 className="text-20 font-bold leading-tight">
                Purchase Completed Successfully
              </h3>
              <a href={txExplorerUrl} target="_blank" rel="noopener noreferrer">
                <span>View transaction in explorer</span>
                <br />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
