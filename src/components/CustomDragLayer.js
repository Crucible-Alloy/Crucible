import {useDragLayer} from 'react-dnd'
import {ATOM, ATOM_SOURCE, CONNECTION} from '../utils/constants'
import { snapToGrid } from './examples/SnapToGrid.js'
import {Atom} from "./atoms/Atom";
import {Text, useMantineTheme} from "@mantine/core";
import Xarrow from "react-xarrows";
import { Arrow } from 'react-absolute-svg-arrows';
import {useEffect, useRef, useState} from "react";
import * as PropTypes from "prop-types";

const layerStyles = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
}

function getItemStyles(item, initialSourceOffset, initialOffset, currentSourceOffset, currentOffset, delta, mousePos) {
    let { x, y } = currentSourceOffset

    if (item.renderType === ATOM_SOURCE) {
        const transform = `translate(${x}px, ${y}px)`
        return {
            transform,
            WebkitTransform: transform,
        }
    }
    if (item.renderType === CONNECTION) {
    //     console.log("Initial Offset: " + initialSourceOffset.x + "," + initialSourceOffset.y );
    //     console.log("Current Offset: " + currentOffset.x + "," + currentOffset.y );
    //
    //     let left = Math.round(delta.x)
    //     let top = Math.round(delta.y)
    //     let translated_x = left + 500;
    //     let translated_y = top + 150;
            const transform = `translate(${initialSourceOffset.x - initialOffset.x}px, ${initialSourceOffset.y - initialOffset.y}px)`
        return {
            transform,
            WebkitTransform: transform,
        }
    }

}

export const CustomDragLayer = ({mousePos}) => {

    const theme = useMantineTheme();

    const { itemType, isDragging, item, initialOffset, initialSourceOffset, currentSourceOffset, currentOffset, delta } =
        useDragLayer((monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialSourceOffset: monitor.getInitialSourceClientOffset(),
            initialOffset: monitor.getInitialClientOffset(),
            delta: monitor.getDifferenceFromInitialOffset(),
            currentSourceOffset: monitor.getSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
        }))

    const renderItem = () => {

        switch (item.renderType) {
            case ATOM:
                console.log("existing atom")
                return (
                    <Atom id={item.id} left={item.left} top={item.top} sourceAtomKey={item.sourceAtomKey} projectKey={item.projectKey} testKey={item.testKey} />
                );
            case ATOM_SOURCE:
                return (
                    <Atom id={item.id} left={item.left} top={item.top} sourceAtomKey={item.sourceAtomKey} projectKey={item.projectKey} testKey={item.testKey} />
                );
            case CONNECTION:
                console.log("dragging connection")
                console.log(`Atom coords: \n X: ${item.left}, ${item.top}`);
                console.log(`Mouse coords: \n X: ${mousePos.x}`);

                return (
                    <Arrow startPoint={{x: mousePos.x, y: mousePos.y}} endPoint={{x: mousePos.x + delta.x + 120, y: mousePos.y + delta.y + 30}} config={{arrowColor: theme.colors.blue[5], strokeWidth: 5}}/>
                )

            default:
                return null;
        }
    };

    if (!isDragging) {
        return null
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
            <div style={getItemStyles(item, initialSourceOffset, initialOffset, currentSourceOffset, currentOffset, delta)}>
                {renderItem()}
            </div>
        </div>
    )
}
