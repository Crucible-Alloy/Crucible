import { memo, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ItemTypes } from './ItemTypes.js'
import {Paper, Text} from "@mantine/core";
import {CodePlus} from "tabler-icons-react";

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
export const Atom = memo(function Atom(props) {
    const { id, title, left, top, color } = props
    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: ItemTypes.ATOM,
            item: { id, left, top, title, color },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id, left, top, title, color],
    )
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    }, [])
    return (
        <div
            ref={drag}
            style={getStyles(left, top, isDragging)}
            role="DraggableBox"
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
                    border: `solid 6px ${color}`,
                    width: 200,
                })}
            >
                <Text color={color} size={"xl"} weight={"800"}>{title} <CodePlus /></Text>
            </Paper>
        </div>
    )
})

