import {
  Affix,
  Button,
  Center,
  Container, Divider,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import React, { useState, useEffect } from "react";
import { Test } from "@prisma/client";
import NewTestModal from "./NewTestModal";
import TestListItem from "./TestListItem";

import { SIDEBAR_WIDTH } from "../../../utils/constants";

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
    <Container style={{ height: "100vh", width: '240px', position: 'absolute' }}>
      <Title pb={'sm'} size={'md'}>Your Tests</Title>
      {tests.length > 0 ? (
        <>
        <Stack sx={{height: '100%', width: '100%', position: 'relative'}} justify={'flex-start'} p={0}>
          <ScrollArea offsetScrollbars>
            {Object.entries(tests).map(([, value]) => (
              <>
                <TestListItem
                  test={value}
                  handleRowClick={() => handleRowClick(value.id, projectID)}
                />
                <Divider/>
              </>
            ))}
          </ScrollArea>
        </Stack>
        <Button
          sx={{width: '240px', position: 'fixed', bottom: 16}}
          onClick={() => setModalOpened((o) => !o)}
        >
          New Test
        </Button>
        </>
      ) : (
        <Center sx={{ height: "60vh" }}>
          <Stack justify={'space-around'}>
            <Title order={4} color={"dimmed"} align={"center"}>
              You don't have any tests!
            </Title>
            <Button
              onClick={() => setModalOpened((o) => !o)}
            >
              New Test
            </Button>
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
