import { PublicKey } from "@solana/web3.js";
import React, { createContext, useContext, useState } from "react";

interface DrawerContextType {
  isOpen: boolean;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  raffleAccount: any;
  setAccount: (account: any) => void;
  nftDetails: any;
  setNftDetails: (nft: any) => void;
  raffleAdr: PublicKey | null;
  setRaffleAdr: any;
  winnerInfo: any;
  setWinner: (info: any) => any;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};

export const DrawerProvider = ({ children }: { children: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [raffleAccount, setRaffleAccount] = useState<any>(null);
  const [winnerInfo, setWinnerInfo] = useState<any>(null);
  const [raffleAdr, setRaffleAdr] = useState<PublicKey | null>(null);
  const [nftDetails, setNftDetails] = useState<any>(null);

  const toggleDrawer = () => setIsOpen((prevState) => !prevState);
  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  const setAccount = (account: any) => setRaffleAccount(account);
  const setWinner = (info: any) => setWinnerInfo(info);

  const value: DrawerContextType = {
    isOpen,
    toggleDrawer,
    raffleAccount,
    setAccount,
    closeDrawer,
    openDrawer,
    nftDetails,
    setNftDetails,
    raffleAdr,
    setRaffleAdr, winnerInfo, setWinner
  };

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
};
