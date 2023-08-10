import withAdmin from "@/guards/withAdmin";
import { createTokenAccount } from "@/utils/ata";
import { getProgram } from "@/utils/program";
import { BN, utils } from "@coral-xyz/anchor";
import {
  Button,
  Flex,
  Group,
  Image,
  NumberInput,
  Switch,
  Text,
  TextInput,
  createStyles,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Metaplex, Nft, walletAdapterIdentity } from "@metaplex-foundation/js";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { IconSquareRoundedPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import SelectNftModal from "../components/SelectNftModal";
import * as anchor from "@coral-xyz/anchor";

const useStyles = createStyles((theme) => ({
  selectNft: {
    width: 250,
    minHeight: 300,
    borderWidth: 3,
    borderColor: "#0000",
    // borderRadius: 10,
    borderStyle: "solid",
    marginTop: 15,
  },
  selectButton: {
    borderColor: "#000",
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
  const [isTimerOn, setIsTimerOn] = useState(true);
  const [paywithSpl, setPayWithSpl] = useState(true);
  const { publicKey, connected, sendTransaction } = useWallet();
  const wallet = useWallet();
  const metaplex = new Metaplex(connection);
  metaplex.use(walletAdapterIdentity(wallet));

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
      ticketPrice: (value) => {
        console.log("Number", parseFloat(value.toString()));
        return parseFloat(value.toString()) <= 0
          ? "Price should be higher than 0"
          : null;
      },
    },
    transformValues: (values) => ({
      totalSupply: Number(values.totalSupply) || 0,
      ticketPrice: Number(values.ticketPrice) || 0,
      endDate: isTimerOn
        ? values.endDate.getTime()
        : new Date(8640000000000000).getTime(),
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
        console.log("NFT", selectedPrize);
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
        const tokenAccountInfo = await getAccount(connection, tokenAccount);
        const [edition] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            selectedPrize.mint.address.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID
        );
        const [signTokenRecord] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            selectedPrize.mint.address.toBuffer(),
            Buffer.from("token_record"),
            tokenAccount.toBuffer(),
          ],

          TOKEN_METADATA_PROGRAM_ID
        );
        const [prizeTokenRecord] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            selectedPrize.mint.address.toBuffer(),
            Buffer.from("token_record"),
            prizeTokenAdr.toBuffer(),
          ],

          TOKEN_METADATA_PROGRAM_ID
        );
        const initInstruction = await program.methods
          .initialize(
            //@ts-ignore
            new BN(totalSupply),
            paywithSpl
              ? new BN(ticketPrice * Math.pow(10, 9))
              : new BN(ticketPrice * LAMPORTS_PER_SOL),
            new BN(startDate),
            new BN(endDate),
            selectedPrize.json?.name,
            selectedPrize.mint.address,
            isTimerOn,
            paywithSpl,
            tokenAccountInfo.isFrozen
          )
          .accounts({
            raffleAccount: raffleAdr,
            signer: publicKey,
            signerTokenAccount: tokenAccount,
            prizeMint: selectedPrize.mint.address,
            tokenProgram: TOKEN_PROGRAM_ID,
            prizeTokenAccount: prizeTokenAdr,
            tokenMetadata: selectedPrize.metadataAddress,
            signerTokenRecordAccount: signTokenRecord,
            prizeTokenRecordAccount: prizeTokenRecord,
            authorizationRules: new PublicKey(
              "eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9"
            ),
            authorizationRulesProgram: new PublicKey(
              "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg"
            ),
            sysvarInstructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            editionAt: edition,
            ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            mplTokenProgram:TOKEN_METADATA_PROGRAM_ID

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
          <Flex gap={4}>
            <Group position="left">
              <Text
                style={{
                  fontSize: 17,

                  fontWeight: 600,
                }}
              >
                Timer:
              </Text>
              <Switch
                onLabel="ON"
                offLabel="OFF"
                size="lg"
                color="indigo"
                styles={{
                  label: {
                    fontSize: 17,

                    fontWeight: 600,
                    marginBottom: 5,
                    marginTop: 5,
                  },
                }}
                checked={isTimerOn}
                onChange={(e) => setIsTimerOn(e.target.checked)}
              />
            </Group>
            <Group position="left">
              <Text
                style={{
                  fontSize: 17,

                  fontWeight: 600,
                }}
              >
                Pay with SPL(SOUL):
              </Text>
              <Switch
                onLabel="ON"
                offLabel="OFF"
                size="lg"
                color="indigo"
                styles={{
                  label: {
                    fontSize: 17,

                    fontWeight: 600,
                    marginBottom: 5,
                    marginTop: 5,
                  },
                }}
                checked={paywithSpl}
                onChange={(e) => setPayWithSpl(e.target.checked)}
              />
            </Group>
          </Flex>
          <NumberInput
            label="Total Ticket Supply"
            placeholder="100"
            size="md"
            styles={{
              label: {
                fontSize: 17,

                fontWeight: 600,
                marginBottom: 5,
                marginTop: 5,
              },
            }}
            {...form.getInputProps("totalSupply")}
          />
          <TextInput
            label="Ticket Price"
            placeholder="1"
            size="md"
            type="text"
            styles={{
              label: {
                fontSize: 17,

                fontWeight: 600,
                marginBottom: 5,
                marginTop: 5,
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

                fontWeight: 600,
                marginBottom: 5,
                marginTop: 5,
              },
            }}
            {...form.getInputProps("startDate")}
          />
          <DateInput
            label="End Date"
            size="md"
            disabled={!isTimerOn}
            styles={{
              label: {
                fontSize: 17,

                fontWeight: 600,
                marginBottom: 5,
                marginTop: 5,
              },
            }}
            {...form.getInputProps("endDate")}
            minDate={new Date()}
            maxDate={dayjs(new Date()).add(1, "month").toDate()}
          />
          <Button
            color="red"
            type="submit"
            size="lg"
            mt={20}
            style={{ backgroundColor: "#ff3200" }}
          >
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
              <IconSquareRoundedPlus size={70} />
              <Text fw={600} fz={24} color="dark">
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
//export default
export default withAdmin(create);
