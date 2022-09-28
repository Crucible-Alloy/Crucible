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
    if (item.renderType === ATOM_SOURCE) {
        const transform = `translate(${x}px, ${y}px)`
        return {
            transform,
            WebkitTransform: transform,
        }
    }

    console.log("Initial Offset: " + initialOffset.x + "," + initialOffset.y );
    console.log("Current Offset: " + currentOffset.x + "," + currentOffset.y );

    let left = Math.round(delta.x)
    let top = Math.round(delta.y)
    let translated_x = left + 500;
    let translated_y = top + 150;
    const transform = `translate(${translated_x}px, ${translated_y}px)`
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

        switch (item.renderType) {
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
                        <Xarrow start={item.atomId} end={item}/>
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
