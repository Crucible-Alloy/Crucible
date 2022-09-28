import {useEffect} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {CONNECTION} from '../../utils/constants'
import {Paper} from "@mantine/core";
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
export function AtomOutPort({ atomId, atomColor, atomLabel, sourceAtomKey}) {
    const portId = uuidv4();

    // const [position, setPosition] = useState({});

    const renderType = CONNECTION;

    // TODO: Check if any accept types are not at their multiplicity, set canDrag accordingly.

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: atomLabel,
            item: {portId, atomId, renderType, atomLabel, sourceAtomKey},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
                offset: monitor.getClientOffset(),
            }),
        }),
        [atomId, atomLabel, sourceAtomKey],
    )

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [])

    return (
        <div
            ref={drag}
            id={portId}
            style={getStyles(isDragging)}
            role="ConnectionArrow"
        >
                    <Paper
                        className={"connectPoint"}
                        sx={(theme) => ({
                            position: "absolute",
                            top: -10,
                            left: 160,
                            height: "24px",
                            width: "24px",
                            zIndex: "90",
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