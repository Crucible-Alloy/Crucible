import React, {useEffect, useState} from "react";
import {Button, Group, Modal, Select, Stack, TextInput, Title, Text} from "@mantine/core";
import {IconAlertTriangle, IconArrowLeft, IconArrowRight, IconTag} from "@tabler/icons";
import { useForm } from "@mantine/form";
import {AtomSourceWithRelations, AtomWithSource} from "../../main";
import {Connection, Relation} from "@prisma/client";
import {showNotification} from "@mantine/notifications";

interface Props {
  setModalOpened(val: boolean): void;
  opened: boolean;
  fromAtom: AtomWithSource | null;
  relation: Relation | null;
  atoms: AtomWithSource[];
}


function ConnDependencyModal({ setModalOpened, opened, relation, fromAtom, atoms }: Props) {

  const [oneSelected, setOneSelected] = useState<string>(null);
  const [twoSelected, setTwoSelected] = useState<string>(null);
  const [threeSelected, setThreeSelected] = useState<string>(null);

  const [typeOne, setTypeOne] = useState<string>(null);
  const [typeTwo, setTypeTwo] = useState<string>(null)
  const [typeThree, setTypeThree] = useState<string>(null);

  useEffect(() => {
    const typesString = relation.type.replace(/{|}/g, '')
    const types = typesString.split('->');
    setTypeOne(types[0])
    setTypeTwo(types[1])
    setTypeThree(types[2])
    if (fromAtom) {
      if (fromAtom.srcAtom.label === typeOne) {
        console.log(fromAtom.id)
        setOneSelected(fromAtom.id.toString())
      }
      else if (fromAtom.srcAtom.label === typeTwo) {
        setTwoSelected(fromAtom.id.toString())
      }
      else if (fromAtom.srcAtom.label === typeThree) {
        setThreeSelected(fromAtom.id.toString())
      }
    }
  }, [fromAtom]);

  /* Close the modal and reset the form to default values. */
  function closeModal() {
    setModalOpened(false);
  }

  function createDependentConnection() {

    const atomOneID = parseInt(oneSelected)
    const atomTwoID = parseInt(twoSelected)
    const atomThreeID = parseInt(threeSelected)

    window.electronAPI.helloWorld({
      projectID: fromAtom.srcAtom.projectID,
      testID: fromAtom.testID,
      atomOneID,
      atomTwoID,
      atomThreeID,
      relation
    })
    // } ).then((resp: { success: boolean }) => {
    //     if (!resp.success) {
          // showNotification({
          //   title: "Cannot add connection",
          //   message: `Adding that connection would exceed its multiplicity.`,
          //   color: "red",
          //   icon: <IconAlertTriangle />,
          // });
  }

  function getAtomsOfType(type: string) {
    // Try to filter by string type
    let data = atoms
      .filter((a) => a.srcAtom.label === type)
      .map((b) => {
        return {value: b.id.toString(), label: b.nickname}
      })
    if (data.length > 0) {
      return data
    } else {
      // No basic atoms found, need to check isChildOF
      data = atoms
        .filter((a) => a.srcAtom.isChildOf.map(
          (b) => b.parentLabel).includes(type)
        ).map(
          (c) => {
          return {value: c.id.toString(), label: c.nickname}
        })

      return data
    }

  }

  return (
    <Modal
      opened={opened}
      size={'xl'}
      onClose={() => closeModal()}
      title={<Title size={'md'}>Create Connection</Title>}
    >
  {/*  Dropdown showing the atoms of the connection endpoint. */}
      <Stack>
        <Title size={'sm'}>{fromAtom ? fromAtom.nickname : 'Nickname'}: {relation.label}</Title>
        <Text size={'sm'}>{relation.type}</Text>
        <Group>
          <Select
            size={'xs'}
            label={`Atom 1 - ${typeOne}`}
            placeholder="Pick one"
            value={oneSelected}
            data={
              atoms ?
                atoms
                  .filter((a) => a.srcAtom.label === typeOne)
                  .map((b) => {
                    return {value: b.id.toString(), label: b.nickname}
                  })
                : null
            }
            onChange={setOneSelected}
          />
          <IconArrowRight size={16}/>
          <Select
            size={'xs'}
            label={`Atom 2 - ${typeTwo}`}
            placeholder="Pick one"
            value={twoSelected}
            data={ atoms ?
              atoms
              .filter((a) => a.srcAtom.label === typeTwo)
              .map((b) => {
              return {value: b.id.toString(), label: b.nickname}
            })
              : null
            }
            onChange={setTwoSelected}
          />
          <IconArrowRight size={16}/>
          <Select
            size={'xs'}
            label={`Atom 3 - ${typeThree}`}
            placeholder="Pick one"
            value={threeSelected}
            data={
              atoms ? getAtomsOfType(typeThree) : null

            }
            onChange={setThreeSelected}
          />
        </Group>
        <Button disabled={(oneSelected === null || twoSelected === null || threeSelected === null)} onClick={() => createDependentConnection()}>OK</Button>
      </Stack>
  </Modal>
);
}

export default ConnDependencyModal;
