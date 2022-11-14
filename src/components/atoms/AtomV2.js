import {useEffect, useState} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {CONNECTION} from '../../utils/constants'
import {Paper, useMantineTheme, MantineTheme, Container} from "@mantine/core";
import {AtomContents} from "./AtomContents";
const { v4: uuidv4 } = require('uuid');

// function getStyles(left, top, isDragging) {
//     const transform = `translate3d(${left}px, ${top}px, 0)`
//     return {
//         position: 'absolute',
//         // IE fallback: hide the real node using CSS when dragging
//         // because IE will ignore our custom "empty image" drag preview.
//         opacity: isDragging ? 0 : 1,
//         height: "50px",
//         width: "50px",
//         top: -10,
//         left: 160,
//         zIndex: 1000,
//         background: "red",
//         borderRadius: 100
//     }
// }


export function AtomV2({ atomId, atomLabel, sourceAtomKey, nickname, atomShape, testKey, projectKey, left, top}) {
    const renderType = CONNECTION;
    const theme = useMantineTheme();
    const [atomColor, setColor] = useState(initializeColor);

    // TODO: Check if any accept types are not at their multiplicity, set canDrag accordingly.

    function getAtomStyles(theme, shape, isDragging, left, top, atomColor) {
        const backgroundColor = isDragging ? theme.colors.green[5] : atomColor
        const transform = `translate3d(${left}px, ${top}px, 0)`

        return {
            position: 'absolute',
            transform,
            WebkitTransform: transform,
            backgroundColor: backgroundColor,
            borderRadius: "16px",
            padding: 12,
        }
        // if (shape ==="rectangle") {} else if (shape === "triangle") {
        //     return {
        //         backgroundColor: backgroundColor,
        //         width: 0,
        //         height: 0,
        //         borderLeft: "100px solid transparent",
        //         borderRight: "100px solid transparent",
        //         borderBottom: `200px solid`,
        //     }
        // } else if (shape === "circle") {
        //     return {
        //         backgroundColor: backgroundColor,
        //         border: `solid 6px ${atomColor}`,
        //         width: 100,
        //         height: 100,
        //         borderRadius: 100,
        //     }
        // }
    }

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true})
    }, [])

    useEffect( () => {
        window.electronAPI.listenForColorChange((_event, value) => {
            window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
                setColor(color);
            })
        })
    }, []);

    function initializeColor() {
        window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
            setColor(color)
        })
    }

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: CONNECTION,
            item: {atomId, renderType, atomLabel, sourceAtomKey, nickname, top, left},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [atomId, atomLabel, sourceAtomKey, nickname, top, left],
    )

    if (isDragging) {
        console.log("dragging")
    }

    return isDragging ? (
        <>
            <Container
                ref={drag}
                id={atomId}
                style={getAtomStyles(theme, atomShape, isDragging, left, top, atomColor)}
                shadow="md"
                // role="ConnectionArrow"
            >
                <AtomContents sourceAtomKey={sourceAtomKey} id={atomId} label={atomLabel} projectKey={projectKey} left={left} top={top} testKey={testKey} />
            </Container>
        </>
    ) : (
        <Container
            ref={drag}
            id={atomId}
            style={getAtomStyles(theme, atomShape, isDragging, left, top, atomColor)}
            shadow="md"
            // role="ConnectionArrow"
        >
            <AtomContents sourceAtomKey={sourceAtomKey} id={atomId} label={atomLabel} projectKey={projectKey} left={left} top={top} testKey={testKey} />
        </Container>
    )
}