import { getProgram } from "@/utils/program";
import { Button, Card, Flex, Group, Image, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Metaplex, Nft } from "@metaplex-foundation/js";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import DetailsModal from "./DetailsModal";
type AdminRaffleCardType = {
    account: any;
};
const AdminRaffleCard = ({ account }: AdminRaffleCardType) => {
    const { connected, sendTransaction, publicKey } = useWallet();
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();
    const metaplex = new Metaplex(connection);
    const program = getProgram(connection, anchorWallet);
    const [parsedAccount, setParsedAccount] = useState<any>(null);
    const [prizeInfo, setPrizeInfo] = useState<Nft | null>(null);
    const [isDetailsOpen, setIdDetailsOpen] = useState(false);
    const [isWinnerOpen, setIsWinnerOpen] = useState(false);
    const parseRaffleInfo = async () => {
        const parsedAccount = account.account;
        const nft = await metaplex
            .nfts()
            .findByMint({ mintAddress: parsedAccount.prize });

        setParsedAccount(parsedAccount);
        //@ts-ignore
        setPrizeInfo(nft);
    };
    const pickWinner = async () => {
        try {
            if (connected && publicKey && parsedAccount) {
                if (
                    parsedAccount.endTime.toNumber() > Date.now() &&
                    parsedAccount.ticketsBought.toNumber() > 0
                ) {
                    const inst = await program.methods
                        .pickWinner()
                        .accounts({
                            raffleAccount: account.publicKey,
                            creator: account.account.treasury,
                            prizeMint: account.account.prize,
                            signer: account.publicKey,
                        })
                        .instruction();
                    const winnerTx = new Transaction().add(inst);
                    const tx = await sendTransaction(winnerTx, connection, {
                        skipPreflight: true,
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
                            <span>
                                Winner can be only picked when raffle is over and there is at
                                least one participant
                            </span>
                        ),
                    });
                }
            }
        } catch (error) {
            console.log("Error", error);
        }
    };
    useEffect(() => {
        parseRaffleInfo();
    }, [account]);
    const displayRaffle = async () => {
        try {
            if (parsedAccount) {
                const ix = await program.methods.changeVisibility(!parsedAccount.visible).accounts({ raffleAccount: account.publicKey }).instruction();
                const tx = new Transaction().add(ix);
                const res = await sendTransaction(tx, connection);
            }
        } catch (error) {

        }
    }
    return (
        <>
            <Modal
                centered
                opened={isWinnerOpen}
                onClose={() => {
                    setIsWinnerOpen(false);
                }}
                withCloseButton={false}
            >
                <Flex direction={"column"} gap={10}>
                    <Text fw={600} fz={16}>
                        Winner: {`${parsedAccount && parsedAccount.winner}`}
                    </Text>
                    {parsedAccount && (
                        <Text>
                            View winner on{" "}
                            <a
                                target="_blank"
                                href={`https://solscan.io/account/${parsedAccount.winner}?cluster=devnet`}
                            >
                                solscan
                            </a>
                        </Text>
                    )}
                    <Group>
                        <Button
                            color="red"
                            style={{ backgroundColor: "#ff3200" }}
                            onClick={() => {
                                setIsWinnerOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    </Group>
                </Flex>
            </Modal>
            <DetailsModal
                isOpen={isDetailsOpen}
                account={parsedAccount}
                handleClose={() => {
                    setIdDetailsOpen(false);
                }}
            />

            <Card withBorder w={400} h={610} radius={"md"}>
                <Card.Section>
                    <Image
                        src={prizeInfo?.json?.image}
                        w={"100%"}
                        h={"100%"}
                        fit="contain"
                    />
                </Card.Section>
                {/* */}
                <Card.Section p={10}>
                    <Flex justify={"space-between"} align={"center"} my={5}>
                        <Text fw={600} fz={25}>
                            {parsedAccount && parsedAccount.name}
                        </Text>
                        <Button color="red" radius={"md"} onClick={displayRaffle}>
                            {parsedAccount && parsedAccount.visible ? "Hide" : "Display"}
                        </Button>
                    </Flex>
                    <Flex w={"100%"} justify={"space-between"} align={"center"}>
                        <Flex direction={"column"}>
                            <Text>Tickets Remaining</Text>
                            {parsedAccount && (
                                <Text fw={600} fz={20}>
                                    {parsedAccount.ticketsBought.toNumber()}/
                                    {parsedAccount.totalSuppy.toNumber()}
                                </Text>
                            )}
                        </Flex>
                        <Flex direction={"column"}>
                            <Text>Ticket Price</Text>
                            {parsedAccount && (
                                <Text fw={600} fz={20}>
                                    {!parsedAccount.useSplPay
                                        ? `${parsedAccount.ticketPrice.toNumber() / LAMPORTS_PER_SOL
                                        } SOL`
                                        : `${parsedAccount.ticketPrice.toNumber() / Math.pow(10, 9)
                                        } SOUL`}
                                </Text>
                            )}
                        </Flex>
                    </Flex>
                    <Flex
                        w={"100%"}
                        gap={10}
                        mt={20}
                        justify={"space-between"}
                        align={"center"}
                    >
                        <Button
                            fullWidth
                            size="md"
                            onClick={() => {
                                setIdDetailsOpen(true);
                            }}
                            radius={"md"}
                            style={{ backgroundColor: "#ff3200" }}
                        >
                            Details
                        </Button>
                        {parsedAccount &&
                            parsedAccount.winner.toBase58() !==
                            "11111111111111111111111111111111" ? (
                            <Button
                                fullWidth
                                size="md"
                                onClick={() => {
                                    setIsWinnerOpen(true);
                                }}
                                radius={"md"}
                                style={{ backgroundColor: "#ff3200" }}
                            >
                                See Winner
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                size="md"
                                radius={"md"}
                                style={{ backgroundColor: "#ff3200" }}
                                onClick={pickWinner}
                            >
                                Pick Winner
                            </Button>
                        )}
                    </Flex>
                </Card.Section>
            </Card>
        </>
    );
};

export default AdminRaffleCard;
