import { Flex, Modal, Image, Grid, Text, Paper } from "@mantine/core";
import { Metaplex } from "@metaplex-foundation/js";
import { useConnection } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

const DetailsModal = ({
    isOpen,
    handleClose,
    account,
}: {
    isOpen: boolean;
    handleClose: any;
    account: any;
}) => {
    const { connection } = useConnection();

    const metaplex = new Metaplex(connection);
    const [prizeDetails, setPrizeDetails] = useState<any>(null);
    const initNftData = async () => {
        try {
            let nft = await metaplex
                .nfts()
                .findByMint({ mintAddress: account.prize });
            //console.log("NFT", nft);
            setPrizeDetails(nft);
        } catch (error) { }
    };
    useEffect(() => {
        if (account) {
            initNftData();
        }
    }, [account]);

    return account ? (
        <Modal
            centered
            opened={isOpen}
            onClose={() => {
                handleClose();
            }}
            title={`${prizeDetails && prizeDetails.json.name} Raffle`}
            size={"lg"}
            maw={700}
            mah={800}
        >
            <Flex w={"100%"} h={"100%"} direction={"column"} justify={"center"}>
                <Image
                    src={prizeDetails?.json?.image}
                    w={"100%"}
                    h={"100%"}
                    fit="contain"
                />

                <Paper p={10}>
                    <Flex align={"flex-end"} gap={10}>
                        <Text fw={600} fz={20}>
                            Mint
                        </Text>
                        <Text fw={500} fz={17}>
                            {prizeDetails?.mint?.address.toBase58()}
                        </Text>
                    </Flex>
                    <Flex align={"flex-end"} gap={10}>
                        <Text fw={600} fz={20}>
                            Start Date:
                        </Text>
                        <Text fw={500} fz={17}>
                            {dayjs(new Date(account.startTime.toNumber())).format(
                                "DD/MM/YYYY"
                            )}
                        </Text>
                    </Flex>
                    <Flex align={"flex-end"} gap={10}>
                        <Text fw={600} fz={20}>
                            End Date
                        </Text>
                        <Text fw={500} fz={17}>
                            {dayjs(new Date(account.endTime.toNumber())).format("DD/MM/YYYY")}
                        </Text>
                    </Flex>
                    <Flex align={"flex-end"} gap={10}>
                        <Text fw={600} fz={20}>
                            Total Participants
                        </Text>
                        <Text fw={500} fz={17}>
                            {account.participantsList.length}
                        </Text>
                    </Flex>
                    <Flex align={"flex-end"} gap={10}>
                        <Text fw={600} fz={20}>
                            Tickets Bought
                        </Text>
                        <Text fw={500} fz={17}>
                            {account.ticketsBought.toNumber()}/{account.totalSuppy.toNumber()}
                        </Text>
                    </Flex>
                    <Flex align={"flex-end"} gap={10}>
                        <Text fw={600} fz={20}>
                            Winner
                        </Text>
                        <Text fw={500} fz={17}>
                            {account.winner.toBase58()}
                        </Text>
                    </Flex>
                    <Flex align={"flex-end"} gap={10}>
                        <Text fw={600} fz={20}>
                            Claimed by winner :
                        </Text>
                        <Text fw={500} fz={17}>
                            {account.claimed ? "Yes" : "Not Yet"}
                        </Text>
                    </Flex>
                </Paper>
            </Flex>
        </Modal>
    ) : <></>
};

export default DetailsModal;
