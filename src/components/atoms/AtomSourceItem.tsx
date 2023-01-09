import { useEffect, useState } from 'react';
import { ActionIcon, ColorInput, ColorPicker, Group, Input, Modal, Box, Center, Paper,
         SegmentedControl, Text, Title } from "@mantine/core";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import React from "react";
import { IconArrowMoveRight, IconCaretDown, IconCaretUp, IconChartCircles, IconCircle, IconEdit,
         IconRectangle, IconSubtask, IconTriangle } from "@tabler/icons";
import {getColorArray} from "../../utils/helpers";
import { AtomSource } from "@prisma/client"

const { ATOM_SOURCE } = require("../../utils/constants.js");

function getStyles(left:number, top:number, isDragging:boolean) {
    //const transform = `translate3d(${left}px, ${top}px, 0)`
    return {
        position: 'absolute',
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : '',
    }
}

interface Props {
    id: number,
    label: string,
    top: number,
    left: number,
    atom: AtomSource,
}

export function AtomSourceItem({ id, label, left, top, atom, sourceAtomKey, projectKey, color }: Props ) {

    const [modalOpened, setModalOpened] = useState(false);
    const [multiplicity, setMultiplicity] = useState("not Defined");
    const [dropDown, setDropdown] = useState(false)
    const [atomColor, setAtomColor] = useState(color);
    const [shapeValue, setShapeValue] = useState('rectangle');

    const renderType = ATOM_SOURCE;

    const [{ isDragging }, drag, preview] = useDrag(() => ({
            type: ATOM_SOURCE,
            item: {id, left, top, label, sourceAtomKey, projectKey, renderType},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            })
        }),
        [id, left, top, label, sourceAtomKey],
    )

    // useEffect(() => {
    //     window.electronAPI.setAtomColor(projectKey, sourceAtomKey, atomColor)
    // }, []);

    useEffect(() => {
        return () => {
            findAndSetMultiplicity()
        };
    }, []);

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [preview])

    function findAndSetMultiplicity() {
        //console.log(atom)
        const keys = ["isLone", "isOne", "isSome"]
        keys.forEach((key, i) => {

            if (atom[key] !== null) {
                setMultiplicity(key)
            }
        })
    }

    function handleColorChange( color:string ) {
        setAtomColor(color)
        window.electronAPI.setAtomColor(projectKey, sourceAtomKey, color)
    }

    function handleShapeChange( shape:string ) {
        setShapeValue(shape)
        window.electronAPI.setAtomShape(projectKey, sourceAtomKey, shape)
    }

    function editAtom() {
        setModalOpened(true)
    }

    if (dropDown) {
        return (
            <>
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={<Title size={"sm"}>{`Edit Atom - ${label}`}</Title>}
                >
                    <Input.Wrapper
                        mt={"xs"}
                        label={"Atom Color"}
                        description={"The color of the atom as it appears on the canvas."}>
                        <ColorInput
                            mt={"xs"}
                            mb={"sm"}
                            format="hex"
                            value={atomColor}
                            swatchesPerRow={12}
                            onChange={(e) => handleColorChange(e)}
                            swatches={getColorArray()}
                        />
                    </Input.Wrapper>

                    <Input.Wrapper
                        mt={"xs"}
                        label={"Atom Shape"}
                        description={"The shape of the atom as it appears on the canvas."}>
                        <SegmentedControl
                            size={"xs"}
                            mt={"xs"}
                            mb={"sm"}
                            value={shapeValue}
                            onChange={(e) => handleShapeChange(e)}
                            data={[{
                                label: (
                                    <Center>
                                        <IconRectangle size={16} />
                                        <Box ml={10}>Rectangle</Box>
                                    </Center>
                                ), value: 'rectangle' },
                                {label: (
                                    <Center>
                                        <IconCircle size={16} />
                                        <Box ml={10}>Circle</Box>
                                    </Center>
                                ), value: 'circle' },
                                {label: (
                                        <Center>
                                            <IconTriangle size={16} />
                                            <Box ml={10}>Triangle</Box>
                                        </Center>
                                    ), value: 'triangle' },
                            ]}
                        />
                    </Input.Wrapper>


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
                        width: "100%",
                    })}
                >
                    <Group>
                        <Text color={atomColor} size={"xl"} weight={"800"}>{label.split('/')[1]}</Text>
                        <ActionIcon onClick={() => setDropdown(!dropDown)} style={{float: "right"}}>
                            {dropDown ? <IconCaretUp/> : <IconCaretDown/>}
                        </ActionIcon>

                    </Group>

                    <Group mt={"xs"}>
                        <IconChartCircles color={"gray"}/>
                        <Text color={"white"} size={"md"} weight={"800"}> Multiplicity </Text>
                    </Group>
                    <Text ml={"sm"} color={atomColor} size={"md"} weight={600}> {multiplicity} </Text>

                    <Group mt={"xs"}>
                        <IconArrowMoveRight color={"gray"} />
                        <Text color="white" size={"md"} weight={800}> Relations </Text>
                    </Group>
                        { atom["relations"].length > 0 ?
                            atom["relations"].map(item => (
                                <Group>
                                    <Text ml={"sm"} color="white" weight={600}> {item["label"]}:</Text>
                                    <Text color="white"> {item["multiplicity"]} </Text>
                                </Group>
                            )) : (
                                <Text color={"dimmed"}> None </Text>
                            )
                        }

                    <Group mt={"xs"}>
                        <IconSubtask color={"gray"} />
                        <Text color="white" size={"md"} weight={800}> Extends </Text>
                    </Group>
                        { atom["parents"].length > 0 ?
                            atom["parents"].map(item => (
                                <Group>
                                    <Text ml={"sm"} color="white" weight={600}> {item}</Text>
                                </Group>
                            )) : (
                                <Text color={"dimmed"}> None </Text>
                            )
                        }

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
                        width: "100%",
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
