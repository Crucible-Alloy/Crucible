import {memo, useEffect} from 'react';
import {Paper, Text} from "@mantine/core";
import {CodePlus} from "tabler-icons-react";
import {useDrag} from "react-dnd";
import {ItemTypes} from "./ItemTypes";
import {getEmptyImage} from "react-dnd-html5-backend";

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

    return (
        <Paper
            ref={drag}
            //style={getStyles(left, top, isDragging)}
            shadow="md"
            p="md"
            radius={"md"}
            role="DraggableBox"
            sx={(theme) => ({
                backgroundColor: theme.colors.dark[5],
                border: `solid 6px blue`,
                width: 200,
            })}
        >
            <Text color={"blue"} size={"xl"} weight={"800"}>{label} <CodePlus /></Text>
        </Paper>
    );
});
