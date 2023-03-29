import React, { CSSProperties, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { AtomContents } from "./AtomContents";
import { useMantineTheme, Container } from "@mantine/core";
import { Atom, Project } from "@prisma/client";
import { AtomWithSource, AtomSourceWithRelations } from "../../../public/main";
import { CONNECTION } from "../../utils/constants";

const { v4: uuidv4 } = require("uuid");

function getAtomStyles(
  contentsBeingDragged: boolean,
  theme: any,
  shape: string,
  isDragging: boolean,
  left: number,
  top: number,
  color: string
): CSSProperties {
  const transform = `translate3d(${left}px, ${top}px, 0)`;

  // If we are being dragged via the AtomContents module, leave the positioning to the drag layer.
  if (!contentsBeingDragged) {
    return {
      position: "absolute",
      transform,
      WebkitTransform: transform,
      backgroundColor: color,
      borderRadius: "8px",
      border: `solid 20px ${isDragging ? theme.colors.green[5] : color}`,
    };
  } else {
    return {
      position: "absolute",
      backgroundColor: color,
      borderRadius: "8px",
      border: `solid 20px ${
        isDragging ? theme.colors.green[5] : theme.colors.dark[5]
      }`,
    };
  }
}

interface Props {
  atom: AtomWithSource;
  contentsBeingDragged: boolean;
}

export function AtomInstance({ contentsBeingDragged, atom }: Props) {
  const renderType = CONNECTION;
  const theme = useMantineTheme();
  const [metaData, setMetaData] = useState<AtomSourceWithRelations>(
    atom.srcAtom
  );
  const [atomTypes, setAtomTypes] = useState([atom.srcAtom.label]);

  // TODO: Check if any accept types are not at their multiplicity, set canDrag accordingly.
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    window.electronAPI.listenForMetaDataChange((_event: any, value: any) => {
      window.electronAPI
        .getAtomSource(atom.srcID)
        .then((srcAtom: AtomSourceWithRelations) => {
          setMetaData(srcAtom);
        });
    });
    let parentAtoms = atom.srcAtom.isChildOf.map(
      (parent) => parent.parentLabel
    );
    setAtomTypes([...atomTypes, ...parentAtoms]);
  }, []);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: atom.srcAtom.label,
      item: {
        renderType,
        data: atom,
        metaData,
        types: atomTypes,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [atom, metaData]
  );

  return isDragging ? (
    <Container
      ref={drag}
      id={atom.id.toString()}
      style={getAtomStyles(
        contentsBeingDragged,
        theme,
        metaData.shape,
        isDragging,
        atom.left,
        atom.top,
        metaData.color
      )}
      // role="ConnectionArrow"
    >
      <AtomContents atom={atom} />
    </Container>
  ) : (
    <Container
      ref={drag}
      id={atom.id.toString()}
      style={getAtomStyles(
        contentsBeingDragged,
        theme,
        metaData.shape,
        isDragging,
        atom.left,
        atom.top,
        metaData.color
      )}
      // role="ConnectionArrow"
    >
      <AtomContents atom={atom} />
    </Container>
  );
}
