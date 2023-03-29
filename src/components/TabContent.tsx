import React from "react";
import { Box } from "@mantine/core";
import Canvas from "./Canvas";

import { Test } from "@prisma/client";
import { useViewportSize } from "@mantine/hooks";
import TestPredicatesBtn from "./TestPredicatesBtn";

const TestPlayBtn = require("./TestPlayBtn.js");
const TestSettingsBtn = require("./TestSettingsBtn.js");

interface Props {
  test: Test;
  projectID: number;
  mousePos: { x: number; y: number };
}

function TabContent({ test, projectID, mousePos }: Props) {
  const { width, height } = useViewportSize();
  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "scroll",
        backgroundColor: theme.colors.gray[0],
        border: "solid 1px gray",
      })}
    >
      <TestPredicatesBtn projectID={projectID} testID={test.id} />
      <Canvas projectID={projectID} testID={test.id} />
    </Box>
  );
}

export default TabContent;
