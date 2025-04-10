import { useReadContract } from "wagmi";

import { createContext, ReactNode } from "react";
import useCustomContext from "./useCustomContext";
import { initialChainId, salesContractAddress } from "../configs/chains";
import { ERC721_SALE_ABI } from "../abi/sale/erc721Sale";

const SaleDetailsContext = createContext<SaleDetailsData | undefined>(
  undefined,
);
interface SaleDetailsData {
  supplyCap: bigint;
  cost: bigint;
  paymentToken: `0x${string}`;
  startTime: bigint;
  endTime: bigint;
  merkleRoot: `0x${string}`;
}

export function SaleDetailsProvider({ children }: { children: ReactNode }) {
  const { data: saleDetailsData } = useReadContract({
    abi: ERC721_SALE_ABI,
    functionName: "saleDetails",
    chainId: initialChainId,
    address: salesContractAddress,
  });

  if (!saleDetailsData) {
    return null;
  }

  return (
    <SaleDetailsContext.Provider value={saleDetailsData}>
      {children}
    </SaleDetailsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaleDetails() {
  return useCustomContext(SaleDetailsContext);
}
