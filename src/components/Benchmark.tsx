import {IconCheck, IconPlayerPlay, IconTestPipe, IconX} from "@tabler/icons";
import { Tooltip, ActionIcon } from "@mantine/core";
import React, { useState } from "react";
import { showNotification } from "@mantine/notifications";
interface Props {
  disabled: boolean;
  projectID: number;
  testID: number;
}
function Benchmark({ disabled, projectID, testID }: Props) {
  const [running, setRunning] = useState(false);

  const benchmark = () => {
    setRunning(true);
    window.electronAPI.buildBenchmark().then((data: string) => {
      setRunning(false);
    });
  };

  return (
    <Tooltip label={"Run"} position={"bottom"}>
      <ActionIcon
        disabled={disabled}
        color="pink"
        variant={"light"}
        onClick={() => {
          benchmark();
        }}
        loading={running}
        style={{ zIndex: 1 }}
      >
        <IconTestPipe size={20} />
      </ActionIcon>
    </Tooltip>
  );
}

export default Benchmark;
