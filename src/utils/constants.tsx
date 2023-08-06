import { PublicKey } from "@solana/web3.js";

export const programId: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "BXpLxLCwAwqP9d273RH9n7GNzsyafrt5wMp658Qg2hcv");
export const authorityAddress: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY_ADDRESS || "SoULkUw8WRdZKNT1FhMtCUDggDXCagHtdEFQAmGuM7Z   ");
export const rewardMint: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_REWARD_MINT || "F6weWmuc1vwdL4u38Ro9jKXHEMjP9BoNdWMF5o5TvtJf");