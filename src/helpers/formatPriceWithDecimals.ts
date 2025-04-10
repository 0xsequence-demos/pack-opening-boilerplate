import { formatUnits } from "viem";
import { formatDisplay } from "@0xsequence/connect";

export const formatPriceWithDecimals = (
  price: bigint,
  tokenDecimals: number = 0,
): string => {
  const formattedPrice = formatUnits(price, tokenDecimals);
  return formatDisplay(formattedPrice, {
    disableScientificNotation: true,
    disableCompactNotation: true,
    significantDigits: 6,
  });
};
