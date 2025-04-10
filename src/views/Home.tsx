import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

import { SequenceBoilerplate } from "boilerplate-design-system";
import NotConnected from "./NotConnected";
import Connected from "./Connected";
import { useUserPaymentCurrencyBalancePretty } from "../hooks/useUserPaymentCurrencyBalancePretty";

export default function Home() {
  const { isConnected, address, chainId } = useAccount();
  const balance = useUserPaymentCurrencyBalancePretty({ address });

  return (
    <SequenceBoilerplate
      githubUrl="https://github.com/0xsequence-demos/primary-drop-sale-721-boilerplate/"
      name="Primary Drop Sale 721 Boilerplate"
      description="Example of how to perform primary drop sale of 721 NFTs using Sequence."
      docsUrl="https://docs.sequence.xyz/"
      wagmi={{ useAccount, useDisconnect, useSwitchChain }}
      faucetUrl="https://www.alchemy.com/faucets/polygon-amoy"
      balance={balance ? `$${balance}` : false}
    >
      {isConnected && address && chainId ? (
        <Connected userAddress={address} chainId={chainId} />
      ) : (
        <NotConnected />
      )}
    </SequenceBoilerplate>
  );
}
