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

    const [canvasItems, setCanvas] = useState(initializeCanvas);

    useEffect( () => {
        window.electronAPI.listenForCanvasChange((_event, value) => {
            console.log("got canvas update")
            window.electronAPI.loadCanvasState(projectKey, testKey).then(data => {
                setCanvas(data)
            })
        })
    }, []);

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
                window.electronAPI.createAtom(projectKey, testKey, uuidv4(), {top: top, left: left, sourceAtomKey: sourceAtomKey, atomLabel: `${atomLabel.split('/')[1]}`})
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

    const updateAtom = (id, left, top, sourceAtomKey, atomLabel) => {
        window.electronAPI.createAtom(projectKey, testKey, id, {top: top, left: left, sourceAtomKey: sourceAtomKey, atomLabel: atomLabel})
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
                console.log(item.label)
                updateAtom(item.id, left, top, item.sourceAtomKey, item.label)
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
            <div ref={drop} className={"canvas"}>
                {Object.entries(canvasItems["atoms"]).map(([key, value]) => (
                    <Atom key={key} id={key} projectKey={projectKey} testKey={testKey} sourceAtomKey={value["sourceAtomKey"]} label={value["atomLabel"]} {...canvasItems["atoms"][key]} />
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