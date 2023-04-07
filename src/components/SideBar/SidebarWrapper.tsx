import { Center, ActionIcon, Stack, Drawer, Box } from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconAtom,
  IconTestPipe,
} from "@tabler/icons";
import React, { useState } from "react";
import AtomsSidebarTab from "./AtomsSidebarTab";
import TestsSidebarTab from "./Tests/TestsSidebarTab";
import SettingsSidebarTab from "./SettingsSidebarTab";

interface Props {
  projectID: number;
}

function SidebarWrapper({ projectID }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const data = [
    {
      icon: IconAtom,
      label: "atoms",
      drawerContent: <AtomsSidebarTab projectID={projectID} />,
    },
    {
      icon: IconTestPipe,
      label: "tests",
      drawerContent: <TestsSidebarTab projectID={projectID} />,
    },
    {
      icon: IconAdjustmentsHorizontal,
      label: "settings",
      drawerContent: <SettingsSidebarTab projectID={projectID} />,
    },
  ];

  function handleClick(index: number) {
    if (index !== active) {
      setActive(index);
      setDrawerOpen(true);
    } else {
      setActive(null);
      setDrawerOpen(!drawerOpen);
    }
  }

  const items = data.map((item, index) => (
    <Center key={item.label} sx={() => ({ width: "100%" })}>
      <ActionIcon
        key={item.label}
        size={"xl"}
        radius={"lg"}
        variant={index === active ? "light" : "subtle"}
        color={index === active ? "blue" : "gray"}
        sx={(theme) => ({
          "&:hover": {
            backgroundColor: theme.colors.blue[0],
            color: theme.colors.blue[6],
          },
        })}
        onClick={() => handleClick(index)}
      >
        <item.icon size={34} />
      </ActionIcon>
    </Center>
  ));

  return (
    <>
      <Stack
        id={"sidebar"}
        py={"sm"}
        sx={(theme) => ({
          zIndex: 4,
          backgroundColor: theme.white,
          height: "100%",
        })}
      >
        {items}
      </Stack>
      <Drawer
        zIndex={2}
        opened={drawerOpen}
        withOverlay={false}
        size={400}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={(theme) => ({
            paddingLeft: "100px",
            paddingRight: theme.spacing.sm,
          })}
        >
          {active !== null ? data[active].drawerContent : ""}
        </Box>
      </Drawer>
    </>
  );
}

export default SidebarWrapper;
