import {useEffect, useRef, useState} from 'react'
import {useDrag, useDrop} from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {ATOM, ATOM_SOURCE, CONNECTION} from '../../utils/constants'
import {Group, Paper, Text} from "@mantine/core";
import {CodePlus} from "tabler-icons-react";
import {snapToGrid as doSnapToGrid} from "../SnapToGrid";
const { v4: uuidv4 } = require('uuid');

function getStyles(left, top, isDragging) {
    const transform = `translate3d(${left}px, ${top}px, 0)`
    return {
        position: 'absolute',
        transform,
        WebkitTransform: transform,
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : '',
    }
}
export function AtomInPort({ projectKey, testKey, atomId, atomColor,}) {
    const inPort = useRef();

    const [position, setPosition] = useState({});

    function createConnection(fromAtom, toAtom) {
        window.electronAPI.makeConnection(projectKey, testKey, fromAtom, toAtom)
    }

    const [, drop] = useDrop(
        () => ({
            accept: [CONNECTION],
            drop(item, monitor) {
                const delta = monitor.getDifferenceFromInitialOffset()
                let left = Math.round(item.left + delta.x)
                let top = Math.round(item.top + delta.y)
                console.log(top);

                if (monitor.getItemType() === CONNECTION) {
                    console.log("Existing atom dragged.")
                    createConnection(item.atomId, atomId)
                }

                return undefined
            },}),
        [createConnection],
    )

    return (
        <div
            ref={drop}
            className={"inPort"}
            role="ConnectionArrow"
        >
                    <Paper
                        ref={inPort}
                        className={"connectPoint"}
                        sx={(theme) => ({
                            position: "relative",
                            top: 0,
                            left: 0,
                            height: "24px",
                            width: "24px",
                            borderRadius: "100%",
                            border: `solid 6px ${atomColor}`,
                            backgroundColor: theme.colors.dark[5],

                            '&:hover': {
                                backgroundColor: `${atomColor}`
                            }

                        })} />
        </div>
    )
}