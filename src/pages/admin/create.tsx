import {
  Button,
  Flex,
  NumberInput,
  createStyles,
  Text,
  Image,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSquareRoundedPlus } from "@tabler/icons-react";
import SelectNftModal from "../components/SelectNftModal";
import { useMemo, useState } from "react";
import { Nft } from "@metaplex-foundation/js";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";
import { getProgram } from "@/utils/program";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { BN, utils } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { createTokenAccount } from "@/utils/ata";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
const useStyles = createStyles((theme) => ({
  selectNft: {
    width: 500,
    minHeight: 300,
    borderWidth: 3,
    // borderColor: "#FFFF",
    // borderRadius: 10,
    // borderStyle: "solid",
    marginTop: 15,
  },
  selectButton: {
    borderColor: "#FFFF",
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 3,
    padding: 0,
  },
}));
const create = () => {
  const { classes } = useStyles();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { publicKey, connected, sendTransaction } = useWallet();
  const form = useForm({
    initialValues: {
      totalSupply: 0,
      ticketPrice: 0,
      startDate: new Date(Date.now()),
      endDate: dayjs(new Date()).add(1, "week").toDate(),
    },

    validate: {
      totalSupply: (value) =>
        Number(value) <= 2 ? "At least 3 tickets" : null,
      ticketPrice: (value) =>
        Number(value) <= 0 ? "Price should be higher than 0" : null,
    },
    transformValues: (values) => ({
      totalSupply: Number(values.totalSupply) || 0,
      ticketPrice: Number(values.ticketPrice) || 0,
      endDate: values.endDate.getTime(),
      startDate: values.startDate.getTime(),
    }),
  });
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
  const [selectedPrize, setSelectedPrize] = useState<Nft | null>(null);
  const handleClose = () => {
    setSelectOpen(false);
  };
  const handleConfirm = (nft: any) => {
    setSelectedPrize(nft);
  };
  const handleOpenSelect = () => {
    setSelectOpen(true);
  };
  const handleSubmitForm = async (values: any) => {
    if (connected && publicKey) {
      if (!selectedPrize) {
        notifications.show({
          color: "red",
          title: "Error",
          message: "You need to select an nft as a prize",
        });
      } else {
        console.log("Values", values);
        const { totalSupply, ticketPrice, startDate, endDate } = values;
        const program = getProgram(connection, anchorWallet);
        let [raffleAdr] = PublicKey.findProgramAddressSync(
          [
            Buffer.from(utils.bytes.utf8.encode("atoz")),
            publicKey.toBuffer(),
            selectedPrize.mint.address.toBuffer(),
          ],
          program.programId
        );
        const { tokenAccount, tx } = await createTokenAccount(
          selectedPrize.mint.address,
          publicKey,
          publicKey
        );
        let [prizeTokenAdr, nonce] = PublicKey.findProgramAddressSync(
          [
            raffleAdr.toBuffer(),
            Buffer.from(utils.bytes.utf8.encode("proceeds")),
          ],
          program.programId
        );
        const initInstruction = await program.methods
          .initialize(
            //@ts-ignore
            new BN(totalSupply),
            new BN(ticketPrice * LAMPORTS_PER_SOL),
            new BN(startDate),
            new BN(endDate),
            selectedPrize.json?.name,
            selectedPrize.mint.address
          )
          .accounts({
            raffleAccount: raffleAdr,
            signer: publicKey,
            signerTokenAccount: tokenAccount,
            prizeMint: selectedPrize.mint.address,
            tokenProgram: TOKEN_PROGRAM_ID,
            prizeTokenAccount: prizeTokenAdr,
          })
          .instruction();
        const initTx = new Transaction();
        initTx.add(initInstruction);
        const sentTx = await sendTransaction(initTx, connection, {
          skipPreflight: true,
        });
        notifications.show({
          color: "teal",
          title: "Transaction Sent",
          message: (
            <span>
              View Transaction on{" "}
              {
                <a href={`https://solscan.io/tx/${sentTx}`} target="_blank">
                  Solscan
                </a>
              }
            </span>
          ),
        });
      }
    }
  };

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      p={20}
      gap={10}
      justify={"space-evenly"}
      align={"flex-start"}
    >
      <SelectNftModal
        isOpen={selectOpen}
        handleClose={handleClose}
        handelConfirm={handleConfirm}
      />
      <Flex w={"50%"} gap={10} direction={"column"} mah={400}>
        <form onSubmit={form.onSubmit((values) => handleSubmitForm(values))}>
          <NumberInput
            label="Total Ticket Supply"
            placeholder="100"
            size="md"
            styles={{
              label: {
                fontSize: 17,
                color: "#FFFF",
                fontWeight: 600,
                marginBottom: 5,
              },
            }}
            {...form.getInputProps("totalSupply")}
          />
          <NumberInput
            label="Ticket Price"
            placeholder="1"
            size="md"
            styles={{
              label: {
                fontSize: 17,
                color: "#FFFF",
                fontWeight: 600,
                marginBottom: 5,
              },
            }}
            {...form.getInputProps("ticketPrice")}
          />
          <DateInput
            label="Start Date"
            size="md"
            styles={{
              label: {
                fontSize: 17,
                color: "#FFFF",
                fontWeight: 600,
                marginBottom: 5,
              },
            }}
            {...form.getInputProps("startDate")}
          />
          <DateInput
            label="End Date"
            size="md"
            styles={{
              label: {
                fontSize: 17,
                color: "#FFFF",
                fontWeight: 600,
                marginBottom: 5,
              },
            }}
            {...form.getInputProps("endDate")}
            minDate={new Date()}
            maxDate={dayjs(new Date()).add(1, "month").toDate()}
          />
          <Button color="violet" type="submit" size="lg" mt={20}>
            Confirm Creation
          </Button>
        </form>
      </Flex>
      <Flex
        w={"30%"}
        gap={10}
        justify={"flex-end"}
        className={classes.selectNft}
        align={"center"}
        mah={400}
      >
        <Button
          fullWidth
          variant="outline"
          h={300}
          className={classes.selectButton}
          onClick={handleOpenSelect}
        >
          {!selectedPrize ? (
            <Flex
              direction={"column"}
              justify={"center"}
              align={"center"}
              gap={20}
            >
              <IconSquareRoundedPlus size={70} color="#FFF" />
              <Text fw={600} fz={24} color="#FFFF">
                Choose NFT for Raffle
              </Text>
            </Flex>
          ) : (
            <Image src={selectedPrize.json?.image} fit="contain" />
          )}
        </Button>
      </Flex>
    </Flex>
  );
};

export default create;
