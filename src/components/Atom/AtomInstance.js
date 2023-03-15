"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomInstance = void 0;
const react_1 = __importStar(require("react"));
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const AtomContents_1 = require("./AtomContents");
const core_1 = require("@mantine/core");
const constants_1 = require("../../utils/constants");
const { v4: uuidv4 } = require("uuid");
function getAtomStyles(contentsBeingDragged, theme, shape, isDragging, left, top, color) {
    const transform = `translate3d(${left}px, ${top}px, 0)`;
    // If we are being dragged via the AtomContents module, leave the positioning to the drag layer.
    if (!contentsBeingDragged) {
        return {
            position: "absolute",
            transform,
            WebkitTransform: transform,
            backgroundColor: color,
            borderRadius: "8px",
            border: `solid 20px ${isDragging ? theme.colors.green[5] : color}`,
        };
    }
    else {
        return {
            position: "absolute",
            backgroundColor: color,
            borderRadius: "8px",
            border: `solid 20px ${isDragging ? theme.colors.green[5] : theme.colors.dark[5]}`,
        };
    }
}
function AtomInstance({ contentsBeingDragged, atom }) {
    const renderType = constants_1.CONNECTION;
    const theme = (0, core_1.useMantineTheme)();
    const [metaData, setMetaData] = (0, react_1.useState)(atom.srcAtom);
    // TODO: Check if any accept types are not at their multiplicity, set canDrag accordingly.
    (0, react_1.useEffect)(() => {
        preview((0, react_dnd_html5_backend_1.getEmptyImage)(), { captureDraggingState: true });
    }, []);
    (0, react_1.useEffect)(() => {
        window.electronAPI.listenForMetaDataChange((_event, value) => {
            window.electronAPI
                .getAtomSource(atom.srcID)
                .then((srcAtom) => {
                setMetaData(srcAtom);
            });
        });
    }, []);
    const [{ isDragging }, drag, preview] = (0, react_dnd_1.useDrag)(() => ({
        type: atom.srcAtom.label,
        item: {
            renderType,
            data: atom,
            metaData,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [atom, metaData]);
    return isDragging ? (react_1.default.createElement(core_1.Container, { ref: drag, id: atom.id.toString(), style: getAtomStyles(contentsBeingDragged, theme, metaData.shape, isDragging, atom.left, atom.top, metaData.color) },
        react_1.default.createElement(AtomContents_1.AtomContents, { atom: atom }))) : (react_1.default.createElement(core_1.Container, { ref: drag, id: atom.id.toString(), style: getAtomStyles(contentsBeingDragged, theme, metaData.shape, isDragging, atom.left, atom.top, metaData.color) },
        react_1.default.createElement(AtomContents_1.AtomContents, { atom: atom })));
}
exports.AtomInstance = AtomInstance;
