import React, {useEffect, useState} from "react";
import {Button, Group, Modal, Select, Stack, TextInput} from "@mantine/core";
import { IconTag } from "@tabler/icons";
import { useForm } from "@mantine/form";
import {AtomSourceWithRelations, AtomWithSource} from "../../main";
import {Relation} from "@prisma/client";

// TODO: Validation for project location to ensure no conflicting paths
// TODO: Zod schema validation for form?

interface Props {
  setModalOpened(val: boolean): void;
  opened: boolean;
  fromAtom: AtomWithSource | null;
  toAtom: AtomWithSource | null;
  connDependency: Relation;
}


function ConnDependencyModal({ setModalOpened, opened, connDependency, fromAtom, toAtom }: Props) {

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (opened) {
      console.log(fromAtom)
      console.log("Connections From: ", fromAtom.connsFrom)
    }
  }, [fromAtom, opened]);

  /* Close the modal and reset the form to default values. */
  function closeModal() {
    setModalOpened(false);
    // form.reset();
  }

  function createDependentConnection() {
    console.log(selected)
    window.electronAPI.createDependentConnection({
        projectID: fromAtom.srcAtom.projectID,
        testID: fromAtom.testID,
        fromAtom: fromAtom,
        toAtom: toAtom,
        relation: connDependency,
        dependency: selected,
      },
      ).then((resp: {success: boolean, error?: string}) => {
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
  {/*  Dropdown showing the atoms of the connection endpoint. */}
      <Stack>
        <Select
          label="Select an atom"
          placeholder="Pick one"
          value={selected}
          data={
            fromAtom ?
              fromAtom.connsFrom
                .filter((conn) => `{${conn.fromLabel}->${conn.toLabel}}` === connDependency.dependsOn)
                .map((conn) => {
                  return {value: conn.id.toString(), label: conn.toNick}
                })
              : null
          }
          onChange={setSelected}
        />
        <Button disabled={(selected === null)} onClick={() => createDependentConnection()}>OK</Button>
      </Stack>
  </Modal>
);
}

export default ConnDependencyModal;
