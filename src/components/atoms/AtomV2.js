import {useEffect, useState} from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {CONNECTION} from '../../utils/constants'
import {Paper, useMantineTheme, MantineTheme, Container} from "@mantine/core";
import {AtomContents} from "./AtomContents";
const { v4: uuidv4 } = require('uuid');


function getAtomStyles(contentsBeingDragged, theme, shape, isDragging, left, top, color) {
    const transform = `translate3d(${left}px, ${top}px, 0)`

    // If we are being dragged via the AtomContents module, leave the positioning to the drag layer.
    if (!contentsBeingDragged) {
        return {
            position: 'absolute',
            transform,
            WebkitTransform: transform,
            backgroundColor: color,
            borderRadius: "8px",
            border: `solid 20px ${isDragging ? theme.colors.green[5] : color}`,
        }
    } else {
        return {
            position: 'absolute',
            backgroundColor: color,
            borderRadius: "8px",
            border: `solid 20px ${isDragging ? theme.colors.green[5] : theme.colors.dark[5]}`,
        }
    }
}

export function AtomV2({ contentsBeingDragged, id, atomLabel, sourceAtomKey, nickname, atomShape, testKey, projectKey, left, top}) {
    const renderType = CONNECTION;
    const theme = useMantineTheme();
    const [atomColor, setColor] = useState(initializeColor);
    const [metaData, setMetaData] = useState(initializeMetaData);

    useEffect( () => {
        window.electronAPI.listenForMetaDataChange((_event, value) => {
            window.electronAPI.getAtom(projectKey, sourceAtomKey).then(atom => {
                setMetaData(atom);
            })
        })
    }, []);

    // TODO: Check if any accept types are not at their multiplicity, set canDrag accordingly.

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

    function initializeMetaData() {
        window.electronAPI.getAtom(projectKey, sourceAtomKey).then(atom => {
            setMetaData(atom);
        })
    }

    function initializeColor() {
        window.electronAPI.getAtomColor(projectKey, sourceAtomKey).then(color => {
            setColor(color)
        })
    }

    const [{isDragging}, drag, preview] = useDrag(
        () => ({
            type: atomLabel,
            item: {id, renderType, atomLabel, sourceAtomKey, nickname, top, left},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id, atomLabel, sourceAtomKey, nickname, top, left],
    )

    return isDragging ? (
        <Container
            ref={drag}
            id={id}
            style={getAtomStyles(contentsBeingDragged, theme, atomShape, isDragging, left, top, atomColor)}
            shadow="md"
            // role="ConnectionArrow"
        >
            <AtomContents id={id} sourceAtomKey={sourceAtomKey} projectKey={projectKey} testKey={testKey} left={left} top={top} />
        </Container>
    ) : (
        <Container
            ref={drag}
            id={id}
            style={getAtomStyles(contentsBeingDragged, theme, atomShape, isDragging, left, top, atomColor)}
            shadow="md"
            // role="ConnectionArrow"
        >
            <AtomContents id={id} left={left} top={top} sourceAtomKey={sourceAtomKey} projectKey={projectKey} testKey={testKey} />
        </Container>
    )
}