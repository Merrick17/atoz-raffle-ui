import { useDrawer } from "@/context/Drawer";
import { getProgram } from "@/utils/program";
import { utils } from "@coral-xyz/anchor";
import { Button, Center, Flex, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { FC } from "react";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from '@coral-xyz/anchor'
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { createTokenAccount } from "@/utils/ata";
// Renderer callback with condition
const renderer = ({
  hours,
  minutes,
  seconds,
  completed,
}: {
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  if (completed) {
    // Render a completed state
    return "Raffle Ended";
  } else {
    // Render a countdown
    return (
      <span>
        {hours}:{minutes}:{seconds}
      </span>
    );
  }
};
type RaffleButtonProps = {};
const ClaimButton: FC<RaffleButtonProps> = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { raffleAccount, raffleAdr, winnerInfo } = useDrawer();
  const { publicKey, connected, sendTransaction } = useWallet();
  const wallet = useWallet();
  const handleClaim = async () => {
    try {
      if (raffleAdr && connected && publicKey && winnerInfo) {
        if (publicKey.toBase58()) {
          if (!raffleAccount.claimed) {
            const metaplex = new Metaplex(connection);
            metaplex.use(walletAdapterIdentity(wallet));
            const program = getProgram(connection, anchorWallet);
            const selectedNft = await metaplex.nfts().findByMint({ mintAddress: raffleAccount.prize });
            console.log("Selected NFT", selectedNft)
            // const { tokenAccount, tx: ataTx } = await createTokenAccount(selectedNft.mint.address, publicKey, publicKey)
            let tokenAccount = await getAssociatedTokenAddress(
              raffleAccount.prize, // mint
              publicKey, // owner
            );
            let tokenAccountInfo;
            try {
              tokenAccountInfo = await getAccount(connection, tokenAccount);
            } catch (error) {
              if (!tokenAccountInfo) {
                let ataTx = new Transaction().add(
                  createAssociatedTokenAccountInstruction(
                    publicKey, // payer
                    tokenAccount, // ata
                    publicKey, // owner
                    raffleAccount.prize // mint
                  )
                );
                const rs = await sendTransaction(ataTx, connection, { skipPreflight: true });
                console.log("Tx", rs);
              }



            }



            let [prizeTokenAdr, nonce] = PublicKey.findProgramAddressSync(
              [
                raffleAdr.toBuffer(),
                Buffer.from(utils.bytes.utf8.encode("proceeds")),
              ],
              program.programId
            );
            const [signerTokenRecord] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                raffleAccount.prize.toBuffer(),
                Buffer.from("token_record"),
                tokenAccount.toBuffer(),
              ],

              TOKEN_METADATA_PROGRAM_ID
            );
            const [prizeTokenRecord] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                raffleAccount.prize.toBuffer(),
                Buffer.from("token_record"),
                prizeTokenAdr.toBuffer(),
              ],

              TOKEN_METADATA_PROGRAM_ID
            );
            const [edition] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                raffleAccount.prize.toBuffer(),
                Buffer.from("edition"),
              ],
              TOKEN_METADATA_PROGRAM_ID
            );
            const ticketInfo = await program.account.ticket.fetch(raffleAccount.winner);
            console.log("Tiicket INFO", ticketInfo.ticketId.toNumber());
            const [ticket] = PublicKey.findProgramAddressSync(
              [
                Buffer.from(utils.bytes.utf8.encode("ticket_atoz")),
                raffleAdr.toBuffer(),
                Buffer.from(utils.bytes.utf8.encode((ticketInfo.ticketId.toNumber() + 1).toString())),
              ],
              program.programId
            );
            const ataInfo = await getAccount(connection, tokenAccount);
            console.log("WINNER", raffleAccount.winner.toBase58());
            console.log("GENERATED TICKET", ticket.toBase58());
            const claimInst = await program.methods
              .claimPrize(new anchor.BN(ticketInfo.ticketId.toNumber() + 1), ataInfo.isFrozen)
              .accounts({
                winningTicket: raffleAccount.winner,
                signer: publicKey,
                winner: tokenAccount,
                prizeMint: raffleAccount.prize,
                tokenProgram: TOKEN_PROGRAM_ID,
                prizeTokenAccount: prizeTokenAdr,
                creator: raffleAccount.treasury,
                raffleAccount: raffleAdr,
                winnerAdr: publicKey,
                tokenMetadata: selectedNft.metadataAddress,
                prizeTokenRecordAccount: prizeTokenRecord,
                winnerTokenRecordAccount: signerTokenRecord,
                authorizationRules: new PublicKey(
                  "eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9"
                ),
                authorizationRulesProgram: new PublicKey(
                  "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg"
                ),
                editionAt: edition,
                sysvarInstructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                mplTokenProgram: TOKEN_METADATA_PROGRAM_ID
              })
              .instruction();
            const claimTx = new Transaction().add(claimInst);
            const tx = await sendTransaction(claimTx, connection, { skipPreflight: true });
            notifications.show({
              color: "teal",
              title: "Transaction Sent",
              message: (
                <span>
                  View Transaction on{" "}
                  {
                    <a href={`https://solscan.io/tx/${tx}`} target="_blank">
                      Solscan
                    </a>
                  }
                </span>
              ),
            });
          } else {
            notifications.show({
              color: "red",
              title: "Error",
              message: <span>Prize already claimed</span>,
            });
          }
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: <span>Only winner can claim prize</span>,
          });
        }
      } else {
        notifications.show({
          color: "red",
          title: "Error",
          message: (
            <span>you need to be connected in order to claim prize</span>
          ),
        });
      }
    } catch (error: any) {
      console.log("Error", error)
      notifications.show({
        color: "red",
        title: "Error",
        message: <span>{error.message}</span>,
      });
    }
  };
  return (
    <Center onClick={handleClaim}>
      <Button
        color="red"
        radius={"md"}
        style={{ backgroundColor: "#ff3200" }}
        fullWidth
        size="lg"
        mt={"lg"}
        h={60}
      >
        <Flex direction={"column"} justify={"center"} align={"center"}>
          <Text fz={20}>Claim Prize</Text>
        </Flex>
      </Button>
    </Center>
  );
};

export default ClaimButton;
