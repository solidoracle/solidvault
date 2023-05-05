import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useEthPrice } from "~~/hooks/scaffold-eth";
import { useAppStore } from "~~/services/store/store";
import { wagmiClient } from "~~/services/web3/wagmiClient";
import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";
import theme from "~~/styles/theme";

// make sure FE can deposit something and withdraw something
// start thinking about brand, landing page
// social held to accountability
const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(() => new QueryClient());
  const price = useEthPrice();
  const setEthPrice = useAppStore(state => state.setEthPrice);

  useEffect(() => {
    if (price > 0) {
      setEthPrice(price);
    }
  }, [setEthPrice, price]);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={wagmiClient}>
        <ChakraProvider theme={theme}>
          <NextNProgress />
          <RainbowKitProvider chains={appChains.chains} avatar={BlockieAvatar}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="relative flex flex-col flex-1">
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                <Component {...pageProps} />
              </main>
              <Footer />
            </div>
            <Toaster />
          </RainbowKitProvider>
        </ChakraProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
};

export default ScaffoldEthApp;
