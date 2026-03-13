import Head from "next/head";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { bscTestnet, bsc } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'OmniAI',
  projectId: '3fd8b11eb0e1ab1029c299c85faeb2c5', // WalletConnect Project ID placeholder
  chains: [bscTestnet, bsc],
  ssr: true,
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#a162f7',
          accentColorForeground: 'white',
          borderRadius: 'large',
        })}>
          <Head>
            <title>OmniAI | Decentralized AI Investment Platform</title>
            <meta
              name="description"
              content="Democratizing AI infrastructure funding through Real-World Asset (RWA) tokenization and DeFi. Invest in the future of artificial intelligence."
            />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Navbar />
          <main>
            <Component {...pageProps} />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}