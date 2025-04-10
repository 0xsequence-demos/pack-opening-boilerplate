import Home from "./views/Home";
import {
  getDefaultChains,
  getDefaultWaasConnectors,
  SequenceConnectProvider,
} from "@0xsequence/connect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { SequenceCheckoutProvider } from "@0xsequence/checkout";
import { Chain, Transport } from "viem";
import { allNetworks, findNetworkConfig } from "@0xsequence/network";
import { Toaster } from "sonner";
import { chainIdsFromString } from "./helpers/chainIdUtils";
import Contexts from "./Contexts";
import { defaultChainId } from "./configs/chains";

const queryClient = new QueryClient();

function getTransportConfigs(
  chains: [Chain, ...Chain[]],
): Record<number, Transport> {
  return chains.reduce(
    (acc, chain) => {
      const network = findNetworkConfig(allNetworks, chain.id);
      if (network) acc[chain.id] = http(network.rpcUrl);
      return acc;
    },
    {} as Record<number, Transport>,
  );
}

export default function App() {
  const projectAccessKey = import.meta.env.VITE_PROJECT_ACCESS_KEY;
  const waasConfigKey = import.meta.env.VITE_WAAS_CONFIG_KEY;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
  const appleRedirectURI = window.location.origin + window.location.pathname;
  const walletConnectId = import.meta.env.VITE_WALLET_CONNECT_ID;

  const chains = chainIdsFromString(import.meta.env.VITE_CHAINS).map(
    (id) => getDefaultChains([id])[0],
  ) as [Chain, ...Chain[]];

  const connectors = getDefaultWaasConnectors({
    walletConnectProjectId: walletConnectId,
    waasConfigKey,
    googleClientId,
    // Notice: Apple Login only works if deployed on https (to support Apple redirects)
    appleClientId,
    appleRedirectURI,
    defaultChainId,
    appName: "Kit Starter",
    projectAccessKey,
  });

  const transports = getTransportConfigs(chains);

  const config = createConfig({
    transports,
    connectors,
    chains,
  });

  const kitConfig = {
    projectAccessKey,
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SequenceConnectProvider config={kitConfig}>
          <SequenceCheckoutProvider>
            <Toaster />
            <Contexts>
              <Home />
            </Contexts>
          </SequenceCheckoutProvider>
        </SequenceConnectProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
