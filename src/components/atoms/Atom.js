import {useEffect, useRef, useState} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ATOM } from '../../utils/constants'
import {ActionIcon, Group, HoverCard, Paper, Text, Button, TextInput} from "@mantine/core";
import {AtomOutPort} from "./AtomOutPort";
import {AtomInPort} from "./AtomInPort";
import {IconTrash} from "@tabler/icons";
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

export function Atom({ id, left, top, sourceAtomKey, projectKey, testKey, label}) {
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
        <HoverCard>
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
                        sx={(theme) => {
                            if (atomShape ==="rectangle") {
                                return {
                                    backgroundColor: theme.colors.dark[5],
                                    border: `solid 6px ${atomColor}`,
                                    width: 200 }
                            } else if (atomShape === "triangle") {
                                return {
                                    backgroundColor: theme.colors.dark[5],
                                    width: 0,
                                    height: 0,
                                    borderLeft: "100px solid transparent",
                                    borderRight: "100px solid transparent",
                                    borderBottom: `200px solid`,
                                }
                            } else if (atomShape === "circle") {
                                return {
                                    backgroundColor: theme.colors.dark[5],
                                    border: `solid 6px ${atomColor}`,
                                    width: 100,
                                    height: 100,
                                    borderRadius: 100,
                                    }
                            }
                        }}
                    >
                        <Group>
                            <AtomInPort
                                atomId={id}
                                projectKey={projectKey}
                                testKey={testKey}
                                atomColor={atomColor}
                                acceptTypes={acceptTypes}
                                sourceAtomKey={sourceAtomKey}
                                atomLabel={atomLabel}
                                nickname={nickname}
                            />
                            <Text size={"xl"} color={atomColor} weight={800}> {nickname} </Text>
                            <AtomOutPort atomId={id} atomColor={atomColor} atomLabel={atomLabel} sourceAtomKey={sourceAtomKey} nickname={nickname}/>
                        </Group>
                        <Group position={"right"}>
                            <HoverCard.Target>
                                <ActionIcon size={16}><IconTrash/></ActionIcon>
                            </HoverCard.Target>
                        </Group>

                    </Paper>
                </div>

            <HoverCard.Dropdown>
                <Group m={"xs"}>
                    <Button color="red" onClick={() => deleteAtom(id)}>Delete Atom</Button>

                </Group>
                <Group m={"xs"}>
                    <Button color="red" onClick={() => deleteConnections(id)}>Delete Connections</Button>
                </Group>

            </HoverCard.Dropdown>
        </HoverCard>
    )
}

