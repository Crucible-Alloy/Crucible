import update from 'immutability-helper';
import {Atom} from "./atoms/Atom";
import {useCallback, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {ATOM, ATOM_SOURCE} from "../utils/constants";
import {snapToGrid as doSnapToGrid} from "./examples/SnapToGrid";
import {v4 as uuidv4} from "uuid";
import Xarrow from "react-xarrows";
import {showNotification} from "@mantine/notifications";
import {IconAlertTriangle, IconX} from "@tabler/icons";
import {useEventListener} from "@mantine/hooks";

export const Canvas = ({ snapToGrid, tab, projectKey, testKey }) => {

    const [canvasItems, setCanvas] = useState({"atoms": {}, "connections": {}});
    const [showToast, setShowToast] = useState(false);

    // const handler = window.electronAPI.listenForCanvasChange(
    //     (_event, value) => {
    //         console.log("found canvas change")
    //         setCanvas(value)
    //     });
    //
    // useEventListener('DOMContentLoaded', handler);

    useEffect( () => {
        window.electronAPI.listenForCanvasChange((_event, value) => {
            console.log("got canvas update")
            window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
                setCanvas(data)
            })
        })
    }, []);

    // Load canvasState from ipcMain
    useEffect(() => {
        window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
            setCanvas(data)
        })
    }, []);

    useEffect(() => {
        saveCanvasState(canvasItems, projectKey, testKey)
    }, [canvasItems])

    const addNewAtom = (left, top, projectKey, testKey, sourceAtomKey) => {
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
                setCanvas(
                    update(canvasItems, { "atoms": {
                            $merge: {[uuidv4()]: {top: top, left: left, sourceAtomKey: sourceAtomKey}}
                        }
                    })
                )
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

    const saveCanvasState = useCallback(
        () => {
            window.electronAPI.saveCanvasState(canvasItems, projectKey, testKey)
        },
        [canvasItems],
    );

    // const refreshCanvas = useCallback(
    //     () => {
    //         window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
    //             setCanvas(data)
    //         });
    //     }, [canvasItems],
    // )

    const updateAtom = useCallback(
        (id, left, top) => {
            setCanvas(
                update(canvasItems, { "atoms": {
                        [id]: {
                            $merge: {left, top}
                        },
                    }
                })
            )
        },
        [canvasItems],
    );

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
                updateAtom(item.id, left, top)
            }

            if (monitor.getItemType() === ATOM_SOURCE) {
                console.log("New atom dragged.")
                addNewAtom(left, top, projectKey, testKey, item.sourceAtomKey)
            }

            return undefined
        },}),
        [updateAtom, addNewAtom],
    )

    const checkState = () => {
        console.log("STATE: ")
        Object.entries(canvasItems).map(([key, value]) => (
          console.log(key, value["sourceAtomKey"])
        ))
    }

    return (
        <div ref={drop} className={"canvas"}>
            {Object.entries(canvasItems["atoms"]).map(([key, value]) => (
                <Atom key={key} id={key} projectKey={projectKey} testKey={testKey} sourceAtomKey={value["sourceAtomKey"]} {...canvasItems["atoms"][key]} />
            ))}
            {Object.entries(canvasItems["connections"]).map(([key, value]) => (
                <Xarrow start={value["from"]} end={value["to"]} />
                //<Connector connectionFrom={value["from"]} connectionTo={value["to"]} />
            ))}
        </div>
    )
}

export default Canvas;