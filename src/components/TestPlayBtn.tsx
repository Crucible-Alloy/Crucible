import { IconCheck, IconPlayerPlay, IconX } from "@tabler/icons";
import { Tooltip, ActionIcon } from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";
import React from "react";

interface Props {
  disabled: boolean;
  projectID: number;
  testID: number;
}
function TestPlayBtn({ disabled, projectID, testID }: Props) {
  const [running, setRunning] = useState(false);

  const runTest = () => {
    setRunning(true);
    window.electronAPI.runTest({ projectID, testID }).then((data: string) => {
      if (data === "Pass") {
        showNotification({
          title: "Passed",
          message: `The test is satisfiable`,
          color: "green",
          icon: <IconCheck />,
        });
        setRunning(false);
      } else {
        showNotification({
          title: "Failed",
          message: `The test is unsatisfiable`,
          color: "red",
          icon: <IconX />,
        });
        setRunning(false);
      }
    });
  };

  return (
    <Tooltip label={"Run"} position={"bottom"}>
      <ActionIcon
        disabled={disabled}
        color="teal"
        variant={"light"}
        onClick={() => {
          runTest();
        }}
        loading={running}
        style={{ zIndex: 1 }}
      >
        <IconPlayerPlay size={20} />
      </ActionIcon>
    </Tooltip>
  );
}

export default TestPlayBtn;
