import React, { useState } from "react";
import {ActionIcon, Container, Grid, Group, Stack, Text} from "@mantine/core";
import { IconPlayerPlay, IconSettings } from "@tabler/icons";
import { Test } from "@prisma/client";

interface Props {
  test: Test;
  handleRowClick: () => any;
}

function TestListItem({ test, handleRowClick }: Props) {
  const [settingsModal, setSettingsModal] = useState<boolean>(false);

  return (
    <Container
      p={"xs"}
      m={0}
      sx={(theme) => ({
        borderRadius: theme.radius.sm,
        "&:hover": {
          cursor: "pointer",
          backgroundColor: theme.colors.gray[2],
        },
      })}
    >
        <Group
          position={"left"}
          onClick={handleRowClick}
          styles={(theme) => ({
            root: {
              borderRadius: 8,
              maxHeight: 60,
              width: 320,
              whitespace: "nowrap",
              textOverflow: "ellipsis",
              "&:hover": {
                backgroundColor: theme.colors.gray[2],
              },
            },
          })}
        >
          <Text p={0} m={0} size={"sm"}>
            {test.name}
          </Text>
        </Group>
      {/*<Grid.Col span={4} m={"sx"}>*/}
      {/*  /!*<Group position={"right"}>*!/*/}
      {/*  /!*  <ActionIcon color={"gray"} variant={"subtle"} size={16}>*!/*/}
      {/*  /!*    <IconPlayerPlay />*!/*/}
      {/*  /!*  </ActionIcon>*!/*/}
      {/*  /!*  <ActionIcon*!/*/}
      {/*  /!*    color={"gray"}*!/*/}
      {/*  /!*    variant={"subtle"}*!/*/}
      {/*  /!*    size={16}*!/*/}
      {/*  /!*    onClick={() => {*!/*/}
      {/*  /!*      setSettingsModal(true);*!/*/}
      {/*  /!*    }}*!/*/}
      {/*  /!*  >*!/*/}
      {/*  /!*    <IconSettings />*!/*/}
      {/*  /!*  </ActionIcon>*!/*/}
      {/*  /!*</Group>*!/*/}
      {/*</Grid.Col>*/}
    </Container>
  );
  /* TODO: Test Settings Modal
            - Rename test
            - Delete test */
}

export default TestListItem;
