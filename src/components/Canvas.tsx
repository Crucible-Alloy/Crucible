import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import Xarrow from "react-xarrows";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle } from "@tabler/icons";
import { useClickOutside } from "@mantine/hooks";
import { Affix, Popover, Select, Title } from "@mantine/core";
import {
  AtomSourceWithRelations,
  AtomWithSource,
  TestWithCanvas,
} from "../../public/main";
import { AtomInstance } from "./Atom/AtomInstance";
import { Atom, AtomSource } from "@prisma/client";

const { ATOM, ATOM_SOURCE } = require("../utils/constants");

interface Props {
  projectID: number;
  testID: number;
}

function Canvas({ projectID, testID }: Props) {
  const [canvasItems, setCanvas] = useState<TestWithCanvas>();
  const [atomMenu, setAtomMenu] = useState(false);
  const [coords, setCoords] = useState<{
    clickX: number | null;
    clickY: number | null;
  }>({ clickX: null, clickY: null });
  const [atoms, setAtoms] = useState<AtomWithSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quickInsertData, setQuickInsertData] = useState([]);

  useEffect(() => {
    window.electronAPI.listenForCanvasChange((_event: any, value: any) => {
      console.log("got canvas update");
      window.electronAPI.readTest(testID).then((data: TestWithCanvas) => {
        setCanvas(data);
      });
    });
  }, []);

  useEffect(() => {
    const loadCanvas = async () => {
      window.electronAPI.readTest(testID).then((data: TestWithCanvas) => {
        setCanvas(data);
      });
    };
    loadCanvas().then(() => setLoading(false));
  }, []);

  // useDidUpdate(() => {
  //   setQuickInsertData(
  //     atoms.map( (atom) => ({
  //       label: value["label"],
  //       value: key,
  //     }))
  //   );
  // }, [atoms]);

  const ref = useClickOutside(() => setCoords({ clickX: null, clickY: null }));

  const validCoords = coords.clickX !== null && coords.clickY !== null;

  const addNewAtom = ({
    sourceAtomID,
    top,
    left,
  }: {
    sourceAtomID: number;
    top: number;
    left: number;
  }) => {
    window.electronAPI
      .testCanAddAtom({ testID, sourceAtomID })
      .then((resp: { success: boolean; error?: any }) => {
        if (resp.success) {
          window.electronAPI.testAddAtom({ testID, sourceAtomID, top, left });
        } else {
          if (resp.error) console.log(resp.error);

          showNotification({
            title: "Cannot add Atom",
            message: `Adding that atom would exceed it's multiplicity.`,
            color: "red",
            icon: <IconAlertTriangle />,
          });
        }
      });
  };

  const updateAtom = (atomID: number, left: number, top: number) => {
    window.electronAPI.updateAtom({ atomID, left, top });
  };

  function quickInsert(selectedAtom: Atom | null, coords: any) {
    //   window.electronAPI
    //     .getAtomInstance(projectKey, selectedAtom)
    //     .then((atom) => {
    //       console.log(coords);
    //       //let canvasRect = this.getBoundingClientRect();
    //       // TODO: Translate to coordinates in canvas.
    //       addNewAtom(
    //         coords.clickX,
    //         coords.clickY,
    //         projectKey,
    //         testKey,
    //         selectedAtom,
    //         atom.label
    //       );
    //     });
  }

  function isAtomInstance(item: Atom | AtomSource): item is Atom {
    return (item as Atom).srcID !== undefined;
  }

  const [, drop] = useDrop(
    () => ({
      accept: [ATOM, ATOM_SOURCE],
      drop(item: AtomDraggable, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta) {
          if (isAtomInstance(item.data)) {
            let left = Math.round(item.data.left + delta.x);
            let top = Math.round(item.data.top + delta.y);
            if (monitor.getItemType() === ATOM) {
              console.log("Existing atom dragged.");
              updateAtom(item.data.id, left, top);
            }
          } else {
            // TODO: Atom source is dragged on to canvas, handle missing id, top, and left.
            if (monitor.getItemType() === ATOM_SOURCE) {
              console.log("New atom dragged.");
              const clickCoords = monitor.getClientOffset();
              if (clickCoords) {
                console.log("Item ", item);
                addNewAtom({
                  sourceAtomID: item.data.id,
                  top: clickCoords.y,
                  left: clickCoords.x,
                });
              }
            }
          }
          return undefined;
        }
      },
    }),
    [updateAtom, addNewAtom]
  );

  if (canvasItems) {
    return (
      <div
        ref={drop}
        className={"canvas"}
        onContextMenu={(e) => {
          e.preventDefault();
          const clickCoords = { clickX: e.pageX, clickY: e.pageY };
          // console.log(clickCoords);
          // console.log(quickInsertData);
          setCoords(clickCoords);
        }}
      >
        <Affix
          sx={{ display: validCoords ? "initial" : "none" }}
          position={
            coords.clickX !== null && coords.clickY !== null
              ? { left: coords.clickX, top: coords.clickY }
              : undefined
          }
        >
          <Popover opened={validCoords} trapFocus width={400} shadow={"md"}>
            <div ref={ref}>
              <Popover.Target>
                <div />
              </Popover.Target>
              <Popover.Dropdown>
                <Title size={"xs"} color={"dimmed"}>
                  Quick Insert
                </Title>
                <Select
                  data={quickInsertData}
                  label="Atoms"
                  placeholder="Pick one"
                  searchable
                  data-auto-focus
                  nothingFound="No options"
                  onChange={(selected) => quickInsert(null, coords)}
                />
                {/*<Text size={"sm"} weight={500} mt={"sm"} mb={"xs"}>Data Types</Text>*/}
                {/*<Group>*/}
                {/*    <Tooltip label={"Integer"} position={"bottom"}>*/}
                {/*        <ActionIcon variant={"light"} > <IconNumbers/> </ActionIcon>*/}
                {/*    </Tooltip>*/}
                {/*    <Tooltip label={"String"} position={"bottom"}>*/}
                {/*        <ActionIcon variant={"light"} disabled> <IconAlphabetLatin/> </ActionIcon>*/}
                {/*    </Tooltip>*/}
                {/*</Group>*/}
              </Popover.Dropdown>
            </div>
          </Popover>
        </Affix>
        {canvasItems.atoms.map((atom: AtomWithSource) => (
          <AtomInstance
            key={atom.id}
            contentsBeingDragged={false}
            atom={atom}
          />
        ))}
        {canvasItems.connections.map((connection) => (
          <Xarrow
            start={JSON.stringify(connection.fromID)}
            end={JSON.stringify(connection.toID)}
          />
        ))}
      </div>
    );
  } else {
    // Loading items
    return <div ref={drop} className={"canvas"}></div>;
  }
}

export default Canvas;
