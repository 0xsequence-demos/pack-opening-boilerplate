import { ReactNode } from "react";
import { SaleCurrencyProvider } from "./contexts/SaleCurrencyContext";
import { SaleDetailsProvider } from "./contexts/SaleDetailsContext";
import { SaleProgressProvider } from "./contexts/SaleProgressContext";

export default function Contexts({ children }: { children: ReactNode }) {
  return (
    <SaleDetailsProvider>
      <SaleCurrencyProvider>
        <SaleProgressProvider>{children}</SaleProgressProvider>
      </SaleCurrencyProvider>
    </SaleDetailsProvider>
  );
}
