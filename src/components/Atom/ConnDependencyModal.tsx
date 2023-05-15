import React from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { IconTag } from "@tabler/icons";
import { useForm } from "@mantine/form";
import { AtomWithSource } from "../../main";

// TODO: Validation for project location to ensure no conflicting paths
// TODO: Zod schema validation for form?

interface Props {
  setModalOpened(val: boolean): void;
  opened: boolean;
  atom: AtomWithSource;
}

function ConnDependencyModal({ setModalOpened, opened, atom }: Props) {

  /* Close the modal and reset the form to default values. */
  function closeModal() {
    setModalOpened(false);
    // form.reset();
  }

  function createDependentConnection() {
    // Delete all connections
    window.electronAPI.createDependentConnection().then((resp: {success: boolean, error?: string}) => {
      if (resp.success) {
        setModalOpened(false)
      } else {
        console.log(resp.error)
      }
    })
  }

  return (
    <Modal
      opened={opened}
  onClose={() => closeModal()}
  title="Select Dependency"
    >

  </Modal>
);
}

export default ConnDependencyModal;
