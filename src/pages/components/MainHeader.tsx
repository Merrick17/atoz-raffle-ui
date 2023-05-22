import { Button, Group, Header, createStyles } from "@mantine/core";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
        backgroundColor: "#2a2f4f",
        padding: 20,
    },
    confirmButton: {
        backgroundColor: "#24243e",
    },
}));

const MainHeader = () => {
    const { classes, cx } = useStyles();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const router = useRouter();
    const { connected, publicKey } = useWallet();
    const adminWallet = "AToZYuagDiJn5j9qPvwAcnQjiTmoefHU3F6GgL3rPJVy";

    return (
        <Header height={90} p={20} className={classes.header} withBorder={false}>
            <Link href={"/"}>
                <Image
                    src={"/assets/imgs/atoz.png"}
                    alt="Atoz"
                    width={80}
                    height={80}
                    style={{ padding: 10 }}
                />
            </Link>
            <Group>
                <Button
                    onClick={() => {
                        router.push('/admin')
                    }}
                    size="lg"
                    color="violet"
                    radius={"md"}
                >
                    Admin
                </Button>

                <WalletMultiButton />
            </Group>
        </Header>
    );
};
export default MainHeader;
