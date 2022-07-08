import update from 'immutability-helper'
import {Atom} from "./Atom";
import {useCallback, useState} from "react";
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

export const Canvas = ({ snapToGrid }) => {

    const [canvasItems, setCanvas] = useState({
       // [uuidv4()]: { top: 20, left: 80, title: 'Drag me around', dragType: ItemTypes.ATOM },
    });

    const addNewItem = useCallback(
        (item, left, top) => {
            setCanvas(
                update(canvasItems, {
                    $merge: {[uuidv4()]: {top: top, left: left, title: item.title, color: item.color }}
                }),
            )
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
                }),
            )
        },
        [canvasItems],
    );


    // TODO: Check if Atom is existing on canvas or if new atom from source.  If from source, add new id to canvasItems. If existing item, update coords in state.
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
                updateItem(item.id, left, top)
            }

            if (monitor.getItemType() === ItemTypes.ATOM_SOURCE) {
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

export default Canvas;