import { useDrawer } from "@/context/Drawer";
import { getProgram } from "@/utils/program";
import { Button, Center, Flex, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import {
    Keypair,
    SystemProgram,
    Transaction
} from "@solana/web3.js";
import { FC } from "react";
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
};
const BuyToken: FC<RaffleButtonProps> = ({ countdown }) => {
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();
    const { raffleAccount, raffleAdr } = useDrawer();
    const { publicKey, connected, sendTransaction } = useWallet();
    const handleBuy = async () => {
        try {
            if (raffleAdr && connected && publicKey) {
                const program = getProgram(connection, anchorWallet);
                const ticket = Keypair.generate();
                const buyInst = await program.methods
                    .buyTicket(raffleAccount.ticketPrice)
                    .accounts({
                        raffleAccount: raffleAdr,
                        signer: publicKey,
                        ticket: ticket.publicKey,
                        systemProgram: SystemProgram.programId,
                        treasuryAccount: raffleAccount.treasury,
                    })
                    .instruction();
                const buyTx = new Transaction().add(buyInst);
                const tx = await sendTransaction(buyTx, connection, {
                    skipPreflight: true,
                    signers: [ticket],
                });
                console.log("Tx", tx);
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
                    message: (
                        <span>you need to be connected in order to purchase a ticket</span>
                    ),
                });
            }
        } catch (error: any) {
            notifications.show({
                color: "red",
                title: "Error",
                message: (
                    <span>{error.message}</span>
                ),
            });
        }
    };
    return (
        <Center onClick={handleBuy}>
            <Button color="violet" radius={"md"} fullWidth size="lg" mt={"lg"} h={60}>
                <Flex direction={"column"} justify={"center"} align={"center"}>
                    <Text fz={20}>Buy Ticket</Text>
                    <span>
                        <Countdown date={countdown} renderer={renderer} />
                    </span>
                </Flex>
            </Button>
        </Center>
    );
};

export default BuyToken;
