import { IconFunction, IconZoomCode } from "@tabler/icons";
import { ActionIcon, Modal, Text, Title, Tooltip } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Predicate } from "./Predicate/Predicate";
import {
  AtomWithSource,
  PredInstanceWithParams,
  TestWithCanvas,
} from "../../public/main";

interface Props {
  projectID: number;
  testID: number;
}

function TestPredicatesBtn({ projectID, testID }: Props) {
  const [opened, setOpened] = useState(false);
  const [predicates, setPredicates] = useState<PredInstanceWithParams[]>([]);
  const [atoms, setAtoms] = useState<AtomWithSource[]>([]);

  async function fetchAndSetPredicates(testID: number) {
    const predicates: PredInstanceWithParams[] =
      await window.electronAPI.getPredicates(testID);
    setPredicates(predicates);
  }

  async function fetchAndSetAtoms(testID: number) {
    const test: TestWithCanvas = await window.electronAPI.readTest(testID);
    setAtoms(test.atoms);
  }

  useEffect(() => {
    // Initialize State
    fetchAndSetAtoms(testID).catch();
    fetchAndSetPredicates(testID).catch();

    // Bind listeners for database updates.
    window.electronAPI.listenForPredicatesChange((_event: any, value: any) => {
      console.log("Predicates Change");
      fetchAndSetPredicates(testID).catch();
    });
    window.electronAPI.listenForCanvasChange((_event: any, value: any) => {
      fetchAndSetAtoms(testID).catch();
    });
  }, [testID]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title size={"md"}>Predicates</Title>}
      >
        <Text size={"xs"} color={"dimmed"}>
          For each predicate, select a state and parameters.
        </Text>
        <br />
        {Object.entries(predicates).map(([key, value]) => (
          <Predicate key={key} predicate={value} atoms={atoms}></Predicate>
        ))}
      </Modal>
      <Tooltip label={"Predicates"} position={"bottom"}>
        <ActionIcon
          color={"violet"}
          variant={"light"}
          size={"lg"}
          onClick={() => setOpened(true)}
          style={{ zIndex: 1 }}
        >
          <IconFunction />
        </ActionIcon>
      </Tooltip>
    </>
  );
}

export default TestPredicatesBtn;
