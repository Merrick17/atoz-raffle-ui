import { Flex } from "@mantine/core";
import React from "react";
import MainHeader from "./MainHeader";
import { useViewportSize } from "@mantine/hooks";

const Layout = ({ children }: { children: any }) => {
  const { width, height } = useViewportSize();
  return (
    <Flex direction={"column"} justify={"center"} align={"center"} >
      <MainHeader />
      {children}
    </Flex>
  );
};

export default Layout;
