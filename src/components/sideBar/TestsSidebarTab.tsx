import {
  Button,
  Center,
  Container,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useEffect } from "react";
import React from "react";
import { IconPlus } from "@tabler/icons";
import { Test } from "@prisma/client";
import NewTestModal from "./NewTestModal";
const { SidebarTestRow } = require("./SidebarTestRow");
const { SIDEBAR_WIDTH } = require("../../utils/constants");

interface Props {
  projectID: number;
}

function TestsSidebarTab({ projectID }: Props) {
  const [tests, setTests] = useState<Test[]>([]);
  const [modalOpened, setModalOpened] = useState(false);

  // Initialize Tests
  useEffect(() => {
    console.log("get tests");
    window.electronAPI.getTests(projectID).then((tests: Test[]) => {
      setTests(tests);
    });
  }, []);

  // TODO: Determine type of testObj
  function handleRowClick(testID: number, testObj: any) {
    let newTab = testObj;
    newTab.testKey = testID;
    // If there isn't a tab with a matching name, add the tab.
    window.electronAPI.openTab(projectID, newTab);
  }

  return (
    <Container>
      {tests.length > 0 ? (
        <>
          <ScrollArea style={{}} offsetScrollbars>
            {Object.entries(tests).map(([key, value]) => (
              <>
                <Container
                  p={"xs"}
                  styles={(theme) => ({
                    root: {
                      borderRadius: 8,
                      width: SIDEBAR_WIDTH - 50,

                      "&:hover": {
                        backgroundColor: theme.colors.gray[1],
                      },
                    },
                  })}
                >
                  <SidebarTestRow
                    test={value}
                    testKey={key}
                    handleRowClick={handleRowClick}
                  />
                </Container>
              </>
            ))}
          </ScrollArea>
          <Button onClick={() => setModalOpened((o) => !o)}>New Test</Button>
        </>
      ) : (
        <Center sx={{ height: "60vh" }}>
          <Stack>
            <Title order={4} color={"dimmed"} align={"center"}>
              You don't have any tests!
            </Title>
            <Button onClick={() => setModalOpened((o) => !o)}>New Test</Button>
          </Stack>
        </Center>
      )}
      <NewTestModal
        projectID={projectID}
        opened={modalOpened}
        tests={tests}
        setTests={setTests}
        setModalOpened={setModalOpened}
      />
    </Container>
  );
}

export default TestsSidebarTab;
