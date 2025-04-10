import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

import { SequenceBoilerplate } from "boilerplate-design-system";
import NotConnected from "./NotConnected";
import Connected from "./Connected";

export default function Home() {
  const { isConnected, address, chainId } = useAccount();

  return (
    <SequenceBoilerplate
      githubUrl="https://github.com/0xsequence-demos/pack-opening-boilerplate/"
      name="Pack Opening Boilerplate"
      description="Example of how to open packs using Sequence."
      docsUrl="https://docs.sequence.xyz/"
      wagmi={{ useAccount, useDisconnect, useSwitchChain }}
      faucetUrl="https://www.alchemy.com/faucets/polygon-amoy"
      // balance={balance ? `$${balance}` : false}
    >
      {isConnected && address && chainId ? (
        <Connected userAddress={address} chainId={chainId} />
      ) : (
        <NotConnected />
      )}
    </SequenceBoilerplate>
  );
}
