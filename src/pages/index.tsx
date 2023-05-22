import { useDrawer } from "@/context/Drawer";
import { getProgram } from "@/utils/program";
import { Drawer, Flex, Image, Text } from "@mantine/core";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import BuyTicket from "./components/BuyTicket";
import RaffleCard from "./components/RaffleCard";
import ClaimButton from "./components/ClaminButton";

const Home = () => {
  const programIdString = "2gYA2PGHSxWyVnhfHy9jAuyukcF8B3hLxSMWUN1dhzU8";
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { connected, publicKey } = useWallet();
  const [raffleAccounts, setRaffleAccounts] = useState<any[]>([]);
  const { isOpen, closeDrawer, raffleAccount, nftDetails } = useDrawer();
  const program = getProgram(connection, anchorWallet);
  const displayButton = () => {
    if (raffleAccount.endTime.toNumber() > Date.now() && raffleAccount.winner.toBase58() != "11111111111111111111111111111111") {
      return <ClaimButton />;
    } else {
      return (
        <BuyTicket countdown={new Date(raffleAccount.endTime.toNumber())} />
      );
    }
  };
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
      <Drawer
        opened={isOpen}
        onClose={closeDrawer}
        position="right"
        styles={{ content: { backgroundColor: "#3a416d" } }}
        title={raffleAccount && raffleAccount.name}
      >
        {raffleAccount && (
          <Flex
            w={"100%"}
            h={"100%"}
            mt={100}
            direction={"column"}
            p={20}
            gap={20}
            style={{ borderRadius: 10, backgroundColor: "#FFF" }}
          >
            {nftDetails && (
              <>
                <Image src={nftDetails.json.image} />
                <Text>{nftDetails.json.name}</Text>
                <Flex w={"100%"} justify={"space-between"} align={"center"}>
                  <Flex direction={"column"}>
                    <Text>Tickets Remaining</Text>
                    {raffleAccount && (
                      <Text fw={600} fz={20}>
                        {raffleAccount.ticketsBought.toNumber()}/
                        {raffleAccount.totalSuppy.toNumber()}
                      </Text>
                    )}
                  </Flex>
                  <Flex direction={"column"}>
                    <Text>Ticket Price</Text>
                    {raffleAccount && (
                      <Text fw={600} fz={20}>
                        {raffleAccount.ticketPrice.toNumber() /
                          LAMPORTS_PER_SOL}{" "}
                        SOL
                      </Text>
                    )}
                  </Flex>
                </Flex>
                {raffleAccount && displayButton()}
              </>
            )}
          </Flex>
        )}
      </Drawer>
      <Flex w={"100%"} h={"100%"} p={30} gap={30} wrap={"wrap"}>
        {raffleAccounts.map((account, ind) => (
          <RaffleCard account={account} key={ind.toString()} />
        ))}
      </Flex>
    </>
  );
};

export default Home;
