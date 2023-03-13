import React, { useState } from "react";
import { ActionIcon, Grid, Group, Text } from "@mantine/core";
import { IconPlayerPlay, IconSettings } from "@tabler/icons";
import { Test } from "@prisma/client";

interface Props {
  test: Test;
  handleRowClick: () => any;
}

function TestListItem({ test, handleRowClick }: Props) {
  const [settingsModal, setSettingsModal] = useState<boolean>(false);

  return (
    <Grid
      p={"xs"}
      sx={(theme) => ({
        borderRadius: theme.radius.sm,
        "&:hover": {
          cursor: "pointer",
          backgroundColor: theme.colors.gray[2],
        },
      })}
    >
      <Grid.Col m={"sx"} span={"auto"} onClick={handleRowClick}>
        <Group
          position={"left"}
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
      </Grid.Col>
      <Grid.Col span={4} m={"sx"}>
        <Group position={"right"}>
          <ActionIcon color={"gray"} variant={"subtle"} size={16}>
            <IconPlayerPlay />
          </ActionIcon>
          <ActionIcon
            color={"gray"}
            variant={"subtle"}
            size={16}
            onClick={() => {
              setSettingsModal(true);
            }}
          >
            <IconSettings />
          </ActionIcon>
        </Group>
      </Grid.Col>
    </Grid>
  );
  /* TODO: Test Settings Modal
            - Rename test
            - Delete test */
}

export default TestListItem;
