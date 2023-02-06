import {
  IconEqual,
  IconEqualNot,
  IconEyeOff,
  IconZoomCode,
} from "@tabler/icons";
import {
  Modal,
  Title,
  Text,
  SegmentedControl,
  Center,
  Box,
  Input,
  Tooltip,
  ActionIcon,
  Select,
} from "@mantine/core";
import React, { useEffect, useState } from "react";

export function TestPredicatesBtn({ projectID, testID }) {
  const [opened, setOpened] = useState(false);
  const [predicates, setPredicates] = useState({});
  const [canvasAtoms, setCanvasAtoms] = useState(loadCanvasAtoms);

  useEffect(() => {
    return () => {
      window.electronAPI.getPredicates(projectID).then((predicates) => {
        setPredicates(predicates);
      });
    };
  }, []);

  useEffect(() => {
    window.electronAPI.listenForPredicatesChange((_event, value) => {
      window.electronAPI.getPredicates(projectID).then((predicates) => {
        console.log(predicates);
        setPredicates(predicates);
      });
    });
  }, []);

  useEffect(() => {
    window.electronAPI.listenForCanvasChange((_event, value) => {
      loadCanvasAtoms();
    });
  }, []);

  function loadCanvasAtoms() {
    window.electronAPI.loadCanvasState(projectID, testID).then((data) => {
      setCanvasAtoms(data.atoms);
    });
  }

  function updatePredicate(predicateName, predicate) {
    window.electronAPI.setPredicate(projectID, predicateName, predicate);
  }

  function setPredicateMode(value, predicateName) {
    let predicate = Object.fromEntries(
      Object.entries(predicates).filter(([key, value]) => key === predicateName)
    );
    predicate[predicateName].status = value;
    window.electronAPI.setPredicate(
      projectID,
      predicateName,
      predicate[predicateName]
    );
  }

  function setPredicateParams(predicateName, paramlabel, selectValue) {
    let predicate = Object.fromEntries(
      Object.entries(predicates).filter(([key, value]) => key === predicateName)
    );
    console.log(paramlabel);
    console.log(selectValue);
    console.log(predicate[predicateName]);
    predicate[predicateName].params.forEach((param) => {
      if (param.label === paramlabel) {
        console.log("Found the right param");
        param.atom = selectValue;
      }
    });
    console.log(predicate[predicateName]);
    window.electronAPI.setPredicate(
      projectID,
      predicateName,
      predicate[predicateName]
    );
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title size={"md"}>Predicates</Title>}
      >
        <Text size={"xs"} color={"dimmed"}>
          Select a mode for the predicates you'd like to test.
        </Text>
        <br />
        {Object.entries(predicates).map(([key, value]) => (
          <Input.Wrapper label={key} description={"Test Mode"} mt={"xs"}>
            <SegmentedControl
              size={"xs"}
              mt={"xs"}
              mb={"sm"}
              value={value["status"]}
              onChange={(value) => setPredicateMode(value, key)}
              data={[
                {
                  label: (
                    <Center>
                      <IconEyeOff size={16} />
                      <Box ml={10}>Don't Test</Box>
                    </Center>
                  ),
                  value: "null",
                },
                {
                  label: (
                    <Center>
                      <IconEqual size={16} />
                      <Box ml={10}>Equals</Box>
                    </Center>
                  ),
                  value: "equals",
                },
                {
                  label: (
                    <Center>
                      <IconEqualNot size={16} />
                      <Box ml={10}>Not Equals</Box>
                    </Center>
                  ),
                  value: "negate",
                },
              ]}
            />
            {value["params"].map((param) => (
              <Select
                description={`Parameter: ${param.label}`}
                placeholder="Pick one"
                value={param.atom}
                onChange={(value) =>
                  setPredicateParams(key, param.label, value)
                }
                data={
                  // Get the Atom from the canvas that match the type of the parameter
                  Object.entries(canvasAtoms)
                    .filter(
                      ([key, atom]) => atom.atomLabel === param["paramType"]
                    )
                    .map(([key, atom]) => ({
                      value: atom.nickname,
                      label: atom.nickname,
                    }))
                }
              />
            ))}
          </Input.Wrapper>
        ))}
      </Modal>
      <Tooltip label={"Predicates"} position={"bottom"}>
        <ActionIcon
          color={"blue"}
          variant={"light"}
          onClick={() => setOpened(true)}
        >
          <IconZoomCode size={20} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}

export default TestPredicatesBtn;
