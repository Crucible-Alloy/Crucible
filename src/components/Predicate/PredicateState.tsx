import { Box, Center, Input, SegmentedControl } from "@mantine/core";
import { IconEqual, IconEqualNot, IconEyeOff } from "@tabler/icons";
import React, { useState } from "react";
import { PredInstanceWithParams } from "../../../public/main";

interface Props {
  predicate: PredInstanceWithParams;
}

export function PredicateState({ predicate }: Props) {
  const [stringState, setStringState] = useState(
    predicate.state === null ? "null" : predicate.state.toString()
  );

  function handleChange(value: string) {
    let boolVal: boolean | null = null;
    console.log("value: ", value);
    if (value === "true") {
      boolVal = true;
    } else if (value === "false") {
      boolVal = false;
    }

    console.log("calling updatePredicateState");

    window.electronAPI.updatePredicateState({
      predicateID: predicate.id,
      state: boolVal,
    });

    setStringState(value);
  }

  return (
    <Input.Wrapper
      label={predicate.predicate.name}
      description={"State"}
      mt={"xs"}
    >
      <SegmentedControl
        size={"xs"}
        mt={"xs"}
        mb={"sm"}
        value={stringState}
        onChange={(value) => handleChange(value)}
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
            value: "true",
          },
          {
            label: (
              <Center>
                <IconEqualNot size={16} />
                <Box ml={10}>Not Equals</Box>
              </Center>
            ),
            value: "false",
          },
        ]}
      />
    </Input.Wrapper>
  );
}
