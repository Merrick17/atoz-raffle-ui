import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
  } from '@solana/spl-token';
  import { PublicKey, Transaction } from '@solana/web3.js';
  
  const createTokenAccount = async (
    mint: PublicKey,
    payer: PublicKey,
    ownerPda: PublicKey
  ) => {
    let tokenAccount = await getAssociatedTokenAddress(
      mint, // mint
      ownerPda,
      true // owner
    );
    let tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer, // payer
        tokenAccount, // ata
        ownerPda, // owner
        mint // mint
      )
    );
    return { tokenAccount, tx };
  };
  
  export { createTokenAccount };
  