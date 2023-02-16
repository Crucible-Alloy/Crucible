import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import Xarrow from "react-xarrows";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle } from "@tabler/icons";
import { useClickOutside } from "@mantine/hooks";
import { Affix, Popover, Select, Title } from "@mantine/core";
import { AtomWithSource, TestWithCanvas } from "../../public/main";
import { AtomInstance } from "./Atom/AtomInstance";
import { AtomSourceWithRelations } from "../../public/ipc/atoms";
import { Atom } from "@prisma/client";

const { ATOM, ATOM_SOURCE } = require("../../utils/constants");

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
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quickInsertData, setQuickInsertData] = useState([]);

  useEffect(() => {
    window.electronAPI.listenForCanvasChange((_event: any, value: any) => {
      console.log("got canvas update");
      window.electronAPI.readTest({ testID }).then((data: TestWithCanvas) => {
        setCanvas(data);
      });
    });
  }, []);

  useEffect(() => {
    const loadCanvas = async () => {
      window.electronAPI.readTest({ testID }).then((data: TestWithCanvas) => {
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

  const addNewAtom = (
    left: number,
    top: number,
    projectID: number,
    testID: number,
    sourceAtomID: number,
    atomLabel: string
  ) => {
    window.electronAPI
      .testCanAddAtom({ testID, sourceAtomID })
      .then((resp: { success: boolean; error?: any }) => {
        if (resp.success) {
          window.electronAPI.testAddAtom({ testID, sourceAtomID });
        } else {
          showNotification({
            title: "Cannot add Atom",
            message: `Adding that atom would exceed it's multiplicity.`,
            color: "red",
            icon: <IconAlertTriangle />,
          });
        }
      });
  };

  const updateAtom = (
    id: number,
    left: number,
    top: number,
    sourceAtomID: number,
    atomLabel: string,
    nickname: string
  ) => {
    window.electronAPI.createAtom(projectID, testID, id, {
      top: top,
      left: left,
      sourceAtomKey: sourceAtomID,
      atomLabel: atomLabel,
      nickname: nickname,
    });
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

  const [, drop] = useDrop(
    () => ({
      accept: [ATOM, ATOM_SOURCE],
      drop(item: Atom, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta) {
          let left = Math.round(item.left + delta.x);
          let top = Math.round(item.top + delta.y);
          console.log(top);
          if (monitor.getItemType() === ATOM) {
            console.log("Existing atom dragged.");
            console.log(item.id);
            updateAtom(
              item.id,
              left,
              top,
              item.srcID,
              "atom label",
              "atom nickname"
            );
          }

          if (monitor.getItemType() === ATOM_SOURCE) {
            console.log("New atom dragged.");
            console.log(testID);
            addNewAtom(left, top, projectID, testID, item.srcID, "atomLabel");
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
          console.log(clickCoords);
          console.log(quickInsertData);
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
            contentsBeingDragged={false}
            atom={atom}
            projectID={projectID}
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
