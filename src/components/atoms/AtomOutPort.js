import {useEffect, useRef, useState} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {ATOM, CONNECTION} from '../../utils/constants'
import {Group, Paper, Text} from "@mantine/core";
import {CodePlus} from "tabler-icons-react";
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
export function AtomOutPort({ atomId, atomColor,}) {
    const outPort = useRef();

    const [position, setPosition] = useState({});

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: CONNECTION,
            item: {atomId, outPort},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [atomId],
    )
    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [])

    return (
        <div
            ref={drag}
            style={getStyles(isDragging)}
            role="ConnectionArrow"
        >
                    <Paper
                        ref={outPort}
                        className={"connectPoint"}
                        sx={(theme) => ({
                            position: "absolute",
                            top: -10,
                            left: 160,
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