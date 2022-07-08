import {useDragLayer} from 'react-dnd'
import { ItemTypes } from './ItemTypes.js'
import { snapToGrid } from './SnapToGrid.js'
import {Atom} from "./Atom";

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
}

function getItemStyles(initialOffset, currentOffset, isSnapToGrid) {

    let { x, y } = currentOffset
    if (isSnapToGrid) {
        x -= initialOffset.x
        y -= initialOffset.y
        ;[x, y] = snapToGrid(x, y)
        x += initialOffset.x
        y += initialOffset.y
    }
    const transform = `translate(${x}px, ${y}px)`
    return {
        transform,
        WebkitTransform: transform,
    }
}

export const CustomDragLayer = (props) => {

    const { itemType, isDragging, item, initialOffset, currentOffset } =
        useDragLayer((monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
        }))

    const renderItem = () => {
        switch (itemType) {
            case ItemTypes.ATOM:
                return (
                    <Atom id={item.id} title={item.title} color={item.color} />
                );
            case ItemTypes.ATOM_SOURCE:
                return (
                    <Atom id={item.id} title={item.title} color={item.color} />
                );
            default:
                return null;
        }
    };

    if (!isDragging) {
        return null;
    }

    return (
        <div style={layerStyles}>
            <div
                style={getItemStyles(initialOffset, currentOffset, false)}
            >
                {renderItem()}
            </div>
        </div>
    )
}
