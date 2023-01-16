import { Group, Input } from "@mantine/core";
import { IconFileSearch } from "@tabler/icons";
import { useEffect, useState } from "react";
import React from "react";

interface Props {
  projectID: number;
}

function SettingsSidebarTab({ projectID }: Props) {
  const [projectFile, setProjectFile] = useState<string>();

  useEffect(() => {
    window.electronAPI.getProjectFile(projectID).then((filePath: string) => {
      setProjectFile(trimFullPath(filePath));
    });
  }, []);

  function trimFullPath(filePath: string) {
    let segments = filePath.split("/");
    console.log(segments[-1]);
    return segments.pop();
  }

  function handleSelectFile() {
    window.electronAPI.updateProjectFile(projectID).then((filePath: string) => {
      console.log(filePath);
      setProjectFile(trimFullPath(filePath));
    });
  }

  return (
    <Group p={"sm"}>
      <Input.Wrapper
        labelElement="div"
        label={"Project File"}
        description={"Select the Alloy file you wish to test"}
      >
        <Input
          icon={<IconFileSearch />}
          onClick={() => handleSelectFile}
          value={projectFile}
        />
      </Input.Wrapper>
    </Group>
  );
}
export default SettingsSidebarTab;
