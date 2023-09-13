import { useDrawer } from "@/context/Drawer";
import { createTokenAccount } from "@/utils/ata";
import { getAta } from "@/utils/ata2";
import { authorityAddress, rewardMint } from "@/utils/constants";
import { getProgram } from "@/utils/program";
import { BN, utils } from "@coral-xyz/anchor";
import {
  ActionIcon,
  Button,
  Center,
  Flex,
  Group,
  NumberInput,
  NumberInputHandlers,
  Text,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { FC, useRef, useState } from "react";
import Countdown from "react-countdown";

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
type RaffleButtonProps = {
  countdown: Date;
  closed: boolean;
  useTimer: boolean;
};
const BuyToken: FC<RaffleButtonProps> = ({ countdown, closed, useTimer }) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { raffleAccount, raffleAdr } = useDrawer();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [value, setValue] = useState<number | "">(1);
  const handlers = useRef<NumberInputHandlers>();
  const handleBuy = async () => {
    try {
      if (raffleAdr && connected && publicKey) {
        if (
          raffleAccount.totalSuppy.toNumber() >
          raffleAccount.ticketsBought.toNumber()
        ) {
          if (raffleAccount.useSplPay) {
            const program = getProgram(connection, anchorWallet);
            let tickets: any[] = [];
            let Tx = new Transaction();
            const { pubkey: payerAta, ix: payerIx } = await getAta(
              connection,
              rewardMint,
              publicKey,
              publicKey
            );
            if (payerIx) {
              const tx = new Transaction().add(payerIx);
              const res = await sendTransaction(tx, connection);
            }
            const { pubkey: programAta, ix: programIx } = await getAta(
              connection,
              rewardMint,
              publicKey,
              authorityAddress,
              true
            );
            if (programIx) {
              const tx = new Transaction().add(programIx);
              const res = await sendTransaction(tx, connection);
            }
            for (let i = 0; i < Number(value); i++) {
              const ticket = Keypair.generate();
              const buyInst = await program.methods
                .buyTicketSpl(raffleAccount.ticketPrice)
                .accounts({
                  raffleAccount: raffleAdr,
                  signer: publicKey,
                  ticket: ticket.publicKey,
                  systemProgram: SystemProgram.programId,
                  prizeTokenAccount: programAta,
                  signerTokenAccount: payerAta,
                  tokenProgram: TOKEN_PROGRAM_ID,
                })
                .instruction();
              tickets.push(ticket);
              Tx.add(buyInst);
            }
            const tx = await sendTransaction(Tx, connection, {
              skipPreflight: true,
              signers: [...tickets],
            });
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
            const program = getProgram(connection, anchorWallet);
            let tickets: any[] = [];
            let Tx = new Transaction();
            for (let i = 0; i < Number(value); i++) {
              const ticket = Keypair.generate();
              const buyInst = await program.methods
                .buyTicket(raffleAccount.ticketPrice)
                .accounts({
                  raffleAccount: raffleAdr,
                  signer: publicKey,
                  ticket: ticket.publicKey,
                  systemProgram: SystemProgram.programId,
                  treasuryAccount: authorityAddress,
                })
                .instruction();
              tickets.push(ticket);
              Tx.add(buyInst);
            }
            const tx = await sendTransaction(Tx, connection, {
              skipPreflight: true,
              signers: [...tickets],
            });
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
          }
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: <span>Sold Out</span>,
          });
        }
      } else {
        notifications.show({
          color: "red",
          title: "Error",
          message: (
            <span>you need to be connected in order to purchase a ticket</span>
          ),
        });
      }
    } catch (error: any) {
      console.log("Error", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: <span>{error.message}</span>,
      });
    }
  };
  const reInitFailedTickets = async (failedList: any[]) => {
    try {
      if (raffleAdr && connected && publicKey) {
        const program = getProgram(connection, anchorWallet);

        for (const fail of failedList) {
          const [failedTicket] = PublicKey.findProgramAddressSync(
            [
              Buffer.from(utils.bytes.utf8.encode("ticket_atoz")),
              raffleAdr.toBuffer(),
              Buffer.from(utils.bytes.utf8.encode(fail.toString())),
            ],
            program.programId
          );

          const failedTkt = raffleAccount.ticketList.find(
            (elm) => elm.ticketId.toNumber() === fail
          );

          if (failedTkt) {
            const buyInst = await program.methods
              .initPdaTicketList(new BN(fail))
              .accounts({
                raffleAccount: raffleAdr,
                signer: publicKey,
                ticket: failedTicket,
                participant: failedTkt.owner,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
              })
              .instruction();

            const Tx = new Transaction();
            Tx.add(buyInst);

            await sendTransaction(Tx, connection, {
              skipPreflight: true,
            });

            console.log("Failed TX sent for ticket:", fail);

            // Add a timeout before processing the next failed ticket
            const timeoutDuration = 2000; // 2 seconds
            await new Promise((resolve) =>
              setTimeout(resolve, timeoutDuration)
            );
          }
        }
      } else {
        notifications.show({
          color: "red",
          title: "Error",
          message: "You need to be connected to process failed tickets",
        });
      }
    } catch (error) {
      console.log("Error", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: error.message,
      });
    }
  };
  const handleBuyV2 = async () => {
    try {
      if (raffleAdr && connected && publicKey) {
        if (
          raffleAccount.totalSuppy.toNumber() >
          raffleAccount.ticketsBought.toNumber()
        ) {
          if (raffleAccount.useSplPay) {
            const program = getProgram(connection, anchorWallet);
            let tickets: any[] = [];
            let Tx = new Transaction();
            const { pubkey: payerAta, ix: payerIx } = await getAta(
              connection,
              rewardMint,
              publicKey,
              publicKey
            );
            if (payerIx) {
              const tx = new Transaction().add(payerIx);
              const res = await sendTransaction(tx, connection);
            }
            const { pubkey: programAta, ix: programIx } = await getAta(
              connection,
              rewardMint,
              publicKey,
              authorityAddress,
              true
            );
            if (programIx) {
              const tx = new Transaction().add(programIx);
              const res = await sendTransaction(tx, connection);
            }
            for (let i = 0; i < Number(value); i++) {
              // const ticket = Keypair.generate();
              const ticketNumber =
                raffleAccount.ticketsBought.toNumber() + i + 1;

              console.log("Ticket NUMBER", ticketNumber.toString());
              const [ticket] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from(utils.bytes.utf8.encode("ticket_atoz")),
                  raffleAdr.toBuffer(),
                  Buffer.from(utils.bytes.utf8.encode(ticketNumber.toString())),
                ],
                program.programId
              );
              // console.log("Ticket Number",ticketNumber);
              const buyInst = await program.methods
                .buyTicketSplV2(new BN(ticketNumber), raffleAccount.ticketPrice)
                .accounts({
                  raffleAccount: raffleAdr,
                  signer: publicKey,
                  ticket: ticket,
                  systemProgram: SystemProgram.programId,
                  prizeTokenAccount: programAta,
                  signerTokenAccount: payerAta,
                  tokenProgram: TOKEN_PROGRAM_ID,
                })
                .instruction();
              tickets.push(ticket);
              Tx.add(buyInst);
            }
            const tx = await sendTransaction(Tx, connection, {
              skipPreflight: true,
            });
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
            const program = getProgram(connection, anchorWallet);
            let tickets: any[] = [];
            let Tx = new Transaction();
            for (let i = 0; i < Number(value); i++) {
              const ticket = Keypair.generate();
              const buyInst = await program.methods
                .buyTicket(raffleAccount.ticketPrice)
                .accounts({
                  raffleAccount: raffleAdr,
                  signer: publicKey,
                  ticket: ticket.publicKey,
                  systemProgram: SystemProgram.programId,
                  treasuryAccount: authorityAddress,
                })
                .instruction();
              tickets.push(ticket);
              Tx.add(buyInst);
            }
            const tx = await sendTransaction(Tx, connection, {
              skipPreflight: true,
              signers: [...tickets],
            });
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
          }
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: <span>Sold Out</span>,
          });
        }
      } else {
        notifications.show({
          color: "red",
          title: "Error",
          message: (
            <span>you need to be connected in order to purchase a ticket</span>
          ),
        });
      }
    } catch (error: any) {
      console.log("Error", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: <span>{error.message}</span>,
      });
    }
  };

  return (
    <Group position="apart">
      <Flex w={"100%"} justify={"space-between"} align={"center"}>
        <Text>Number Of Tickets:</Text>
        <Group spacing={5}>
          <ActionIcon
            size={42}
            variant="default"
            onClick={() => {
              if (Number(value) > 1) {
                setValue(Number(value) - 1);
              }
            }}
          >
            –
          </ActionIcon>

          <NumberInput
            hideControls
            value={value}
            onChange={(val) => setValue(val)}
            handlersRef={handlers}
            min={1}
            step={1}
            styles={{ input: { width: rem(54), textAlign: "center" } }}
          />

          <ActionIcon
            size={42}
            variant="default"
            onClick={() => {
              setValue(Number(value) + 1);
            }}
          >
            +
          </ActionIcon>
        </Group>
      </Flex>
      <Button
        color="red"
        radius={"md"}
        fullWidth
        size="lg"
        mt={"lg"}
        h={60}
        onClick={handleBuyV2}
      >
        <Flex direction={"column"} justify={"center"} align={"center"}>
          <Text fz={20}>Buy Ticket</Text>
          {useTimer && (
            <span>
              {closed ? (
                //@ts-ignore
                <Countdown date={countdown} renderer={renderer} />
              ) : (
                `${raffleAccount.winner.toBase58()}`
              )}
            </span>
          )}
          {!useTimer && !closed && <span>Sold out</span>}
        </Flex>
      </Button>
    </Group>
  );
};

export default BuyToken;
