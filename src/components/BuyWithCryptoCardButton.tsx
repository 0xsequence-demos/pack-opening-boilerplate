import {
  Address,
  encodeFunctionData,
  SendTransactionErrorType,
  toHex,
} from "viem";
import {
  usePublicClient,
  useWalletClient,
  useAccount,
  useSendTransaction,
} from "wagmi";
import { ERC20 } from "../configs/erc20/ERC20";

import { useEffect } from "react";
import { toast } from "sonner";
import { useUserPaymentCurrencyBalance } from "../hooks/useUserPaymentCurrencyBalance";
import { useSaleCurrency } from "../contexts/SaleCurrencyContext";
import { initialChainId, salesContractAddress } from "../configs/chains";
import { getChain } from "../configs/erc20/getChain";
import { ERC721_SALE_ABI } from "../abi/sale/erc721Sale";

interface BuyWithCryptoCardButtonProps {
  amount: number;
  resetAmount: () => void;
  setTxExplorerUrl: (url: string) => void;
  setTxError: (error: SendTransactionErrorType | null) => void;
  setPurchasingNft: (value: boolean) => void;
  price: bigint;
  onPurchaseSuccess: () => void;
}

export const BuyWithCryptoCardButton = ({
  amount,
  resetAmount,
  setTxExplorerUrl,
  setTxError,
  setPurchasingNft,
  price,
  onPurchaseSuccess,
}: BuyWithCryptoCardButtonProps) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const {
    address: userAddress,
    // chainId: chainIdUser
  } = useAccount();

  const {
    data: txnData,
    sendTransaction,
    isPending: isPendingSendTxn,
    error,
  } = useSendTransaction();
  const nftPriceBigInt = price ? price : BigInt(0);
  const amountBigInt = BigInt(amount);
  const totalPrice = nftPriceBigInt * amountBigInt;
  const { info: currencyInfo } = useSaleCurrency();

  const userPaymentCurrencyBalance = useUserPaymentCurrencyBalance({
    address: userAddress,
  });
  const chainInfo = getChain(initialChainId);

  const onClickBuy = async () => {
    if (
      !publicClient ||
      !walletClient ||
      !userAddress ||
      !currencyInfo ||
      isPendingSendTxn ||
      amount <= 0 ||
      !userPaymentCurrencyBalance?.toString() ||
      userPaymentCurrencyBalance < totalPrice
    ) {
      return;
    }

    setTxError(null);
    setTxExplorerUrl("");
    setPurchasingNft(true);

    const allowance = await ERC20.getAllowance(
      currencyInfo.address,
      userAddress,
      salesContractAddress,
      initialChainId,
    );

    if (!allowance || allowance === 0n) {
      await ERC20.approveInfinite(
        currencyInfo.address,
        salesContractAddress,
        walletClient,
      );
    }

    /**
     * Mint tokens.
     * @param to Address to mint tokens to.
     * @param amount Amounts of tokens to mint.
     * @param expectedPaymentToken ERC20 token address to accept payment in. address(0) indicates ETH.
     * @param maxTotal Maximum amount of payment tokens.
     * @param proof Merkle proof for allowlist minting.
     * @notice Sale must be active for all tokens.
     * @dev tokenIds must be sorted ascending without duplicates.
     * @dev An empty proof is supplied when no proof is required.
     */

    const calldata = encodeFunctionData({
      abi: ERC721_SALE_ABI,
      functionName: "mint",
      args: [
        userAddress,
        BigInt(amount),
        currencyInfo.address as Address,
        totalPrice,
        [toHex(0, { size: 32 })],
      ],
    });

    const transactionParameters = {
      to: salesContractAddress,
      data: calldata,
      value: BigInt(0),
    };

    sendTransaction(transactionParameters);
  };

  useEffect(() => {
    if (!error) return;
    setTxError(error as SendTransactionErrorType);
    setPurchasingNft(false);
  }, [error]);

  useEffect(() => {
    if (!txnData || isPendingSendTxn) return;
    resetAmount();
    toast(
      <div>
        Purchase Completed Successfully.{" "}
        <a
          href={`${chainInfo?.explorerUrl}/tx/${txnData}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "rgba(32, 129, 226, 1)",
            textDecoration: "underline",
          }}
        >
          View transaction in explorer
        </a>
      </div>,
    );
    setTxExplorerUrl(`${chainInfo?.explorerUrl}/tx/${txnData}`);
    setPurchasingNft(false);
    setTimeout(() => onPurchaseSuccess(), 3000);
  }, [txnData, isPendingSendTxn]);

  const hasNsf =
    userPaymentCurrencyBalance?.toString() &&
    (userPaymentCurrencyBalance?.toString() === "0" ||
      userPaymentCurrencyBalance < totalPrice);

  return (
    <>
      <button
        style={{
          backgroundColor: "rgba(32, 129, 226, 1)",
          padding: "12px 6px",
          borderRadius: "0.75rem",
          width: "100%",
          transition: "background-color 0.3s ease",
          border: "none",
          outline: "none",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(25, 100, 176, 1)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(32, 129, 226, 1)")
        }
        onClick={onClickBuy}
      >
        {hasNsf
          ? "Insufficient funds"
          : !isPendingSendTxn
            ? "Purchase"
            : "Purchasing..."}
      </button>
    </>
  );
};
