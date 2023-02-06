import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { ATOM, CONNECTION } from "../../utils/constants";
import { Paper, Text, useMantineTheme } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { AtomWithSource } from "../../../public/main";

interface Props {
  atom: AtomWithSource;
}
export function AtomContents({ atom }: Props) {
  const [atomData, setAtomData] = useState(initializeAtom);
  const [metaData, setMetaData] = useState(initializeMetaData);
  const [acceptTypes, setAcceptTypes] = useState([]);

  const renderType = ATOM;
  const theme = useMantineTheme();

  useEffect(() => {
    window.electronAPI.listenForMetaDataChange((_event) => {
      window.electronAPI.getAtom(projectKey, sourceAtomKey).then((atom) => {
        setMetaData(atom);
      });
    });
  }, []);

  useEffect(() => {
    window.electronAPI
      .getAcceptTypes(projectKey, sourceAtomKey)
      .then((types) => {
        setAcceptTypes(types);
      });
  }, []);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ATOM,
      item: {
        renderType,
        atom,
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
      drop(item: DragObject, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset();
        console.log("AttemptedDrop");
        if (item.renderType === CONNECTION) {
          console.log("Attempted connection");
          addNewConnection(item.id, atom.id);
        }

        return undefined;
      },
    }),
    [createConnection, atomData, metaData]
  );

  function createConnection(
    fromAtom,
    toAtom,
    fromAtomLabel,
    toAtomLabel,
    fromNickname,
    toNickname,
    connectionLabel
  ) {
    window.electronAPI.makeConnection(
      projectKey,
      testKey,
      fromAtom,
      toAtom,
      fromAtomLabel,
      toAtomLabel,
      fromNickname,
      toNickname,
      connectionLabel
    );
  }

  async function addNewConnection(fromAtomKey, toAtomKey) {
    let toAtom, fromAtom;
    let eligibleToAdd = true;
    let targetLabels = [];

    /* Get atom data and metadata. */
    function getAtom(atomKey) {
      return new Promise((resolve) => {
        window.electronAPI
          .getAtomInstance(projectKey, testKey, atomKey)
          .then((atomInstance) => {
            window.electronAPI
              .getAtom(projectKey, atomInstance["sourceAtomKey"])
              .then((atomMetaData) => {
                resolve({ data: atomInstance, metaData: atomMetaData });
              });
          });
      });
    }

    /* Get the toAtom and fromAtom data. */
    function getAtoms(fromAtomKey, toAtomKey, callback) {
      getAtom(toAtomKey).then((atom) => {
        toAtom = atom;
        getAtom(fromAtomKey).then((atom) => {
          fromAtom = atom;
          callback(fromAtom, toAtom);
        });
      });
    }

    /* Check for multiplicity violations.*/
    function findMatches(fromAtom, toAtom) {
      // Get relations of originating atom
      window.electronAPI
        .getRelations(projectKey, fromAtom.data.sourceAtomKey)
        .then((relations) => {
          // Get connections of the originating atom
          window.electronAPI
            .getConnections(projectKey, testKey, fromAtomKey)
            .then((connections) => {
              // Get the labels of the receiving atom and it's parents.
              targetLabels = [
                toAtom.metaData.label,
                ...toAtom.metaData.parents,
              ];
              // Filter the originating atom's relations by the two Atom' labels.
              let matchingRelations = relations.filter(
                (relation) =>
                  targetLabels.includes(relation.toLabel) &&
                  relation.fromLabel === fromAtom.metaData.label
              );

              // Make sure we only have one matching relation signature, or else way might have issues...
              if (matchingRelations.length > 1) {
                console.log(
                  `More than one relation with the signature ${fromAtom.metaData.label}->${toAtom.metaData.label}`
                );
                return;
              }

              // Check that the multiplicity of the matching relation is lone or one (otherwise we don't care).
              if (["lone", "one"].includes(matchingRelations[0].multiplicity)) {
                // Get the number of matching connections.
                console.log(matchingRelations[0].multiplicity);
                console.log(matchingRelations[0].connectionLabel);
                let numberOfConnections = connections.filter(
                  (connection) =>
                    connection.connectionLabel === matchingRelations[0].label
                ).length;
                if (numberOfConnections > 0) {
                  eligibleToAdd = false;
                }
              }

              if (eligibleToAdd) {
                createConnection(
                  fromAtomKey,
                  toAtomKey,
                  fromAtom.metaData.label,
                  toAtom.metaData.label,
                  fromAtom.data.nickname,
                  toAtom.data.nickname,
                  matchingRelations[0].label
                );
              } else {
                showNotification({
                  title: "Cannot add connection",
                  message: `Adding that connection would exceed it's ${matchingRelations[0].multiplicity} multiplicity.`,
                  color: "red",
                  icon: <IconAlertTriangle />,
                });
              }
            });
        });
    }

    getAtoms(fromAtomKey, toAtomKey, findMatches);
  }

  function getAtomStyles(theme, shape, left, top) {
    // const transform = `translate3d(${left}px, ${top}px, 0)`

    return {
      position: "relative",

      // IE fallback: hide the real node using CSS when dragging
      // because IE will ignore our custom "empty image" drag preview.
      opacity: isDragging ? 0 : 1,
      backgroundColor: canDrop ? theme.colors.dark[3] : theme.colors.dark[5],
      margin: "auto",
    };
  }

  function initializeAtom() {
    window.electronAPI.getAtomInstance(projectKey, testKey, id).then((atom) => {
      setAtomData(atom);
    });
  }

  function initializeMetaData() {
    window.electronAPI.getAtom(projectKey, sourceAtomKey).then((atom) => {
      setMetaData(atom);
    });
  }

  function deleteAtom(id) {
    window.electronAPI.deleteAtom(projectKey, testKey, id);
  }

  function deleteConnections(id) {
    window.electronAPI.deleteConnections(projectKey, testKey, id);
  }

  return metaData && atomData ? (
    <Paper
      ref={drag}
      p="md"
      radius={"md"}
      role="DraggableBox"
      style={getAtomStyles(theme, metaData.shape, left, top)}
    >
      <Text
        ref={drop}
        p={"xl"}
        size={"xl"}
        color={metaData.color}
        weight={800}
        align={"center"}
      >
        {" "}
        {atomData.nickname}{" "}
      </Text>
    </Paper>
  ) : (
    <Paper
      ref={drag}
      p="md"
      radius={"md"}
      role="DraggableBox"
      stye={{ opacity: isDragging ? 0 : 1 }}
    >
      <Text ref={drop} size={"xl"} weight={800}>
        {" "}
        {}{" "}
      </Text>
    </Paper>
  );
}
