"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomDragLayer = void 0;
const react_dnd_1 = require("react-dnd");
const react_1 = __importDefault(require("react"));
const constants_1 = require("../utils/constants");
const core_1 = require("@mantine/core");
const react_absolute_svg_arrows_1 = require("react-absolute-svg-arrows");
const AtomInstance_1 = require("./Atom/AtomInstance");
const AtomSourceItem_1 = require("./AtomSource/AtomSourceItem");
const layerStyles = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};
function getItemStyles(item, initialSourceOffset, initialOffset, currentSourceOffset, currentOffset, delta, mousePos) {
    let { x, y } = currentSourceOffset;
    if (item.renderType === constants_1.ATOM_SOURCE) {
        const transform = `translate(${x}px, ${y}px)`;
        return {
            transform,
            WebkitTransform: transform,
        };
    }
    if (item.renderType === constants_1.ATOM) {
        let left = Math.round(delta.x);
        let top = Math.round(delta.y);
        const transform = `translate(
            ${mousePos.x + (initialSourceOffset.x - initialOffset.x) + left}px, 
            ${mousePos.y + (initialSourceOffset.y - initialOffset.y) + top}px
        )`;
        return { transform, WebkitTransform: transform };
    }
}
const CustomDragLayer = ({ mousePos }) => {
    const theme = (0, core_1.useMantineTheme)();
    const { isDragging, item, initialOffset, initialSourceOffset, currentSourceOffset, currentOffset, delta, } = (0, react_dnd_1.useDragLayer)((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialSourceOffset: monitor.getInitialSourceClientOffset(),
        initialOffset: monitor.getInitialClientOffset(),
        delta: monitor.getDifferenceFromInitialOffset(),
        currentSourceOffset: monitor.getSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));
    const renderItem = () => {
        switch (item.renderType) {
            case constants_1.ATOM:
                return react_1.default.createElement(AtomInstance_1.AtomInstance, { contentsBeingDragged: true, atom: item.data });
            case constants_1.ATOM_SOURCE:
                return react_1.default.createElement(AtomSourceItem_1.AtomSourceItem, { atomSource: item.data });
            case constants_1.CONNECTION:
                return (react_1.default.createElement(react_absolute_svg_arrows_1.Arrow, { startPoint: { x: mousePos.x, y: mousePos.y }, endPoint: {
                        //@ts-ignore
                        x: mousePos.x + delta.x + 16,
                        //@ts-ignore
                        y: mousePos.y + delta.y + 16,
                    }, config: { arrowColor: theme.colors.blue[5], strokeWidth: 5 } }));
            default:
                return null;
        }
    };
    if (!isDragging) {
        return null;
    }
    return (react_1.default.createElement("div", { style: layerStyles },
        react_1.default.createElement("div", { style: getItemStyles(item, initialSourceOffset, initialOffset, currentSourceOffset, currentOffset, delta, mousePos) }, renderItem())));
};
exports.CustomDragLayer = CustomDragLayer;
