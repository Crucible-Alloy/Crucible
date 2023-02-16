import {
  Button,
  Center,
  Container,
  ScrollArea,
  Stack,
  Title,
  Flex,
} from "@mantine/core";
import { useState } from "react";
import { useEffect } from "react";
import React from "react";
import { Test } from "@prisma/client";
import NewTestModal from "./NewTestModal";
import TestListItem from "./TestListItem";

const { SIDEBAR_WIDTH } = require("../../../../utils/constants");

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
  function handleRowClick(testID: number, projectID: number) {
    window.electronAPI.openTest({ testID, projectID });
  }

  return (
    <Container style={{ height: "100vh" }}>
      {tests.length > 0 ? (
        <Stack sx={{ height: "100vh" }}>
          <ScrollArea offsetScrollbars>
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
                  <TestListItem
                    test={value}
                    handleRowClick={() => handleRowClick(value.id, projectID)}
                  />
                </Container>
              </>
            ))}
          </ScrollArea>
          <Button
            sx={{ position: "absolute", bottom: 16 }}
            onClick={() => setModalOpened((o) => !o)}
          >
            New Test
          </Button>
        </Stack>
      ) : (
        <Center sx={{ height: "60vh" }}>
          <Stack>
            <Title order={4} color={"dimmed"} align={"center"}>
              You don't have any tests!
            </Title>
          </Stack>
          <Button
            sx={{ position: "fixed", bottom: 0 }}
            onClick={() => setModalOpened((o) => !o)}
          >
            New Test
          </Button>
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
