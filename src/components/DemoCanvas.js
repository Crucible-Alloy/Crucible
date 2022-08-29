import update from 'immutability-helper'
import {Atom} from "./atoms/Atom";
import {useCallback, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {ATOM, ATOM_SOURCE} from "../utils/constants";
import {snapToGrid as doSnapToGrid} from "./examples/SnapToGrid";
import {v4 as uuidv4} from "uuid";

const styles = {
    width: 300,
    height: 300,
    border: '1px solid black',
    position: 'relative',
}

export const DemoCanvas = ({ snapToGrid }) => {

    const [canvasItems, setCanvas] = useState({});


    const addNewItem = useCallback(
        (item, left, top) => {
            setCanvas(
                update(canvasItems, {
                    $merge: {[uuidv4()]: {top: top, left: left, title: item.label, color: item.atomColor, connections: {} }}
                }),
            )
        },
        [canvasItems],
    )

    const updateItem = useCallback(
        (id, left, top ) => {
            setCanvas(
                update(canvasItems, {
                    [id]: {
                        $merge: {left, top}
                    },
                }),
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
                updateItem(item.id, left, top)
            }

            if (monitor.getItemType() === ATOM_SOURCE) {
                console.log("New atom dragged.")
                addNewItem(item, left, top)
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

export default DemoCanvas;