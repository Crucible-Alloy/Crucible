import {IconAlertTriangle, IconCheck, IconPlayerPlay, IconX} from "@tabler/icons";
import { Tooltip, ActionIcon } from "@mantine/core";
import React, { useState } from "react";
import { showNotification } from "@mantine/notifications";
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
      } else if (data === "Fail") {
        showNotification({
          title: "Failed",
          message: `The test is unsatisfiable`,
          color: "red",
          icon: <IconX />,
        });
        setRunning(false);
      } else {
        showNotification({
          title: "Error",
          message: `There was an error running your test.`,
          color: "red",
          icon: <IconAlertTriangle />,
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
