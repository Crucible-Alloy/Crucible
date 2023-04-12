import React, { useEffect } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { IconFileSearch, IconFolders, IconTag } from "@tabler/icons";
import { useForm } from "@mantine/form";
import { NewProject } from "../../validation/formValidation";
import { AtomWithSource } from "../../main";

// TODO: Validation for project location to ensure no conflicting paths
// TODO: Zod schema validation for form?

interface Props {
  setModalOpened(val: boolean): void;
  opened: boolean;
  atom: AtomWithSource;
}

function EditAtomModal({ setModalOpened, opened, atom }: Props) {
  const form = useForm({
    initialValues: {
      nickName: atom.nickname,
    },
  });

  // Set the default project location in the form
  // TODO: Can this be moved into initial values somehow? I think the issue is that it is async.
  useEffect(() => {
    window.electronAPI.getHomeDirectory().then((homedir: string) => {
      form.setFieldValue("projectPath", `${homedir}/aSketchProjects/`);
    });
  }, [opened]);

  /* Asynchronously check for validation errors and if none, create the project on ipcMain */
  function updateAtomNickName(values: {nickName: string}) {
    window.electronAPI
      .updateAtomNickName(values.nickName)
      .then((resp: { success: boolean; error: any; }) => {
        if (resp.error) {
          resp.error.forEach((error: any) => {
            form.setFieldError(error.path[0], error.message);
          });
        } else if (resp.success) {
          // Alert to success
        }
      });
  }

  /* Close the modal and reset the form to default values. */
  function closeModal() {
    setModalOpened(false);
    form.reset();
  }

  function deleteConnections() {
    // Delete all connections
  }

  function deleteAtom() {
    // Delete the atom (and all connections)
  }

  return (
    <Modal
      opened={opened}
      onClose={() => closeModal()}
      title="Edit Atom"
    >
      <form onSubmit={form.onSubmit((values) => updateAtomNickName(values))}>
        <Stack>
          <TextInput
            required
            withAsterisk
            label="Atom Nickname"
            description={"A way for you to easily identify the atom."}
            icon={<IconTag />}
            {...form.getInputProps("nickName")}
          />

          <Button m={"sm"} type="submit">
            Update
          </Button>
        </Stack>
      </form>

      <Group grow>
        <Button color='red' m={'sm'} onClick={() => deleteConnections()}>
          Delete Connections
        </Button>
        <Button color='red' m={'sm'} onClick={() => deleteAtom()}>
          Delete Atom
        </Button>
      </Group>
    </Modal>
  );
}

export default EditAtomModal;
