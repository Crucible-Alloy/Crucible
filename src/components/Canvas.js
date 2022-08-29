import update from 'immutability-helper'
import {Atom} from "./atoms/Atom";
import {useCallback, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {ATOM, ATOM_SOURCE} from "../utils/constants";
import {snapToGrid as doSnapToGrid} from "./examples/SnapToGrid";
import {v4 as uuidv4} from "uuid";
import Xarrow from "react-xarrows";

export const Canvas = ({ snapToGrid, tab, projectKey, testKey }) => {

    const [canvasItems, setCanvas] = useState({"atoms": {}, "connections": {}});

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
        setCanvas(
            update(canvasItems, { "atoms": {
                    $merge: {[uuidv4()]: {top: top, left: left, sourceAtomKey: sourceAtomKey}}
                }
            })
        )
    }

    const saveCanvasState = useCallback(
        () => {
            window.electronAPI.saveCanvasState(canvasItems, projectKey, testKey)
        },
        [canvasItems],
    );

    const refreshCanvas = useCallback(
        () => {
            window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
                setCanvas(data)
            });
        }, [canvasItems],
    )

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
            console.log(canvasItems);

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

    //checkState()

    return (
        <div ref={drop} className={"canvas"}>
            {Object.entries(canvasItems["atoms"]).map(([key, value]) => (
                <Atom key={key} id={key} refreshCanvas={refreshCanvas} projectKey={projectKey} testKey={testKey} sourceAtomKey={value["sourceAtomKey"]} {...canvasItems["atoms"][key]} />
            ))}
            {Object.entries(canvasItems["connections"]).map(([key, value]) => (
                <Xarrow start={value["from"]} end={value["to"]} />
            ))}
        </div>
    )
}

export default Canvas;