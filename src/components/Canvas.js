import update from 'immutability-helper';
import {Atom} from "./atoms/Atom";
import React, {useCallback, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {ATOM, ATOM_SOURCE} from "../utils/constants";
import {snapToGrid as doSnapToGrid} from "./examples/SnapToGrid";
import {v4 as uuidv4} from "uuid";
import Xarrow from "react-xarrows";
import {showNotification} from "@mantine/notifications";
import {IconAlertTriangle, IconAlphabetLatin, IconNumbers, IconRectangle, IconX} from "@tabler/icons";
import {useClickOutside, useDidUpdate, useEventListener} from "@mantine/hooks";
import { Affix, Popover, Select, Title } from "@mantine/core";
import {AtomV2} from "./atoms/AtomV2";

export const Canvas = ({ snapToGrid, tab, projectKey, testKey }) => {

    const [canvasItems, setCanvas] = useState(initializeCanvas);
    const [atomMenu, setAtomMenu] = useState(false);
    const [coords, setCoords] = useState({clickX: null, clickY: null});
    const [atoms, setAtoms] = useState() ;
    const [quickInsertData, setQuickInsertData] = useState([]);
    // useDidUpdate(() => {
    //     window.electronAPI.listenForCanvasChange((_event, value) => {
    //         console.log("got canvas update")
    //         window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
    //             setCanvas(data)
    //         })
    //     })
    // })

    useEffect(() => {
        return () => {
            window.electronAPI.getAtoms(projectKey).then(atoms => {
                setAtoms(atoms);
            }, []);
        }
    }, []);

    useEffect( () => {
        window.electronAPI.listenForCanvasChange((_event, value) => {
            console.log("got canvas update")
            window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
                setCanvas(data)
            })
        })
    }, []);

    useDidUpdate(() => {
        setQuickInsertData(Object.entries(atoms).map(([key, value]) => (
            {label: value['label'], value: key}
        )));
        console.log(quickInsertData)
        // setQuickInsertData([...quickInsertData, {label: 'Integer', value: 'int'}, {label: 'String', value: 'string'}])
    }, [atoms]);


    const ref = useClickOutside(() =>
        setCoords({ clickX: null, clickY: null })
    );

    const validCoords = coords.clickX !== null && coords.clickY !== null;

    function initializeCanvas() {
        window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
            setCanvas(data)
        })
    }

    const addNewAtom = (left, top, projectKey, testKey, sourceAtomKey, atomLabel) => {
        let eligibleToAdd = true;
        window.electronAPI.getAtomMultiplicity(projectKey, sourceAtomKey).then(multiplicity => {
            console.log(multiplicity)
            if (multiplicity === "isLone" || multiplicity === "isOne") {
                console.log("Multiplicity is one")
                Object.entries(canvasItems["atoms"]).map(([key, value]) => {
                    console.log(value)
                    if (value["sourceAtomKey"] === sourceAtomKey) {
                        console.log("Found one already there")
                        eligibleToAdd = false;
                        // Already one exists so don't add.  Create toast message.
                    }
                })
            }
            if (eligibleToAdd) {
                let atomCount = Object.entries(canvasItems["atoms"]).filter(([key, value]) =>
                    value["sourceAtomKey"] === sourceAtomKey).length;
                console.log(atomCount)
                window.electronAPI.createAtom(projectKey, testKey, uuidv4(), {
                    top: top,
                    left: left,
                    sourceAtomKey: sourceAtomKey,
                    atomLabel: atomLabel
                })
            } else {
                showNotification({
                    title: "Cannot add Atom",
                    message: `Adding that atom would exceed it's multiplicity.`,
                    color: "red",
                    icon: <IconAlertTriangle/>
                });
            }
        })
    }

    const updateAtom = (id, left, top, sourceAtomKey, atomLabel, nickname) => {
        window.electronAPI.createAtom(projectKey, testKey, id, {top: top, left: left, sourceAtomKey: sourceAtomKey, atomLabel: atomLabel, nickname: nickname})
    }

    function quickInsert(selectedAtom, coords) {
        window.electronAPI.getAtomInstance(projectKey, selectedAtom).then( atom => {
            console.log(coords)
            //let canvasRect = this.getBoundingClientRect();
            // TODO: Translate to coordinates in canvas.
            addNewAtom(coords.clickX, coords.clickY, projectKey, testKey, selectedAtom, atom.label)
        })
    }

    const [, drop] = useDrop(
        () => ({
        accept: [ATOM, ATOM_SOURCE],
        drop(item, monitor) {
            const delta = monitor.getDifferenceFromInitialOffset()
            let left = Math.round(item.left + delta.x)
            let top = Math.round(item.top + delta.y)
            console.log(top);

            if (snapToGrid) {
                ;[left, top] = doSnapToGrid(left, top)
            }

            if (monitor.getItemType() === ATOM) {
                console.log("Existing atom dragged.")
                console.log(item.id)
                updateAtom(item.id, left, top, item.sourceAtomKey, item.metaData.label, item.atomData.nickname)
            }

            if (monitor.getItemType() === ATOM_SOURCE) {
                console.log("New atom dragged.")
                console.log(testKey)
                addNewAtom(left, top, projectKey, testKey, item.sourceAtomKey, item.label)
            }

            return undefined
        },}),
        [updateAtom, addNewAtom],
    )

    if (canvasItems) {
        return (
            <div ref={drop}
                 className={"canvas"}
                 onContextMenu={(e) => {
                     e.preventDefault();
                     const clickCoords = {clickX: e.pageX, clickY: e.pageY};
                     console.log(clickCoords)
                     console.log(quickInsertData)
                     setCoords(clickCoords);
                 }}>
                <Affix
                    sx={{ display: validCoords ? "initial" : "none" }}
                    position={
                        coords.clickX !== null && coords.clickY !== null
                            ? { left: coords.clickX, top: coords.clickY }
                        : undefined
                    }>
                    <Popover opened={validCoords} trapFocus width={400} shadow={"md"}>
                        <div ref={ref}>
                            <Popover.Target>
                                <div />
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Title size={"xs"} color={"dimmed"}>Quick Insert</Title>
                                <Select
                                    data={quickInsertData}
                                    label="Atoms"
                                    placeholder="Pick one"
                                    searchable
                                    data-auto-focus
                                    nothingFound="No options"
                                    onChange={(selected) => quickInsert(selected, coords)}
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
                {Object.entries(canvasItems["atoms"]).map(([key, value]) => (
                    <AtomV2 contentsBeingDragged={false} id={key} projectKey={projectKey} testKey={testKey} sourceAtomKey={value["sourceAtomKey"]} label={value["atomLabel"]} atomColor={value["color"]} {...canvasItems["atoms"][key]} />
                ))}
                {Object.entries(canvasItems["connections"]).map(([key, value]) => (
                    <Xarrow start={value["from"]} end={value["to"]} />
                    //<Connector connectionFrom={value["from"]} connectionTo={value["to"]} />
                ))}
            </div>
        )
    } else {
        // Loading items
        return (
            <div ref={drop} className={"canvas"}>
            </div>
        )

    }
}

export default Canvas;