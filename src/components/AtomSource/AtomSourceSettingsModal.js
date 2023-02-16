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
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const helpers_1 = require("../../../utils/helpers");
const icons_1 = require("@tabler/icons");
function AtomSourceSettingsModal({ atomSource, opened, setModalOpened, }) {
    const [atomColor, setAtomColor] = (0, react_1.useState)(atomSource.color);
    const [shapeValue, setShapeValue] = (0, react_1.useState)(atomSource.shape);
    function handleColorChange(color) {
        setAtomColor(color);
        window.electronAPI.setAtomColor({ sourceAtomID: atomSource.id, color });
    }
    function handleShapeChange(shape) {
        setShapeValue(shape);
        window.electronAPI.setAtomShape(atomSource.projectID, atomSource.id, shape);
    }
    return (react_1.default.createElement(core_1.Modal, { opened: opened, onClose: () => setModalOpened(false), title: react_1.default.createElement(core_1.Title, { size: "sm" }, `Edit Atom - ${atomSource.label}`) },
        react_1.default.createElement(core_1.Input.Wrapper, { mt: "xs", label: "Atom Color", description: "The color of the atom as it appears on the canvas." },
            react_1.default.createElement(core_1.ColorInput, { mt: "xs", mb: "sm", format: "hex", value: atomColor, swatchesPerRow: 12, onChange: (e) => handleColorChange(e), swatches: (0, helpers_1.getColorArray)() })),
        react_1.default.createElement(core_1.Input.Wrapper, { mt: "xs", label: "Atom Shape", description: "The shape of the atom as it appears on the canvas." },
            react_1.default.createElement(core_1.SegmentedControl, { size: "xs", mt: "xs", mb: "sm", value: shapeValue, onChange: (e) => handleShapeChange(e), data: [
                    {
                        label: (react_1.default.createElement(core_1.Center, null,
                            react_1.default.createElement(icons_1.IconRectangle, { size: 16 }),
                            react_1.default.createElement(core_1.Box, { ml: 10 }, "Rectangle"))),
                        value: "rectangle",
                    },
                    {
                        label: (react_1.default.createElement(core_1.Center, null,
                            react_1.default.createElement(icons_1.IconCircle, { size: 16 }),
                            react_1.default.createElement(core_1.Box, { ml: 10 }, "Circle"))),
                        value: "circle",
                    },
                    {
                        label: (react_1.default.createElement(core_1.Center, null,
                            react_1.default.createElement(icons_1.IconTriangle, { size: 16 }),
                            react_1.default.createElement(core_1.Box, { ml: 10 }, "Triangle"))),
                        value: "triangle",
                    },
                ] }))));
}
exports.default = AtomSourceSettingsModal;
