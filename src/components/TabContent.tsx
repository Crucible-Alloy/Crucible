import React from "react";
import { Box, Group } from "@mantine/core";
import Canvas from "./Canvas";

import { Test } from "@prisma/client";
import { useViewportSize } from "@mantine/hooks";
import TestPredicatesBtn from "./TestPredicatesBtn";
import TestPlayBtn from "./TestPlayBtn";

import TestSettingsBtn from "./TestSettingsBtn";

interface Props {
  test: Test;
  projectID: number;
  mousePos: { x: number; y: number };
}

function TabContent({ test, projectID, mousePos }: Props) {
  const { width, height } = useViewportSize();
  return (
    <>
      <Group
        style={{
          position: "absolute",
          top: 80,
          left: 40,
          margin: "16px",
          zIndex: 1,
        }}
      >
        <TestPlayBtn projectID={projectID} testID={test.id} disabled={false} />
        <TestPredicatesBtn projectID={projectID} testID={test.id} />
      </Group>
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
        <Canvas projectID={projectID} testID={test.id} />
      </Box>
    </>
  );
}

export default TabContent;
