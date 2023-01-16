import {
  Tabs,
  NavLink,
  Center,
  ActionIcon,
  Stack,
  Drawer,
  Space,
  Box,
} from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconAtom,
  IconTestPipe,
} from "@tabler/icons";
// import AtomsSidebarTab from "./AtomsSidebarTab";
// import SettingsSidebarTab from "./SettingsSidebarTab";
// import TestsSidebarTab from "./TestsSidebarTab";
import { useRef, useState } from "react";
import React from "react";
import AtomsSidebarTab from "./AtomsSidebarTab";
import TestsSidebarTab from "./TestsSidebarTab";
import SettingsSidebarTab from "./SettingsSidebarTab";

interface Props {
  projectID: number;
}

function SidebarWrapper({ projectID }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const ref = useRef(null);

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
    <Center sx={(theme) => ({ width: "100%" })}>
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
  // return (
  //   <Tabs
  //     color="blue"
  //     p={"none"}
  //     m={"sm"}
  //     defaultValue={"atoms"}
  //     variant={"pills"}
  //     radius={"xl"}
  //     orientation={"vertical"}
  //   >
  //     <Tabs.List>
  //       <Tabs.Tab value="atoms" icon={<IconAtom size={34} />}></Tabs.Tab>
  //       <Tabs.Tab value="tests" icon={<IconTestPipe size={34} />}></Tabs.Tab>
  //       <Tabs.Tab
  //         value="settings"
  //         icon={<IconAdjustmentsHorizontal size={34} />}
  //       ></Tabs.Tab>
  //     </Tabs.List>
  //
  //     <Tabs.Panel value={"atoms"}>
  //       <AtomsSidebarTab projectID={projectID} />
  //     </Tabs.Panel>
  //
  //     <Tabs.Panel value={"tests"}>
  //       <TestsSidebarTab projectID={projectID} />
  //     </Tabs.Panel>
  //
  //     <Tabs.Panel value={"settings"}>
  //       <SettingsSidebarTab projectID={projectID} />
  //     </Tabs.Panel>
  //   </Tabs>
  // );
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
