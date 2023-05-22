import { getProgram } from "@/utils/program";
import { Card, Flex, Image, Text } from "@mantine/core";
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
  const parseRaffleInfo = async () => {
    const parsedAccount = account.account;
    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: parsedAccount.prize });
    console.log(`PArsed Account`, nft);
    console.log("Account Pub Key", parsedAccount);
    setParsedAccount(parsedAccount);
    //@ts-ignore
    setPrizeInfo(nft);
  };
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
        <Text fw={600} fz={25}>
          {parsedAccount && parsedAccount.name}
        </Text>
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
                {parsedAccount.ticketPrice.toNumber() / LAMPORTS_PER_SOL} SOL
              </Text>
            )}
          </Flex>
        </Flex>
        {parsedAccount &&
          (parsedAccount.startTime.toNumber() > Date.now() ? (
            <StartRaffle countdown={parsedAccount.startTime.toNumber()} />
          ) : (
            <RaffleButton
              countdown={new Date(parsedAccount.endTime.toNumber())}
              onClick={showRaffleDetails}
            />
          ))}
      </Card.Section>
    </Card>
  );
};

export default RaffleCard;
