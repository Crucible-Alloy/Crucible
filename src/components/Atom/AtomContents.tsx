import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { MantineTheme, Paper, Text, useMantineTheme } from "@mantine/core";
import { AtomWithSource, AtomSourceWithRelations } from "../../../public/main";
import React from "react";
import { Atom, AtomInheritance, AtomSource, Relation } from "@prisma/client";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle } from "@tabler/icons";

const { ATOM, CONNECTION } = require("../../utils/constants");

interface Props {
  atom: AtomWithSource;
}
export function AtomContents({ atom }: Props) {
  const [srcData, setSrcData] = useState<AtomSourceWithRelations>(atom.srcAtom);
  const [acceptTypes, setAcceptTypes] = useState<string[]>([]);

  const renderType = ATOM;
  const theme = useMantineTheme();

  useEffect(() => {
    let acceptTypesSet = new Set<string>();
    window.electronAPI
      .getRelationsToAtom({
        label: srcData.label,
        projectID: srcData.projectID,
      })
      .then((resp: Relation[]) => {
        console.log(resp);
        resp.forEach((relation) => acceptTypesSet.add(relation.fromLabel));
        if (srcData.isChildOf.length > 0) {
          srcData.isChildOf.forEach((parent) => {
            window.electronAPI
              .getRelationsToAtom({
                label: parent.parentLabel,
                projectID: srcData.projectID,
              })
              .then((resp: Relation[]) => {
                console.log(resp);
                resp.forEach((relation) =>
                  acceptTypesSet.add(relation.fromLabel)
                );
                setAcceptTypes([...acceptTypesSet]);
              });
          });
        } else {
          setAcceptTypes([...acceptTypesSet]);
        }
      });

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
        metaData: srcData,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [renderType, atom, srcData]
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
    [atom, srcData]
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
    window.electronAPI
      .createConnection({
        projectID,
        testID,
        fromAtom,
        toAtom,
      })
      .then((resp: { success: boolean }) => {
        if (!resp.success) {
          showNotification({
            title: "Cannot add connection",
            message: `Adding that connection would exceed it's multiplicity.`,
            color: "red",
            icon: <IconAlertTriangle />,
          });
        }
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

  return srcData && atom ? (
    <Paper
      ref={drag}
      p="md"
      radius={"md"}
      role="DraggableBox"
      style={getAtomStyles(theme, srcData.shape, atom.left, atom.top)}
    >
      <Text
        ref={drop}
        p={"xl"}
        size={"xl"}
        color={srcData.color}
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
