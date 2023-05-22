import "@/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SlopeWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useMemo } from "react";
import Layout from "./components/Layout";
import { DrawerProvider } from "@/context/Drawer";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export default function App({ Component, pageProps }: AppProps) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.

  const endpoint =
    "https://little-practical-wildflower.solana-devnet.discover.quiknode.pro/b33c1731ef24950ad5a92445bc1133e16e4271ed/";
  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/solana-labs/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter()
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  return (
    <>
      <Head>
        <title>ATOZ Raffle</title>
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          fontFamily: 'Comic Neue',
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      ><DrawerProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <Notifications />

                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>

        </DrawerProvider >
      </MantineProvider>
    </>
  );
}
