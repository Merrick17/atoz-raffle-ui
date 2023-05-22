import { Button, Center, Flex, Text } from "@mantine/core";
import { FC } from "react";
import Countdown from "react-countdown";

// Renderer callback with condition
const renderer = ({
    hours,
    minutes,
    seconds,
    completed,
}: {
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
}) => {
    if (completed) {
        // Render a completed state
        return "Raffle Ended";
    } else {
        // Render a countdown
        return (
            <span>
                {hours}:{minutes}:{seconds}
            </span>
        );
    }
};
type RaffleButtonProps = {
    countdown: Date;
    onClick?: () => void;
};
const RaffleButton: FC<RaffleButtonProps> = ({ countdown, onClick }) => {
    
    return (
        <Center onClick={onClick} mt={10}>
            <Button color="violet" radius={"md"} fullWidth size="lg" mt={"lg"} h={60}>
                <Flex direction={"column"} justify={"center"} align={"center"}>
                    <Text fz={20}>View Raffle</Text>
                    <span>
                        <Countdown date={countdown} renderer={renderer} />
                    </span>
                </Flex>
            </Button>
        </Center>
    );
};

export default RaffleButton;
