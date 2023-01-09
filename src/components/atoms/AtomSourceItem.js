"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomSourceItem = void 0;
const react_1 = require("react");
const core_1 = require("@mantine/core");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const react_2 = __importDefault(require("react"));
const icons_1 = require("@tabler/icons");
const helpers_1 = require("../../utils/helpers");
const { ATOM_SOURCE } = require("../../utils/constants.js");
function getStyles(left, top, isDragging) {
    //const transform = `translate3d(${left}px, ${top}px, 0)`
    return {
        position: 'absolute',
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : '',
    };
}
function AtomSourceItem({ id, label, left, top, atom, sourceAtomKey, projectKey, color }) {
    const [modalOpened, setModalOpened] = (0, react_1.useState)(false);
    const [multiplicity, setMultiplicity] = (0, react_1.useState)("not Defined");
    const [dropDown, setDropdown] = (0, react_1.useState)(false);
    const [atomColor, setAtomColor] = (0, react_1.useState)(color);
    const [shapeValue, setShapeValue] = (0, react_1.useState)('rectangle');
    const renderType = ATOM_SOURCE;
    const [{ isDragging }, drag, preview] = (0, react_dnd_1.useDrag)(() => ({
        type: ATOM_SOURCE,
        item: { id, left, top, label, sourceAtomKey, projectKey, renderType },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    }), [id, left, top, label, sourceAtomKey]);
    // useEffect(() => {
    //     window.electronAPI.setAtomColor(projectKey, sourceAtomKey, atomColor)
    // }, []);
    (0, react_1.useEffect)(() => {
        return () => {
            findAndSetMultiplicity();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        preview((0, react_dnd_html5_backend_1.getEmptyImage)(), { captureDraggingState: true });
    }, [preview]);
    function findAndSetMultiplicity() {
        //console.log(atom)
        const keys = ["isLone", "isOne", "isSome"];
        keys.forEach((key, i) => {
            if (atom[key] !== null) {
                setMultiplicity(key);
            }
        });
    }
    function handleColorChange(color) {
        setAtomColor(color);
        window.electronAPI.setAtomColor(projectKey, sourceAtomKey, color);
    }
    function handleShapeChange(shape) {
        setShapeValue(shape);
        window.electronAPI.setAtomShape(projectKey, sourceAtomKey, shape);
    }
    function editAtom() {
        setModalOpened(true);
    }
    if (dropDown) {
        return (react_2.default.createElement(react_2.default.Fragment, null,
            react_2.default.createElement(core_1.Modal, { opened: modalOpened, onClose: () => setModalOpened(false), title: react_2.default.createElement(core_1.Title, { size: "sm" }, `Edit Atom - ${label}`) },
                react_2.default.createElement(core_1.Input.Wrapper, { mt: "xs", label: "Atom Color", description: "The color of the atom as it appears on the canvas." },
                    react_2.default.createElement(core_1.ColorInput, { mt: "xs", mb: "sm", format: "hex", value: atomColor, swatchesPerRow: 12, onChange: (e) => handleColorChange(e), swatches: (0, helpers_1.getColorArray)() })),
                react_2.default.createElement(core_1.Input.Wrapper, { mt: "xs", label: "Atom Shape", description: "The shape of the atom as it appears on the canvas." },
                    react_2.default.createElement(core_1.SegmentedControl, { size: "xs", mt: "xs", mb: "sm", value: shapeValue, onChange: (e) => handleShapeChange(e), data: [{
                                label: (react_2.default.createElement(core_1.Center, null,
                                    react_2.default.createElement(icons_1.IconRectangle, { size: 16 }),
                                    react_2.default.createElement(core_1.Box, { ml: 10 }, "Rectangle"))), value: 'rectangle'
                            },
                            { label: (react_2.default.createElement(core_1.Center, null,
                                    react_2.default.createElement(icons_1.IconCircle, { size: 16 }),
                                    react_2.default.createElement(core_1.Box, { ml: 10 }, "Circle"))), value: 'circle' },
                            { label: (react_2.default.createElement(core_1.Center, null,
                                    react_2.default.createElement(icons_1.IconTriangle, { size: 16 }),
                                    react_2.default.createElement(core_1.Box, { ml: 10 }, "Triangle"))), value: 'triangle' },
                        ] }))),
            react_2.default.createElement(core_1.Paper, { ref: drag, 
                //style={getStyles(left, top, isDragging)}
                shadow: "md", size: "xl", p: "md", radius: "lg", role: "DraggableBox", sx: (theme) => ({
                    backgroundColor: theme.colors.dark[4],
                    border: `solid 6px ${atomColor}`,
                    width: "100%",
                }) },
                react_2.default.createElement(core_1.Group, null,
                    react_2.default.createElement(core_1.Text, { color: atomColor, size: "xl", weight: "800" }, label.split('/')[1]),
                    react_2.default.createElement(core_1.ActionIcon, { onClick: () => setDropdown(!dropDown), style: { float: "right" } }, dropDown ? react_2.default.createElement(icons_1.IconCaretUp, null) : react_2.default.createElement(icons_1.IconCaretDown, null))),
                react_2.default.createElement(core_1.Group, { mt: "xs" },
                    react_2.default.createElement(icons_1.IconChartCircles, { color: "gray" }),
                    react_2.default.createElement(core_1.Text, { color: "white", size: "md", weight: "800" }, " Multiplicity ")),
                react_2.default.createElement(core_1.Text, { ml: "sm", color: atomColor, size: "md", weight: 600 },
                    " ",
                    multiplicity,
                    " "),
                react_2.default.createElement(core_1.Group, { mt: "xs" },
                    react_2.default.createElement(icons_1.IconArrowMoveRight, { color: "gray" }),
                    react_2.default.createElement(core_1.Text, { color: "white", size: "md", weight: 800 }, " Relations ")),
                atom["relations"].length > 0 ?
                    atom["relations"].map(item => (react_2.default.createElement(core_1.Group, null,
                        react_2.default.createElement(core_1.Text, { ml: "sm", color: "white", weight: 600 },
                            " ",
                            item["label"],
                            ":"),
                        react_2.default.createElement(core_1.Text, { color: "white" },
                            " ",
                            item["multiplicity"],
                            " ")))) : (react_2.default.createElement(core_1.Text, { color: "dimmed" }, " None ")),
                react_2.default.createElement(core_1.Group, { mt: "xs" },
                    react_2.default.createElement(icons_1.IconSubtask, { color: "gray" }),
                    react_2.default.createElement(core_1.Text, { color: "white", size: "md", weight: 800 }, " Extends ")),
                atom["parents"].length > 0 ?
                    atom["parents"].map(item => (react_2.default.createElement(core_1.Group, null,
                        react_2.default.createElement(core_1.Text, { ml: "sm", color: "white", weight: 600 },
                            " ",
                            item)))) : (react_2.default.createElement(core_1.Text, { color: "dimmed" }, " None ")),
                react_2.default.createElement(core_1.Group, { position: "right" },
                    react_2.default.createElement(core_1.ActionIcon, { onClick: editAtom },
                        react_2.default.createElement(icons_1.IconEdit, null))))));
    }
    else {
        return (react_2.default.createElement(react_2.default.Fragment, null,
            react_2.default.createElement(core_1.Modal, { opened: modalOpened, onClose: () => setModalOpened(false), title: "Edit Atom" },
                react_2.default.createElement(core_1.ColorPicker, null)),
            react_2.default.createElement(core_1.Paper, { ref: drag, 
                //style={getStyles(left, top, isDragging)}
                shadow: "md", size: "xl", p: "md", radius: "lg", role: "DraggableBox", sx: (theme) => ({
                    backgroundColor: theme.colors.dark[4],
                    border: `solid 6px ${atomColor}`,
                    width: "100%",
                }) },
                react_2.default.createElement(core_1.Group, null,
                    react_2.default.createElement(core_1.Text, { color: atomColor, size: "xl", weight: "800" }, label),
                    react_2.default.createElement(core_1.ActionIcon, { onClick: () => setDropdown(!dropDown), style: { float: "right" } }, dropDown ? react_2.default.createElement(icons_1.IconCaretUp, null) : react_2.default.createElement(icons_1.IconCaretDown, null))))));
    }
}
exports.AtomSourceItem = AtomSourceItem;
