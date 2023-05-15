import React, { CSSProperties, useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { ActionIcon, Flex, Group, MantineTheme, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { AtomWithSource, AtomSourceWithRelations } from "../../main";
import { Relation } from "@prisma/client";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle, IconPencil, } from "@tabler/icons";
import { ATOM, CONNECTION } from "../../utils/constants"
import ConnectionNode from "./ConnectionNode";
import EditAtomModal from "./EditAtomModal";
import ConnDependencyModal from "./ConnDependencyModal";

interface Props {
  atom: AtomWithSource;
  contentsBeingDragged: boolean;
}
export function AtomContents({ atom, contentsBeingDragged }: Props) {
  const [acceptTypes, setAcceptTypes] = useState<string[]>([]);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [dependsModalOpened, setDependsModalOpened] = useState<boolean>(false);

  const renderType = ATOM;
  const theme = useMantineTheme();

  useEffect(() => {
    const acceptTypesSet = new Set<string>();
    window.electronAPI
      .getRelationsToAtom({
        label: atom.srcAtom.label,
        projectID: atom.srcAtom.projectID,
      })
      .then((resp: Relation[]) => {
        console.log(resp);
        resp.forEach((relation) => acceptTypesSet.add(relation.fromLabel));
        if (atom.srcAtom.isChildOf.length > 0) {
          atom.srcAtom.isChildOf.forEach((parent) => {
            window.electronAPI
              .getRelationsToAtom({
                label: parent.parentLabel,
                projectID: atom.srcAtom.projectID,
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
        metaData: atom.srcAtom,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [renderType, atom]
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
              relation: item.relation
            });
        }

        return undefined;
      },
    }),
    [atom]
  );

  async function addNewConnection({
    projectID,
    testID,
    fromAtom,
    toAtom,
    relation,
  }: {
    projectID: number;
    testID: number;
    fromAtom: AtomWithSource;
    toAtom: AtomWithSource;
    relation: Relation;
  }) {

    if (relation.arityCount > 2) {
      setDependsModalOpened(true)
      return
    }

    window.electronAPI
      .createConnection({
        projectID,
        testID,
        fromAtom,
        toAtom,
        relation,
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

  // function getAtomStyles(
  //   theme: MantineTheme,
  //   shape: string,
  //   left: number,
  //   top: number
  // ): React.CSSProperties {
  //   // const transform = `translate3d(${left}px, ${top}px, 0)`
  //
  //   return {
  //     position: "absolute",
  //     // IE fallback: hide the real node using CSS when dragging
  //     // because IE will ignore our custom "empty image" drag preview.
  //     opacity: isDragging ? 0 : 1,
  //     backgroundColor: canDrop ? theme.colors.dark[3] : theme.colors.dark[5],
  //     margin: "auto",
  //   };
  // }

  function getAtomStyles(
    color: string,
    contentsBeingDragged: boolean,
    theme: MantineTheme,
    left: number,
    top: number,
  ): CSSProperties {
    const transform = `translate3d(${left}px, ${top}px, 0)`;

    const styles: CSSProperties = {
      overflow: 'hidden',
      minWidth: `${240}px`,
      minHeight: `${120}px`,
      position: "absolute",
      borderRadius: "4px",
      backgroundColor: theme.colors.gray[8],
      opacity: isDragging ? 0 : 1,
      filter: canDrop ? 'brightness(105%)' : '',
      boxShadow: canDrop ? 'rgba(80, 200, 120, .90) 0px 5px 16px' : '',
  };

    // If we are being dragged via the AtomContents module, leave the positioning to the drag layer.
    if (!contentsBeingDragged) {
      styles.transform = transform
      styles.WebkitTransform = transform
    }
    return styles
  }

  return atom ? (
    <Stack
      id={atom.id.toString()}
      ref={drag}
      role="DraggableBox"
      spacing={0}
      style={getAtomStyles(atom.srcAtom.color, contentsBeingDragged, theme, atom.left, atom.top)}
    >
      <Paper
        sx={{backgroundColor: atom.srcAtom.color, borderRadius: '4px 4px 0 0'}}
        p={'sm'}
      >
        <Flex justify={'space-between'}>
          <Text
            size={"md"}
            color={'white'}
            weight={900}
            align={"left"}
          >
            {` ${atom.nickname} `}
          </Text>
          <ActionIcon variant={'transparent'} color={'dark'} radius={'xl'} size={'sm'} onClick={() => setModalOpened(true)}>
            <IconPencil color={'white'}/>
          </ActionIcon>
        </Flex>
      </Paper>
      <Paper
      sx={{backgroundColor: theme.colors.gray[8]}}
      p={'sm'}
      >
        <Group>
          <div id={atom.id.toString() + 'receiver'} ref={drop} className={"connectionNode"} style={{backgroundColor: canDrop ? theme.colors.green[5] : theme.colors.gray[6]}}></div>
          <div>
            <Flex justify={'space-between'}>
              <Text color={'white'} weight={400}>{atom.srcAtom.label.split('/').at(-1)}</Text>
            </Flex>
            {atom.srcAtom.fromRelations.map((rel) => (
              <ConnectionNode color={theme.colors.gray[5]} name={rel.label} atom={atom} relation={rel} />
            ))}
          </div>
        </Group>
      </Paper>
      <EditAtomModal setModalOpened={setModalOpened} opened={modalOpened}  atom={atom}/>
      <ConnDependencyModal setModalOpened={setDependsModalOpened} opened={dependsModalOpened} atom={atom}/>
    </Stack>
  ) : (
    <Paper
      ref={drag}
      p="md"
      radius={"md"}
      role="DraggableBox"
    >
      <Text size={"xl"} weight={800}>
        {" "}
        {}{" "}
      </Text>
    </Paper>
  );
}
