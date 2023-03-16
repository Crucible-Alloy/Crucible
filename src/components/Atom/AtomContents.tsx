import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { MantineTheme, Paper, Text, useMantineTheme } from "@mantine/core";
import { AtomWithSource, AtomSourceWithRelations } from "../../../public/main";
import React from "react";

const { ATOM, CONNECTION } = require("../../utils/constants");

interface Props {
  atom: AtomWithSource;
}
export function AtomContents({ atom }: Props) {
  const [metaData, setMetaData] = useState<AtomSourceWithRelations>(
    atom.srcAtom
  );
  const [acceptTypes, setAcceptTypes] = useState<string[]>([]);

  const renderType = ATOM;
  const theme = useMantineTheme();

  useEffect(() => {
    //   window.electronAPI.listenForMetaDataChange((_event: any) => {
    //     window.electronAPI
    //       .getAtomSource(atom.id)
    //       .then((atom: AtomSourceWithRelations) => {
    //         setMetaData(atom);
    //       })
    //       .then(() => {
    //         if (metaData) {
    //           setAcceptTypes(metaData.toRelations.map((entry) => entry.toLabel));
    //         }
    //       });
    //   });
    // window.electronAPI
    //   .getAtomSource(atom.id)
    //   .then((atom: AtomSourceWithRelations) => {
    //     setMetaData(atom);
    //   })
    //   .then(() => {
    //     if (metaData) {
    //       setAcceptTypes(metaData.toRelations.map((entry) => entry.label));
    //     }
    //   });
    setAcceptTypes(metaData.toRelations.map((relation) => relation.fromLabel));
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    console.log("Accept Types: ", acceptTypes, atom.nickname);
  }, [acceptTypes]);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ATOM,
      item: {
        renderType,
        data: atom,
        metaData,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [renderType, atom, metaData]
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: acceptTypes,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
      drop(item: any, monitor) {
        console.log("AttemptedDrop");
        if (item.renderType === CONNECTION) {
          if (item.data.srcAtom)
            addNewConnection({
              projectID: item.data.srcAtom.projectID,
              testID: item.data.testID,
              fromAtom: item.data,
              toAtom: atom,
            });
        }

        return undefined;
      },
    }),
    [atom, metaData]
  );

  async function addNewConnection({
    projectID,
    testID,
    fromAtom,
    toAtom,
  }: {
    projectID: number;
    testID: number;
    fromAtom: AtomWithSource;
    toAtom: AtomWithSource;
  }) {
    window.electronAPI.createConnection({
      projectID,
      testID,
      fromAtom,
      toAtom,
    });
  }

  function getAtomStyles(
    theme: MantineTheme,
    shape: string,
    left: number,
    top: number
  ): React.CSSProperties {
    // const transform = `translate3d(${left}px, ${top}px, 0)`

    return {
      position: "relative",
      // IE fallback: hide the real node using CSS when dragging
      // because IE will ignore our custom "empty image" drag preview.
      // @ts-ignore
      opacity: isDragging ? 0 : 1,
      // @ts-ignore
      backgroundColor: canDrop ? theme.colors.dark[3] : theme.colors.dark[5],
      margin: "auto",
    };
  }

  return metaData && atom ? (
    <Paper
      ref={drag}
      p="md"
      radius={"md"}
      role="DraggableBox"
      style={getAtomStyles(theme, metaData.shape, atom.left, atom.top)}
    >
      <Text
        ref={drop}
        p={"xl"}
        size={"xl"}
        color={metaData.color}
        weight={800}
        align={"center"}
      >
        {` ${atom.nickname} `}
      </Text>
    </Paper>
  ) : (
    <Paper
      ref={drag}
      p="md"
      radius={"md"}
      role="DraggableBox"
      style={{ opacity: isDragging ? 0 : 1 }}
    >
      <Text ref={drop} size={"xl"} weight={800}>
        {" "}
        {}{" "}
      </Text>
    </Paper>
  );
}
