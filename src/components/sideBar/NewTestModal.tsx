import React from "react";
import { Button, Modal, TextInput } from "@mantine/core";
import { IconTag } from "@tabler/icons";
import { useState } from "react";
import { Test } from "@prisma/client";

interface Props {
  opened: boolean;
  setModalOpened: (val: boolean) => any;
  setTests: (data: Test[]) => any;
  tests: Test[];
  projectID: number;
}

function NewTestModal({
  opened,
  setModalOpened,
  setTests,
  tests,
  projectID,
}: Props) {
  const [testName, setTestName] = useState("");

  function createNewTest() {
    window.electronAPI.createNewTest(projectID, testName).then(() => {
      window.electronAPI.getTests(projectID).then((newTests: Test[]) => {
        setTests(newTests);
        setModalOpened(false);
      });
    });
  }

  function updateName(val: string) {
    //console.log(val)
    setTestName(val);
  }

  return (
    <Modal
      opened={opened}
      onClose={() => setModalOpened(false)}
      title="Create a New Test"
    >
      <TextInput
        required
        placeholder="New Test"
        onChange={(event) => updateName(event.target.value)}
        label="Test Name"
        description={"Enter a name for the new test"}
        icon={<IconTag />}
      />
      <br />

      <Button m={"sm"} onClick={() => createNewTest()}>
        Create Test
      </Button>
    </Modal>
  );
}

export default NewTestModal;
