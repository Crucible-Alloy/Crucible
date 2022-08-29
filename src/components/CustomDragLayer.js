import {useDragLayer} from 'react-dnd'
import {ATOM, ATOM_SOURCE, CONNECTION} from '../utils/constants'
import { snapToGrid } from './examples/SnapToGrid.js'
import {Atom} from "./atoms/Atom";
import {Text} from "@mantine/core";
import Xarrow from "react-xarrows";
import {useEffect, useRef, useState} from "react";
import * as PropTypes from "prop-types";

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
}

function getItemStyles(item, initialOffset, currentOffset, delta,) {

    let { x, y } = currentOffset

    let left = Math.round(item.left + delta.x)
    let top = Math.round(item.top + delta.y)

    // Translate mainWindow coordinates (dragLayer) to canvas coordinates
    let translated_x = x * (1600 / 1000)
    let translated_y = y * (900 / 600)

    // if (isSnapToGrid) {
    //     x -= initialOffset.x
    //     y -= initialOffset.y
    //     ;[x, y] = snapToGrid(x, y)
    //     x += initialOffset.x
    //     y += initialOffset.y
    // }

    const transform = `translate(${x}px, ${y}px)`
    return {
        transform,
        WebkitTransform: transform,
    }
}

export const CustomDragLayer = (props) => {

    const { itemType, isDragging, item, initialOffset, currentOffset, delta } =
        useDragLayer((monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            delta: monitor.getDifferenceFromInitialOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
        }))

    const renderItem = () => {

        switch (itemType) {
            case ATOM:
                return (
                    <Atom id={item.id} left={item.left} top={item.top} sourceAtomKey={item.sourceAtomKey} projectKey={item.projectKey} testKey={item.testKey} />
                );
            case ATOM_SOURCE:
                return (
                    <Atom id={item.id} left={item.left} top={item.top} sourceAtomKey={item.sourceAtomKey} projectKey={item.projectKey} testKey={item.testKey} />
                );
            case CONNECTION:
                return (
                    <>
                        <Xarrow start={item.atomId} end={item.__id}/>
                    </>
                )


            default:
                return null;
        }
    };

    if (!isDragging) {
        return null;
    }

    // if (isDragging && (itemType === CONNECTION)) {
    //     return (
    //         <div style={layerStyles}>
    //             <div style={getItemStyles(initialOffset, currentOffset, false)} >
    //                 <Xarrow start={item.atomId} end={item.outPort}/>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(item, initialOffset, currentOffset, delta)}>
                {renderItem()}
            </div>
        </div>
    )
}
