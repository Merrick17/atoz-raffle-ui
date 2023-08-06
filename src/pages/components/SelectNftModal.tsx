import {
  AspectRatio,
  Card,
  Flex,
  Modal,
  Image,
  Text,
  createStyles,
  Group,
  Button,
} from "@mantine/core";
import { Metaplex } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
const useStyles = createStyles((theme) => ({
  card: {
    transition: "transform 150ms ease, box-shadow 150ms ease",

    "&:hover": {
      transform: "scale(1.01)",
      boxShadow: theme.shadows.md,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 600,
  },
}));
type SelectNftModalType = {
  isOpen: boolean;
  handleClose: () => void;
  handelConfirm: (nft: any) => void;
};
const SelectNftModal = ({
  isOpen,
  handleClose,
  handelConfirm,
}: SelectNftModalType) => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const metaplex = new Metaplex(connection);
  const [nftList, setNftList] = useState<any[]>([]);
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const { classes } = useStyles();
  const initNftList = async () => {
    if (connected && publicKey) {
      const nftFetchedList = await metaplex
        .nfts()
        .findAllByOwner({ owner: publicKey });
      console.log("Result", nftFetchedList.map((elm: any) => elm.mintAddress.toBase58()
      ))
      const result = nftFetchedList.map((elm) => {
        //@ts-ignore
        return metaplex.nfts().findByMint({ mintAddress: elm.mintAddress });
      });
      const finalNftList = await Promise.all(result);
      console.log("NFT", finalNftList);

       setNftList(finalNftList);
    }
  };
  useEffect(() => {
    initNftList();
  }, [connected, publicKey]);
  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      size={"lg"}
      centered
      title={"Select NFT as a prize"}
      styles={{
        root: { backgroundColor: "#3a416d" },
        body: { backgroundColor: "#3a416d" },
        header: { backgroundColor: "#3a416d" },
        title: { color: "#FFF", fontSize: 20, fontWeight: 600 },
        content: { borderRadius: 10, backgroundColor: "#3a416d" },
      }}
    >
      <Flex w={"100%"} h={"100%"} direction={"column"} gap={10}>
        {nftList.map((nft, ind: number) => (
          <Card p="md" radius="md" className={classes.card} key={ind.toString()}>
            <AspectRatio ratio={1920 / 1080}>
              <Image src={nft.json.image} fit="contain" />
            </AspectRatio>
            <Group position="apart">
              <Flex direction={"column"}>
                <Text className={classes.title} mt="md">
                  {nft.json.name}
                </Text>
                <Text
                  color="dimmed"
                  size="xs"
                  transform="uppercase"
                  weight={700}
                  mt={5}
                >
                  {nft.mint.address.toBase58()}
                </Text>
              </Flex>
              <Button
                color="red"
                fullWidth
                style={{ backgroundColor: "#ff3200" }}
                onClick={() => {
                  handelConfirm(nft);
                  handleClose();
                }}
              >
                Select
              </Button>
            </Group>
          </Card>
        ))}
      </Flex>
    </Modal>
  );
};

export default SelectNftModal;
