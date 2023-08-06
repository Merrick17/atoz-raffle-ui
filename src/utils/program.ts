import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/idl.json";
import { AtozRaffle } from "../../types/programtypes";
import { programId } from "./constants";
const getProgram = (connection: Connection, wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const initProgram: Program<AtozRaffle> = new Program(
    idl as any,
    new PublicKey(programId),
    provider
  );
  return initProgram;
};
export { getProgram };
