import { useDrawer } from "@/context/Drawer";
import { getProgram } from "@/utils/program";
import { Button, Flex } from "@mantine/core";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import AdminRaffleCard from "../components/AdminRaffleCard";
import { useRouter } from "next/router";

const AdminHome = () => {
    const programIdString = "2gYA2PGHSxWyVnhfHy9jAuyukcF8B3hLxSMWUN1dhzU8";
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();

    const [raffleAccounts, setRaffleAccounts] = useState<any[]>([]);
    const router = useRouter();
    const program = getProgram(connection, anchorWallet)
    useEffect(() => {

        const programId = new PublicKey(programIdString);

        // Fetch initial account data
        const initAccountData = async () => {
            const parsedAccount = await program?.account.raffle.all();
            console.log("parsedAccount", parsedAccount);
            // const accounts = await connection.getParsedProgramAccounts(programId);
            // console.log("Accounts", accounts);
            setRaffleAccounts(parsedAccount);
        };

        initAccountData();

        // Listen for program account changes
        const subscriptionId = connection.onProgramAccountChange(
            programId,
            async (accountInfo, context) => {
                // Fetch updated account data
                const parsedAccount = await program?.account.raffle.all();
                console.log("parsedAccount", parsedAccount);
                // const accounts = await connection.getParsedProgramAccounts(programId);
                // console.log("Accounts", accounts);
                setRaffleAccounts(parsedAccount);
            }
        );

        // Cleanup function to unsubscribe from event listener
        return () => {
            connection.removeProgramAccountChangeListener(subscriptionId);
        };
    }, [connection]);


    return (
        <>
            <Flex w={"100%"} align={"center"} justify={"flex-end"} px={30} pt={20}>
                <Button
                    onClick={() => {
                        router.push('/admin/create')
                    }}
                    size="lg"
                    color="violet"
                    radius={"md"}
                >
                    Create new Raffle
                </Button>
            </Flex>
            <Flex w={"100%"} h={"100%"} p={30} gap={30} wrap={"wrap"}>
                {raffleAccounts.map((account, ind) => (
                    <AdminRaffleCard account={account} key={ind.toString()} />
                ))}
            </Flex>
        </>
    );
};

export default AdminHome;
