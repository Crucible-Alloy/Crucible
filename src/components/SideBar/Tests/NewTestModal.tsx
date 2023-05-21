import React from "react";
import { Button, Modal, TextInput } from "@mantine/core";
import { IconTag } from "@tabler/icons";
import { Test } from "@prisma/client";
import { useForm } from "@mantine/form";

interface Props {
  opened: boolean;
  setModalOpened: (val: boolean) => void;
  setTests: (data: Test[]) => void;
  tests: Test[];
  projectID: number;
}

function NewTestModal({
  opened,
  setModalOpened,
  setTests,
  projectID,
}: Props) {
  const form = useForm({
    initialValues: {
      testName: "",
    },
  });

  function createNewTest(testName: string) {
    console.log("Create new test");
    window.electronAPI
      .createNewTest({ projectID, testName })
      .then((resp: { success: boolean; error: any; test?: Test }) => {
        console.log(resp);
        if (resp.error) {
          resp.error.forEach((error: any) => {
            console.log(error);
            form.setFieldError(error.path[0], error.message);
          });
        } else {
          console.log("Test created!");
          window.electronAPI.getTests(projectID).then((newTests: Test[]) => {
            setTests(newTests);
            setModalOpened(false);
            form.reset();
          });
        }
      });
  }

  return (
    <Modal
      opened={opened}
      onClose={() => setModalOpened(false)}
      title="Create a New Test"
    >
      <form
        onSubmit={form.onSubmit((values) => createNewTest(values.testName))}
      >
        <TextInput
          required
          placeholder="New Test"
          label="Test Name"
          description={"Enter a name for the new test"}
          icon={<IconTag />}
          {...form.getInputProps("testName")}
        />
        <br />

        <Button m={"sm"} type={"submit"}>
          Create Test
        </Button>
      </form>
    </Modal>
  );
}

export default NewTestModal;
