import { useReadContract } from "wagmi";

import { useSaleCurrency } from "../contexts/SaleCurrencyContext";
import { Address } from "viem";
import { initialChainId } from "../configs/chains";
import { ERC20_ABI } from "../abi/tokens/erc20";

export function useUserPaymentCurrencyBalance({
  address,
}: {
  address?: Address;
}) {
  const { info: currencyInfo } = useSaleCurrency();

  // Fetch the user payment currency balance
  const {
    data: userPaymentCurrencyBalance,
    // isLoading: userPaymentCurrencyBalanceIsLoading,
  } = useReadContract(
    currencyInfo?.address && address
      ? {
          abi: ERC20_ABI,
          functionName: "balanceOf",
          chainId: initialChainId,
          address: currencyInfo?.address as Address,
          args: [address],
          query: {
            refetchInterval: 30000,
            enabled: Boolean(currencyInfo?.address && address),
          },
        }
      : undefined,
  );

  return userPaymentCurrencyBalance;
}
