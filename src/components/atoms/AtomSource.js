import {memo, useEffect, useState} from 'react';
import { ActionIcon, ColorInput, ColorPicker, Group, Modal, Paper, Text } from "@mantine/core";
import {useDrag} from "react-dnd";
import { ATOM_SOURCE } from "../../utils/constants";
import {getEmptyImage} from "react-dnd-html5-backend";
import React from "react";
import {IconArrowMoveRight, IconCaretDown, IconCaretUp, IconEdit} from "@tabler/icons";

function getStyles(left, top, isDragging) {
    //const transform = `translate3d(${left}px, ${top}px, 0)`
    return {
        position: 'absolute',
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : '',
    }
}

export function AtomSource({ id, label, left, top, atom, sourceAtomKey, projectKey, color }) {

    const [modalOpened, setModalOpened] = useState(false);
    const [multiplicity, setMultiplicity] = useState("not Defined");
    const [dropDown, setDropdown] = useState(false)
    const [atomColor, setAtomColor] = useState(color);

    useEffect(() => {
        window.electronAPI.setAtomColor(projectKey, sourceAtomKey, atomColor)
    }, []);


    useEffect(() => {
        return () => {
            findAndSetMultiplicity()
        };
    }, []);

    function findAndSetMultiplicity() {
        //console.log(atom)
        const keys = ["isLone", "isOne", "isSome"]
        keys.forEach((key, i) => {

            if (atom[key] !== null) {
                setMultiplicity(key)
            }
        })
    }

    function handleColorChange(color) {
        setAtomColor(color)
        window.electronAPI.setAtomColor(projectKey, sourceAtomKey, color)
    }

    const [{isDragging}, drag, preview] = useDrag(() => ({
            type: ATOM_SOURCE,
            item: {id, left, top, label, sourceAtomKey, },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            })
        }),
        [id, left, top, label, sourceAtomKey],
    )
    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [preview])

    function editAtom() {
        setModalOpened(true)
    }

    if (dropDown) {
        return (
            <>
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={`Edit Atom - ${label}`}
                >
                    <ColorInput
                        label={"Atom Color"}
                        description={"The color of the atom as it appears on the canvas."}
                        format="hex"
                        value={atomColor}
                        swatchesPerRow={12}
                        onChange={(e) => handleColorChange(e)}
                        swatches={["#ffa94d", "#ffd43b", "#a9e34b", "#69db7c", "#38d9a9", "#3bc9db", "#4dabf7", "#748ffc", "#9775fa", "#da77f2", "#f783ac", "#ff8787"]}
                    />
                </Modal>

                <Paper
                    ref={drag}
                    //style={getStyles(left, top, isDragging)}
                    shadow="md"
                    size={"xl"}
                    p="md"
                    radius={"lg"}
                    role="DraggableBox"
                    sx={(theme) => ({
                        backgroundColor: theme.colors.dark[4],
                        border: `solid 6px ${atomColor}`,
                        width: 300,
                    })}
                >
                    <Group>
                        <Text color={atomColor} size={"xl"} weight={"800"}>{label.split('/')[1]}</Text>
                        <ActionIcon onClick={() => setDropdown(!dropDown)} style={{float: "right"}}>
                            {dropDown ? <IconCaretUp/> : <IconCaretDown/>}
                        </ActionIcon>

                    </Group>

                    <Group>
                        <IconArrowMoveRight color={"gray"}/>
                        <Text color={atomColor} size={"md"} weight={"600"}> {multiplicity} </Text>
                    </Group>
                    <Group position={"right"}>
                        <ActionIcon onClick={editAtom}>
                            <IconEdit/>
                        </ActionIcon>
                    </Group>
                </Paper>
            </>
        );
    } else {
        return (
            <>
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title="Edit Atom"
                >
                    <ColorPicker/>
                </Modal>

                <Paper
                    ref={drag}
                    //style={getStyles(left, top, isDragging)}
                    shadow="md"
                    size={"xl"}
                    p="md"
                    radius={"lg"}
                    role="DraggableBox"
                    sx={(theme) => ({
                        backgroundColor: theme.colors.dark[4],
                        border: `solid 6px ${atomColor}`,
                        width: 300,
                    })}
                >
                    <Group>
                        <Text color={atomColor} size={"xl"} weight={"800"}>{label}</Text>
                        <ActionIcon onClick={() => setDropdown(!dropDown)} style={{float: "right"}}>
                            {dropDown ? <IconCaretUp/> : <IconCaretDown/>}
                        </ActionIcon>

                    </Group>
                </Paper>
            </>
        )
    }

}
