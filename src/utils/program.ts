import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/idl.json";
import { AtozRaffle } from "../../types/programtypes";
const getProgram = (connection: Connection, wallet: any) => {
    const programId = process.env.NEXT_PUBLIC_PROGRAM_ID || "2gYA2PGHSxWyVnhfHy9jAuyukcF8B3hLxSMWUN1dhzU8";
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

