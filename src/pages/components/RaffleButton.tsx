import { Button, Center, Flex, Text } from "@mantine/core";
import { FC, useEffect } from "react";
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
  closed: boolean;
  useTimer: boolean;
  winner: string
};
const RaffleButton: FC<RaffleButtonProps> = ({
  countdown,
  onClick,
  closed,
  useTimer,
  winner
}) => {
  useEffect(() => {
    console.log("Winner", winner)
  }, [winner])
  return (
    <Center onClick={onClick} mt={10}>
      <Button color="red" radius={"md"} fullWidth size="lg" mt={"lg"} h={60} style={{ backgroundColor: "#ff3200" }}>
        <Flex direction={"column"} justify={"center"} align={"center"}>
          <Text fz={20}>{closed ? "Join Raffle" : "Sold Out"}</Text>
          {useTimer && (
            <span>
              {closed ? (
                <Countdown date={countdown} renderer={renderer} />
              ) : (
                <span style={{
                  fontWeight: 300, fontSize: 12, color: "#FFFF"
                }}>{winner !== "11111111111111111111111111111111" ? winner : "Winner not picked yet"}</span>
              )}
            </span>
          )}
          <Text fz={12}>{winner !== "11111111111111111111111111111111" ? winner : "Winner not picked yet"}</Text>
        </Flex>
      </Button>
    </Center>
  );
};

export default RaffleButton;
