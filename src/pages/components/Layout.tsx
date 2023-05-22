import { Flex } from "@mantine/core";
import React from "react";
import MainHeader from "./MainHeader";
import { useViewportSize } from "@mantine/hooks";

const Layout = ({ children }: { children: any }) => {
  const { width, height } = useViewportSize();
  return (
    <Flex direction={"column"} w={width} h={height}>
      <MainHeader />
      {children}
    </Flex>
  );
};

export default Layout;
