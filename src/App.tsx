import Home from "./views/Home";
import {
  SequenceConnect,
  ConnectConfig,
  createConfig,
} from "@0xsequence/connect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SequenceCheckoutProvider } from "@0xsequence/checkout";
import { Toaster } from "sonner";
import { chainIdsFromString } from "./helpers/chainIdUtils";
import { defaultChainId } from "./configs/chains";
import { SequenceHooksProvider } from "@0xsequence/hooks";

const queryClient = new QueryClient();

export default function App() {
  const projectAccessKey = import.meta.env.VITE_PROJECT_ACCESS_KEY;
  const waasConfigKey = import.meta.env.VITE_WAAS_CONFIG_KEY;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
  const appleRedirectURI = window.location.origin + window.location.pathname;
  const walletConnectId = import.meta.env.VITE_WALLET_CONNECT_ID;

  const chainIds = chainIdsFromString(import.meta.env.VITE_CHAINS);
  const connectConfig: ConnectConfig = {
    projectAccessKey,
    defaultTheme: "dark",
    signIn: {
      projectName: "Sequence Pack Opening Boilerplate",
    },
    env: {
      indexerGatewayUrl: "https://dev-indexer.sequence.app",
      metadataUrl: "https://dev-metadata.sequence.app",
      apiUrl: "https://dev-api.sequence.app",
      indexerUrl: "https://dev-indexer.sequence.app",
    },
  };

  const kitConfig = createConfig("waas", {
    ...connectConfig,
    chainIds,
    defaultChainId,
    waasConfigKey,
    appName: "Seqeunce Pack Opening Boilerplate",
    enableConfirmationModal:
      localStorage.getItem("confirmationEnabled") === "true",
    google: {
      clientId: googleClientId,
    },
    apple: {
      clientId: appleClientId,
      redirectURI: appleRedirectURI,
    },
    walletConnect: {
      projectId: walletConnectId,
    },
  });

  console.log(kitConfig);

  return (
    <QueryClientProvider client={queryClient}>
      <SequenceConnect config={kitConfig}>
        <SequenceHooksProvider config={connectConfig}>
          <SequenceCheckoutProvider>
            <Toaster />
            <Home />
          </SequenceCheckoutProvider>
        </SequenceHooksProvider>
      </SequenceConnect>
    </QueryClientProvider>
  );
}
