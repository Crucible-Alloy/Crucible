import React from "react";
import { Input } from "@mantine/core";
import { IconFileSearch } from "@tabler/icons";
import { useState } from "react";

interface Props {
  setSelectedFile(val: string): any;
  selectedFile: string;
}

function FileSelector(props: Props) {
  const [trimmedPath, setTrimmedPath] = useState<string>("");

  function trimFullPath(filePath: string): string {
    let segments = filePath.split("/");
    let stringCandidate = segments.pop();
    if (stringCandidate) {
      return stringCandidate;
    } else {
      return "";
    }
  }

  function handleSelectFile() {
    window.electronAPI.selectFile().then((filePath: string) => {
      setTrimmedPath(trimFullPath(filePath));
      props.setSelectedFile(filePath);
    });
  }

  return (
    <>
      <Input.Wrapper
        required
        labelElement="div"
        label={"Primary Alloy File"}
        description={"Select the Alloy file you wish to test."}
      >
        <Input
          icon={<IconFileSearch />}
          onClick={handleSelectFile}
          value={trimmedPath}
        />
      </Input.Wrapper>
      <br />
    </>
  );
}

export default FileSelector;
