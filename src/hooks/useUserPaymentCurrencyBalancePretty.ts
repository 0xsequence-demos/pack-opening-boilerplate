import { useSaleCurrency } from "../contexts/SaleCurrencyContext";
import { formatPriceWithDecimals } from "../helpers/formatPriceWithDecimals";
import { useUserPaymentCurrencyBalance } from "./useUserPaymentCurrencyBalance";
import { Address } from "viem";

export function useUserPaymentCurrencyBalancePretty(props: {
  address?: Address;
}) {
  const balance = useUserPaymentCurrencyBalance(props);

  const { info: currencyInfo } = useSaleCurrency();

  return balance && currencyInfo !== undefined
    ? formatPriceWithDecimals(balance, currencyInfo.decimals)
    : false;
}
