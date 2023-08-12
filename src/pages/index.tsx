import { useDrawer } from "@/context/Drawer";
import { getProgram } from "@/utils/program";
import { Drawer, Flex, Image, Tabs, Text, Tooltip } from "@mantine/core";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import BuyTicket from "./components/BuyTicket";
import ClaimButton from "./components/ClaminButton";
import RaffleCard from "./components/RaffleCard";
import { useViewportSize } from "@mantine/hooks";

const Home = () => {
  const programIdString = "BXpLxLCwAwqP9d273RH9n7GNzsyafrt5wMp658Qg2hcv";
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { connected, publicKey } = useWallet();
  const [raffleAccounts, setRaffleAccounts] = useState<any[]>([]);
  const { isOpen, closeDrawer, raffleAccount, nftDetails } = useDrawer();
  const program = getProgram(connection, anchorWallet);
  const { width } = useViewportSize();
  const displayButton = () => {
    if (raffleAccount) {
      if (
        raffleAccount.endTime.toNumber() > Date.now() &&
        raffleAccount.winner.toBase58() != "11111111111111111111111111111111"
      ) {
        return <ClaimButton />;
      } else {
        return (
          <BuyTicket
            useTimer={raffleAccount.useTimer}
            closed={raffleAccount.open}
            countdown={new Date(raffleAccount.endTime.toNumber())}
          />
        );
      }
    } else {
      return <></>;
    }
  };
  useEffect(() => {
    const programId = new PublicKey(programIdString);

    // Fetch initial account data
    const initAccountData = async () => {
      const parsedAccount = await program?.account.raffle.all();
      console.log(
        "parsedAccount",
        parsedAccount.map((elm) => elm.publicKey.toBase58())
      );
      const accountList = parsedAccount.filter(
        (elm) =>
          ![
            "FbbyTtSyyTu7Stbx7RMYXfbwrfgDJxsEd9Z3yvHnUoYp",
            "8SDgKd6R9w6Xqo8BULYP8aJz4XmK158KQk4z7x4DPnk8",
            "BxFDN37re5ZU8ZQb3WvXpZBWkYkfN6mGx4aAPzEKqLQq",
            "HbW8StbrbE9Fk77Szc5Wjgj9nQsnnggzPmrUZMSRRZqH",
          ].includes(elm.publicKey.toBase58())
      );
      console.log("ACOUNT LIST", accountList);

      setRaffleAccounts(accountList);
      // const accounts = await connection.getParsedProgramAccounts(programId);
      // console.log("Accounts", accounts);
    };

    initAccountData();

    // Listen for program account changes
    const subscriptionId = connection.onProgramAccountChange(
      programId,
      async (accountInfo, context) => {
        // Fetch updated account data
        const parsedAccount = await program?.account.raffle.all();

        const accountList = parsedAccount;

        console.log("ACOUNT LIST", accountList);

        setRaffleAccounts(accountList);
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
            style={{
              borderRadius: 10,
              backgroundColor: "#FFF",
              border: "0.0625rem solid #dee2e6",
            }}
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
                    <Text>Ticket Price: </Text>
                    {raffleAccount && (
                      <Text fw={600} fz={20}>
                        {!raffleAccount.useSplPay
                          ? `${raffleAccount.ticketPrice.toNumber() / LAMPORTS_PER_SOL
                          } SOL`
                          : `${raffleAccount.ticketPrice.toNumber() / Math.pow(10, 9)
                          } SOUL`}
                      </Text>
                    )}
                  </Flex>
                </Flex>
                {raffleAccount &&
                  raffleAccount.winner.toBase58() !==
                  "11111111111111111111111111111111" && (
                    <Tooltip label={raffleAccount.winner.toBase58()}>
                      <Flex
                        justify={"space-between"}
                        align={"center"}
                        style={{ cursor: "pointer" }}
                      >
                        <Text>Winner: </Text>
                        {raffleAccount && (
                          <Text fw={600} fz={20}>
                            {raffleAccount.winner.toBase58().slice(0, 4)}....{" "}
                            {raffleAccount.winner.toBase58().slice(-4)}
                          </Text>
                        )}
                      </Flex>
                    </Tooltip>
                  )}
                {raffleAccount && displayButton()}
              </>
            )}
          </Flex>
        )}
      </Drawer>
      <Flex w={width * 0.67} h={"100%"} mt={10} justify={"center"}>
        <Tabs
          defaultValue="actives"
          w={"100%"}
          color="red"
          styles={{ tabsList: { borderBottom: "none" } }}
        >
          <Tabs.List>
            <Tabs.Tab value="actives">
              <Text style={{ color: "rgb(255, 50, 0)" }} fw={"bold"} fz={20}>
                Active Raffles
              </Text>
            </Tabs.Tab>
            <Tabs.Tab
              value="passives"
              style={{ color: "rgb(255, 50, 0)" }}
              fw={"bold"}
              fz={20}
            >
              Passive Raffles
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="actives" pt="xs">
            <Flex w={"100%"} justify={"flex-start"} gap={42} wrap={"wrap"}>
              {raffleAccounts
                .filter((elm) => {
                  console.log(" elm.account.visible", elm.account);
                  return elm.account.visible;
                })
                .filter((elm) => elm.account.open && !elm.account.claimed)
                .map((account, ind) => (
                  <RaffleCard account={account} key={ind.toString()} />
                ))}
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="passives" pt="xs">
            <Flex w={"100%"} justify={"flex-start"} gap={42} wrap={"wrap"}>
              {raffleAccounts
                .filter((elm) => elm.account.visible)
                .filter((elm) => !elm.account.open)
                .map((account, ind) => (
                  <RaffleCard account={account} key={ind.toString()} />
                ))}
            </Flex>
          </Tabs.Panel>
        </Tabs>
      </Flex>
    </>
  );
};

export default Home;
