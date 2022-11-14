import {useEffect, useRef, useState} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ATOM } from '../../utils/constants'
import {ActionIcon, Group, HoverCard, Paper, Text, Button, TextInput, MantineTheme, useMantineTheme} from "@mantine/core";
import {AtomOutPort} from "./AtomOutPort";
import {AtomInPort} from "./AtomInPort";
import {IconTrash} from "@tabler/icons";
import {AtomV2} from "./AtomV2";
const { v4: uuidv4 } = require('uuid');

// function getStyles(left, top, isDragging, shape) {
//     return {
//         position: 'absolute',
//         transform,
//         WebkitTransform: transform,
//         // IE fallback: hide the real node using CSS when dragging
//         // because IE will ignore our custom "empty image" drag preview.
//         opacity: isDragging ? 0 : 1,
//         height: isDragging ? 0 : '',
//     }
// }

export function AtomContents({ id, left, top, sourceAtomKey, projectKey, testKey, label}) {
    const outPort = useRef();
    const inPort = useRef();

    const [connectorActive, setConnectorActive] = useState(false);
    const [position, setPosition] = useState({});
    const [atomColor, setColor] = useState(initializeColor);
    const [nickname, setNickname] = useState(initializeNickname);
    const [atomShape, setAtomShape] = useState(initializeShape);
    const [atomLabel, setAtomLabel] = useState('');
    const [acceptTypes, setAcceptTypes] = useState([]);
    const [atomData, setAtomData] = useState({});
    const renderType = ATOM;
    const theme = useMantineTheme();

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: ATOM,
            item: {id, left, top, sourceAtomKey, projectKey, label, nickname, renderType},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id, left, top, atomLabel, atomColor, nickname],
    )

    useEffect( () => {
        window.electronAPI.listenForColorChange((_event, value) => {
            window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
                setColor(color);
            })
        })
    }, []);

    useEffect( () => {
        window.electronAPI.listenForShapeChange((_event, value) => {
            window.electronAPI.getAtomShape(projectKey, sourceAtomKey).then(shape => {
                setAtomShape(shape);
            })
        })
    }, []);

    useEffect( () => {
        window.electronAPI.getAcceptTypes(projectKey, sourceAtomKey).then(types => {
            setAcceptTypes(types);
        })
    }, []);

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, []);

    function getAtomStyles(theme, shape, left, top) {
        const transform = `translate3d(${left}px, ${top}px, 0)`

        return {
            position: 'relative',

            // IE fallback: hide the real node using CSS when dragging
            // because IE will ignore our custom "empty image" drag preview.
            opacity: isDragging ? 0 : 1,
            backgroundColor: theme.colors.dark[5],
            width: 100,
        }

        // if (shape ==="rectangle") {
        //     return {
        //         backgroundColor: theme.colors.dark[5],
        //         border: `solid 6px ${atomColor}`,
        //         width: 200,
        //         minHeight: 100,}
        // } else if (shape === "triangle") {
        //     return {
        //         backgroundColor: theme.colors.dark[5],
        //         borderLeft: "100px solid transparent",
        //         borderRight: "100px solid transparent",
        //         borderBottom: `200px solid`,
        //     }
        // } else if (shape === "circle") {
        //     return {
        //         backgroundColor: theme.colors.dark[5],
        //         border: `solid 6px ${atomColor}`,
        //         width: 100,
        //         height: 100,
        //         borderRadius: 100,
        //     }
        // }
    }

    function initializeNickname() {
        window.electronAPI.getAtomInstance(projectKey, testKey, id).then(atom => {
            setNickname(atom.nickname)
        })
    }

    function initializeColor() {
        window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
            setColor(color)
        })
    }

    function initializeShape() {
        window.electronAPI.getAtomShape(projectKey, sourceAtomKey).then(shape => {
            setAtomShape(shape)
        })
    }

    function deleteAtom(id) {
        window.electronAPI.deleteAtom(projectKey, testKey, id)
    }

    function deleteConnections(id) {
        window.electronAPI.deleteConnections(projectKey, testKey, id)
    }

    function setAtomNickname(value) {
        setNickname(value);
    }

    return (
            <Paper
                ref={drag}
                p="md"
                radius={"md"}
                role="DraggableBox"
                style={getAtomStyles(theme, atomShape, left, top)}
            >
                <Text size={"xl"} color={atomColor} weight={800}> {nickname} </Text>
            </Paper>
    )
}

