import {useEffect, useRef, useState} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ATOM } from '../../utils/constants'
import {Group, Paper, Text} from "@mantine/core";
import {CodePlus} from "tabler-icons-react";
import {AtomOutPort} from "./AtomOutPort";
import {AtomInPort} from "./AtomInPort";
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
export function Atom({ id, left, top, sourceAtomKey, projectKey, testKey}) {
    const outPort = useRef();
    const inPort = useRef();

    const [connectorActive, setConnectorActive] = useState(false);
    const [position, setPosition] = useState({});
    const [atomColor, setColor] = useState("");
    const [atomLabel, setAtomLabel] = useState('');

    function checkState() {
        console.log("STATE OF ATOM: ", atomColor, atomLabel, sourceAtomKey)
    }

    useEffect(() => {
        console.log("SOURCE ATOM KEY", sourceAtomKey)
        window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
            setColor(color)
            console.log(color)
        })
    }, [atomColor]);

    useEffect(() => {
        window.electronAPI.getAtomLabel(projectKey, sourceAtomKey).then(label => {
            setAtomLabel(label);
        })
    }, [projectKey, sourceAtomKey, atomLabel]);

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: ATOM,
            item: {id, left, top, sourceAtomKey, projectKey},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id, left, top, atomLabel, atomColor],
    )
    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [])

    checkState()

    return (
        <div
            ref={drag}
            style={getStyles(left, top, isDragging)}
            role="DraggableBox"
            id={id}
        >
            <Paper
                ref={drag}
                //style={getStyles(left, top, isDragging)}
                shadow="md"
                p="md"
                radius={"md"}
                role="DraggableBox"
                sx={(theme) => ({
                    backgroundColor: theme.colors.dark[5],
                    border: `solid 6px ${atomColor}`,
                    width: 200,
                })}
            >
                <Group>
                    <AtomInPort projectKey={projectKey} testKey={testKey} atomColor={atomColor} atomId={id} />
                    <Text align={"center"} color={atomColor} size={"xl"} weight={"800"}> {atomLabel} </Text>
                    <AtomOutPort atomId={id} atomColor={atomColor} />
                </Group>

            </Paper>
        </div>
    )
}

