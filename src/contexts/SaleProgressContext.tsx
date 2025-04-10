import { useReadContract } from "wagmi";

import { createContext, ReactNode } from "react";
import useCustomContext from "./useCustomContext";
import { calculateMintedPercentage } from "../helpers/calculateMintedPercentage";
import { initialChainId, nftTokenAddress } from "../configs/chains";
import { useSaleDetails } from "./SaleDetailsContext";
import { ERC721_SALE_ITEMS_ABI } from "../abi/saleItems/erc721SaleItems";

const SaleProgressContext = createContext<SaleProgress | undefined>(undefined);

type SaleProgress = {
  cost: bigint;
  totalSupply: number;
  supplyCap: number;
  percentage: number;
  refetchTotalMinted: () => void;
};

export function SaleProgressProvider({ children }: { children: ReactNode }) {
  const saleDetails = useSaleDetails();

  const { data: totalSupply, refetch: refetchTotalMinted } = useReadContract({
    abi: ERC721_SALE_ITEMS_ABI,
    functionName: "totalSupply",
    chainId: initialChainId,
    address: nftTokenAddress,
  });

  const supplyCap = saleDetails?.supplyCap?.toString() || 0;

  const totalMintedNftsPercentage = calculateMintedPercentage(
    Number(totalSupply),
    Number(supplyCap),
  );

  return (
    <SaleProgressContext.Provider
      value={{
        percentage: totalMintedNftsPercentage,
        totalSupply: Number(totalSupply),
        supplyCap: Number(supplyCap),
        cost: saleDetails?.cost,
        refetchTotalMinted,
      }}
    >
      {children}
    </SaleProgressContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaleProgress() {
  return useCustomContext(SaleProgressContext);
}
