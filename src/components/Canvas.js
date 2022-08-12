import update from 'immutability-helper'
import {Atom} from "./Atom";
import {useCallback, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {ItemTypes} from "./ItemTypes";
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
    }, [projectKey, testKey]);

    const addNewItem = useCallback(
        (item, left, top, projectKey, testKey) => {
            setCanvas(
                update(canvasItems, {
                    $merge: {[uuidv4()]: {top: top, left: left, title: item.label, color: item.color }}
                }),
            )
            window.electronAPI.saveCanvasState(canvasItems, projectKey, testKey)
        },
        [canvasItems],
    )

    const updateItem = useCallback(
        (id, left, top, projectKey, testKey) => {
            setCanvas(
                update(canvasItems, {
                    [id]: {
                        $merge: {left, top}
                    },
                }),
            )
            window.electronAPI.saveCanvasState(canvasItems, projectKey, testKey)
        },
        [canvasItems],
    );

    const [, drop] = useDrop(
        () => ({
        accept: [ItemTypes.ATOM, ItemTypes.ATOM_SOURCE],
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

            if (monitor.getItemType() === ItemTypes.ATOM) {
                console.log("Existing atom dragged.")
                updateItem(item.id, left, top, projectKey, testKey)
            }

            if (monitor.getItemType() === ItemTypes.ATOM_SOURCE) {
                console.log("New atom dragged.")
                addNewItem(item, left, top, projectKey, testKey)
            }
            console.log(canvasItems);

            return undefined
        },}),
        [updateItem, addNewItem],
    )

    return (
        <div ref={drop} className={"canvas"}>
            {Object.keys(canvasItems).map((key) => (
                <Atom key={key} id={key} {...canvasItems[key]} />
            ))}
        </div>
    )
}

export default Canvas;