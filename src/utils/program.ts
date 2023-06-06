import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/idl.json";
import { AtozRaffle } from "../../types/programtypes";
const getProgram = (connection: Connection, wallet: any) => {
  const programId =
    process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "BXpLxLCwAwqP9d273RH9n7GNzsyafrt5wMp658Qg2hcv";
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "processed",
  });

  const initProgram: Program<AtozRaffle> = new Program(
    idl as any,
    new PublicKey(programId),
    provider
  );
  return initProgram;
};
export { getProgram };
