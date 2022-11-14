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
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: "50px",
        width: "50px",
        top: -10,
        left: 160,
        zIndex: 1000,
        background: "red",
        borderRadius: 100
    }
}

export function AtomOutPort({ atomId, atomColor, atomLabel, sourceAtomKey, nickname}) {
    const portId = uuidv4();
    const renderType = CONNECTION;

    // TODO: Check if any accept types are not at their multiplicity, set canDrag accordingly.

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [])

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: atomLabel,
            item: {portId, atomId, renderType, atomLabel, sourceAtomKey, nickname},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [atomId, atomLabel, sourceAtomKey, nickname],
    )

    if (isDragging) {
        console.log("dragging")
    }

    return (
        <div
            ref={drag}
            id={portId}
            style={getStyles(isDragging)}
            // role="ConnectionArrow"
        >
                    {/*<Paper*/}
                    {/*    className={"connectPoint"}*/}
                    {/*    sx={(theme) => ({*/}
                    {/*        position: "absolute",*/}
                    {/*        top: -10,*/}
                    {/*        left: 160,*/}
                    {/*        height: "100%",*/}
                    {/*        width: "50px",*/}
                    {/*        borderRadius: "100%",*/}
                    {/*        border: `solid 6px ${atomColor}`,*/}
                    {/*        backgroundColor: theme.colors.dark[5],*/}

                    {/*        '&:hover': {*/}
                    {/*            backgroundColor: `${atomColor}`*/}
                    {/*        }*/}

                    {/*    })} />*/}
        </div>
    )
}