import React, { useState } from "react";
import {
  Box,
  Center,
  ColorInput,
  Input,
  Modal,
  SegmentedControl,
  Title,
} from "@mantine/core";
import { getColorArray } from "../../utils/helpers";
import { IconCircle, IconRectangle, IconTriangle } from "@tabler/icons";
import { AtomSource } from "@prisma/client";

interface Props {
  atomSource: AtomSource;
  opened: boolean;
  setModalOpened: (val: boolean) => void;
}

function AtomSourceSettingsModal({
  atomSource,
  opened,
  setModalOpened,
}: Props) {
  const [atomColor, setAtomColor] = useState(atomSource.color);
  const [shapeValue, setShapeValue] = useState(atomSource.shape);

  function handleColorChange(color: string) {
    setAtomColor(color);
    window.electronAPI.setAtomColor({ sourceAtomID: atomSource.id, color });
  }

  function handleShapeChange(shape: string) {
    setShapeValue(shape);
    window.electronAPI.setAtomShape({projectID: atomSource.projectID, sourceAtomID: atomSource.id, shape: shape});
  }

  return (
    <Modal
      opened={opened}
      onClose={() => setModalOpened(false)}
      title={<Title size={"sm"}>{`Edit Atom - ${atomSource.label}`}</Title>}
    >
      <Input.Wrapper
        mt={"xs"}
        label={"Atom Color"}
        description={"The color of the atom as it appears on the canvas."}
      >
        <ColorInput
          mt={"xs"}
          mb={"sm"}
          format="hex"
          value={atomColor}
          swatchesPerRow={12}
          onChange={(e) => handleColorChange(e)}
          swatches={getColorArray()}
        />
      </Input.Wrapper>

      // TODO: Add alternative shapes for atoms. Segmented control predefined below.
      {/*<Input.Wrapper*/}
      {/*  mt={"xs"}*/}
      {/*  label={"Atom Shape"}*/}
      {/*  description={"The shape of the atom as it appears on the canvas."}*/}
      {/*>*/}
      {/*  <SegmentedControl*/}
      {/*    size={"xs"}*/}
      {/*    mt={"xs"}*/}
      {/*    mb={"sm"}*/}
      {/*    value={shapeValue}*/}
      {/*    onChange={(e) => handleShapeChange(e)}*/}
      {/*    data={[*/}
      {/*      {*/}
      {/*        label: (*/}
      {/*          <Center>*/}
      {/*            <IconRectangle size={16} />*/}
      {/*            <Box ml={10}>Rectangle</Box>*/}
      {/*          </Center>*/}
      {/*        ),*/}
      {/*        value: "rectangle",*/}
      {/*      },*/}
      {/*      {*/}
      {/*        label: (*/}
      {/*          <Center>*/}
      {/*            <IconCircle size={16} />*/}
      {/*            <Box ml={10}>Circle</Box>*/}
      {/*          </Center>*/}
      {/*        ),*/}
      {/*        value: "circle",*/}
      {/*      },*/}
      {/*      {*/}
      {/*        label: (*/}
      {/*          <Center>*/}
      {/*            <IconTriangle size={16} />*/}
      {/*            <Box ml={10}>Triangle</Box>*/}
      {/*          </Center>*/}
      {/*        ),*/}
      {/*        value: "triangle",*/}
      {/*      },*/}
      {/*    ]}*/}
      {/*  />*/}
      {/*</Input.Wrapper>*/}
    </Modal>
  );
}

export default AtomSourceSettingsModal;
