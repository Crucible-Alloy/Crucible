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

function EditAtomModal({ setModalOpened, opened, atom }: Props) {

  // TODO: Resolve conversion error in form. Data not making it to main process.
  // const form = useForm({
  //   initialValues: {
  //     nickName: "",
  //   },
  // });

  /* Asynchronously check for validation errors and if none, create the project on ipcMain */
  // function updateAtomNickName(values: { nickName: string } ) {
  //   console.log(values.nickName)
  //   console.log(atom.id)
  //   console.log(atom.testID)
  //   window.electronAPI
  //     .updateAtomNickname({atomID: atom.id.toString(), nickName: values.nickName, testID: atom.testID.toString()})
  //     .then((resp: { success: boolean; error: any; }) => {
  //       if (resp.error) {
  //         resp.error.forEach((error: any) => {
  //           form.setFieldError(error.path[0], error.message);
  //         });
  //       } else if (resp.success) {
  //         // Alert to success
  //       }
  //     });
  // }

  /* Close the modal and reset the form to default values. */
  function closeModal() {
    setModalOpened(false);
    // form.reset();
  }

  function deleteConnections() {
    // Delete all connections
    window.electronAPI.deleteConnection(atom.id).then((resp: {success: boolean, error?: string}) => {
      if (resp.success) {
        setModalOpened(false)
      } else {
        console.log(resp.error)
      }
    })
  }

  function deleteAtom() {
    window.electronAPI.deleteAtom(atom.id).then((resp: {success: boolean, error?: string}) => {
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
      title="Edit Atom"
    >
      {/*<form onSubmit={form.onSubmit((values) => updateAtomNickName(values))}>*/}
      {/*  <Stack>*/}
      {/*    <TextInput*/}
      {/*      required*/}
      {/*      withAsterisk*/}
      {/*      label="Atom Nickname"*/}
      {/*      description={"A way for you to easily identify the atom."}*/}
      {/*      icon={<IconTag />}*/}
      {/*      {...form.getInputProps("nickName")}*/}
      {/*    />*/}

      {/*    <Button m={"sm"} type="submit">*/}
      {/*      Update*/}
      {/*    </Button>*/}
      {/*  </Stack>*/}
      {/*</form>*/}

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
