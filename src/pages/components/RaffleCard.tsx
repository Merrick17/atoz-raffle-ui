import { getProgram } from "@/utils/program";
import { Button, Card, Flex, Image, Text, Tooltip } from "@mantine/core";
import { Metaplex, Nft } from "@metaplex-foundation/js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import RaffleButton from "./RaffleButton";
import { useDrawer } from "@/context/Drawer";
import StartRaffle from "./StartRaffle";
type RaffleCardType = {
  account: any;
};
const RaffleCard = ({ account }: RaffleCardType) => {
  const { openDrawer, setAccount, setNftDetails, setRaffleAdr } = useDrawer();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const metaplex = new Metaplex(connection);
  const program = getProgram(connection, anchorWallet);
  const [parsedAccount, setParsedAccount] = useState<any>(null);
  const [prizeInfo, setPrizeInfo] = useState<Nft | null>(null);
  const [winnerInfo, setWinnerInfo] = useState<any>(null)
  const parseRaffleInfo = async () => {
    const parsedAccount = account.account;
    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: parsedAccount.prize });
    // console.log(`PArsed Account`, nft);
    // console.log("Account Pub Key", parsedAccount.startTime.toNumber());
    // console.log("End DATE",parsedAccount.endTime.toNumber())
    setParsedAccount(parsedAccount);
    //@ts-ignore
    setPrizeInfo(nft);
    getWinnerAdr();
  };
  const getWinnerAdr = async () => {
    if (parsedAccount && parsedAccount.winner.toBase58() !== "11111111111111111111111111111111") {
      const winningTicket = await program.account.ticket.fetch(parsedAccount.winner);
      console.log("Winning TIcket", winningTicket.owner.toBase58());
      setWinnerInfo(winningTicket);
    }
  }
  const showRaffleDetails = () => {
    setAccount(parsedAccount);
    setNftDetails(prizeInfo);
    setRaffleAdr(account.publicKey);
    openDrawer();
  };
  useEffect(() => {
    console.log("Raffle Account", account);
    parseRaffleInfo();
  }, [account]);
  return (
    <Card withBorder w={400} h={640} radius={"md"}>
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
        <Text fw={600} fz={25}>
          {parsedAccount && parsedAccount.name}
        </Text>
        <Flex w={"100%"} justify={"space-between"} align={"center"}>
          <Flex direction={"column"}>
            <Text>Tickets Sold</Text>
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
        {
          parsedAccount && <RaffleButton
            closed={parsedAccount.open}
            useTimer={parsedAccount.useTimer}
            countdown={new Date(parsedAccount.endTime.toNumber())}
            onClick={showRaffleDetails}
            winner={winnerInfo ? winnerInfo.owner.toBase58() : ""}
          />
        }
        {parsedAccount &&
          parsedAccount.winner.toBase58() !== "11111111111111111111111111111111" ? (
          <Tooltip label={parsedAccount.winner.toBase58()}>
            <Flex justify={"space-between"} align={"center"}>
              {parsedAccount.winner.toBase58() !==
                "11111111111111111111111111111111" ? (
                <>
                  <Text>Winner</Text>
                  <Text fw={600} fz={14} style={{ cursor: "pointer" }}>
                    {winnerInfo && winnerInfo.owner.toBase58().slice(0, 4)}...
                    {winnerInfo && winnerInfo.owner.toBase58().slice(-4)}
                  </Text>
                </>
              ) : (
                <Text color="white" style={{ visibility: "hidden" }}>
                  Winner not picked yet
                </Text>
              )}
            </Flex>
          </Tooltip>
        ) : (
          <Flex mt={130} h={150}>
            <Text></Text>
          </Flex>
        )}

        {parsedAccount &&
          (parsedAccount.startTime.toNumber() > Date.now() ? (
            <StartRaffle countdown={parsedAccount.startTime.toNumber()} />
          ) : (
            <RaffleButton
              closed={parsedAccount.open}
              useTimer={parsedAccount.useTimer}
              countdown={new Date(parsedAccount.endTime.toNumber())}
              onClick={showRaffleDetails}
              winner={winnerInfo ? winnerInfo.owner.toBase58() : ""}
            />
          ))}
      </Card.Section>
    </Card>
  );
};

export default RaffleCard;
