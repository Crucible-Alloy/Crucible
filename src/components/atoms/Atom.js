import {useEffect, useRef, useState} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ATOM } from '../../utils/constants'
import {ActionIcon, Group, HoverCard, Paper, Text, Button} from "@mantine/core";
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
    const [atomColor, setColor] = useState("");
    const [atomLabel, setAtomLabel] = useState('');
    const [acceptTypes, setAcceptTypes] = useState([]);

    useEffect(() => {
        window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
            setColor(color)
        })
    }, [atomColor]);

    useEffect( () => {
        window.electronAPI.listenForColorChange((_event, value) => {
            console.log("Canvas change")
            window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
                setColor(color);
            })
        })
    }, []);

    useEffect( () => {
        window.electronAPI.getAcceptTypes(projectKey, sourceAtomKey).then(types => {
            setAcceptTypes(types);
        })
    }, []);

    function deleteAtom(id) {
        window.electronAPI.deleteAtom(projectKey, testKey, id)
    }

    function deleteConnections(id) {
        window.electronAPI.deleteConnections(projectKey, testKey, id)
    }

    useEffect(() => {
        window.electronAPI.getAtomLabel(projectKey, sourceAtomKey).then(label => {
            setAtomLabel(label);
        })
    }, [projectKey, sourceAtomKey, atomLabel]);

    const renderType = ATOM;

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: ATOM,
            item: {id, left, top, sourceAtomKey, projectKey, label, renderType},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id, left, top, atomLabel, atomColor],
    )
    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [])

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
                        sx={(theme) => ({
                            backgroundColor: theme.colors.dark[5],
                            border: `solid 6px ${atomColor}`,
                            width: 200,
                        })}
                    >
                        <Group>
                            <AtomInPort
                                projectKey={projectKey}
                                testKey={testKey}
                                atomColor={atomColor}
                                atomId={id}
                                acceptTypes={acceptTypes}
                                sourceAtomKey={sourceAtomKey}
                                atomLabel={atomLabel}
                            />
                            <Text align={"center"} color={atomColor} size={"xl"} weight={"800"}> {atomLabel.split("/")[1]} </Text>
                            <AtomOutPort atomId={id} atomColor={atomColor} atomLabel={atomLabel} sourceAtomKey={sourceAtomKey}/>
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

