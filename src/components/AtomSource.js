import {memo, useEffect, useState} from 'react';
import {
    ActionIcon,
    Badge,
    Button,
    Center, ColorPicker,
    Group,
    Input,
    InputWrapper, Modal,
    Paper,
    SimpleGrid,
    Text,
    TextInput
} from "@mantine/core";
import {CaretDown, CodePlus, Dots, Edit, FileSearch} from "tabler-icons-react";
import {useDrag} from "react-dnd";
import {ItemTypes} from "./ItemTypes";
import {getEmptyImage} from "react-dnd-html5-backend";
import React from "react";

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

export const AtomSource = memo(function AtomSource(props) {
    const { id, label, left, top, color } = props
    const [modalOpened, setModalOpened] = useState(false);

    const [{ isDragging }, drag, preview] = useDrag(() => ({
            type: ItemTypes.ATOM_SOURCE,
            item: { id, left, top, label, color},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            })
        }),
    [id, left, top, label, color],
    )
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    }, [])

    function editAtom() {
        setModalOpened(true)
    }

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
                border: `solid 6px ${theme.colors.blue[4]}`,
                width: 300,
            })}
        >
                <Text color={"blue"} size={"xl"} weight={"800"}>{label.split('/')[1]}</Text>
                <ActionIcon onClick={editAtom}>
                    <Edit/>
                </ActionIcon>


        </Paper>
        </>
    );
});
