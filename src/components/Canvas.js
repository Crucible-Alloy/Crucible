import update from 'immutability-helper'
import {Atom} from "./atoms/Atom";
import {useCallback, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {ATOM, ATOM_SOURCE} from "../utils/constants";
import {snapToGrid as doSnapToGrid} from "./SnapToGrid";
import {v4 as uuidv4} from "uuid";

const styles = {
    width: 300,
    height: 300,
    border: '1px solid black',
    position: 'relative',
}

export const Canvas = ({ snapToGrid, tab, projectKey, testKey }) => {

    const [canvasItems, setCanvas] = useState({});

    // Load canvasState from ipcMain
    useEffect(() => {
        window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
            setCanvas(data)
        })
    }, []);

    useEffect(() => {
        saveCanvasState(canvasItems, projectKey, testKey)
    }, [canvasItems])

    const addNewItem = (left, top, projectKey, testKey, sourceAtomKey) => {
        setCanvas(
            update(canvasItems, {
                $merge: {[uuidv4()]: {top: top, left: left, sourceAtomKey: sourceAtomKey, connections: {} }}
            })
        )
    }

    const saveCanvasState = useCallback(
        () => {
            window.electronAPI.saveCanvasState(canvasItems, projectKey, testKey)
        },
        [canvasItems],
    );


    const updateItem = useCallback(
        (id, left, top) => {
            setCanvas(
                update(canvasItems, {
                    [id]: {
                        $merge: {left, top}
                    },
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
            console.log(monitor.getItemType())
            console.log(item)
            console.log(top);

            if (snapToGrid) {
                ;[left, top] = doSnapToGrid(left, top)
            }

            if (monitor.getItemType() === ATOM) {
                console.log("Existing atom dragged.")
                updateItem(item.id, left, top, projectKey, testKey)
            }

            if (monitor.getItemType() === ATOM_SOURCE) {
                console.log("New atom dragged.")
                addNewItem(left, top, projectKey, testKey, item.sourceAtomKey)
            }
            console.log(canvasItems);

            return undefined
        },}),
        [updateItem, addNewItem],
    )

    const checkState = () => {
        console.log("STATE: ")
        Object.entries(canvasItems).map(([key, value]) => (
          console.log(key, value["sourceAtomKey"])
        ))
    }

    checkState()

    return (
        <div ref={drop} className={"canvas"}>
            {Object.entries(canvasItems).map(([key, value]) => (
                <Atom key={key} id={key} projectKey={projectKey} sourceAtomKey={value["sourceAtomKey"]} {...canvasItems[key]} />
            ))}
        </div>
    )
}

export default Canvas;