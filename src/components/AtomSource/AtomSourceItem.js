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
const AtomSourceSettingsModal_1 = __importDefault(require("./AtomSourceSettingsModal"));
const { ATOM_SOURCE } = require("../../utils/constants");
function getStyles(left, top, isDragging) {
    //const transform = `translate3d(${left}px, ${top}px, 0)`
    return {
        position: "absolute",
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : "",
    };
}
function AtomSourceItem({ atomSource }) {
    const [modalOpened, setModalOpened] = (0, react_1.useState)(false);
    const [dropDown, setDropdown] = (0, react_1.useState)(false);
    const [multiplicity, setMultiplicity] = (0, react_1.useState)("not Defined");
    const renderType = ATOM_SOURCE;
    const [{ isDragging }, drag, preview] = (0, react_dnd_1.useDrag)(() => ({
        type: ATOM_SOURCE,
        item: {
            data: atomSource,
            renderType,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), []);
    (0, react_1.useEffect)(() => {
        return () => {
            findAndSetMultiplicity();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        preview((0, react_dnd_html5_backend_1.getEmptyImage)(), { captureDraggingState: true });
    }, [preview]);
    // TODO: Set listener for color change.
    function findAndSetMultiplicity() {
        atomSource.isLone
            ? setMultiplicity("isLone")
            : atomSource.isOne
                ? setMultiplicity("isOne")
                : atomSource.isSome
                    ? setMultiplicity("isSome")
                    : setMultiplicity("not defined");
    }
    function editAtom() {
        setModalOpened(true);
    }
    return (react_2.default.createElement(react_2.default.Fragment, null,
        react_2.default.createElement(AtomSourceSettingsModal_1.default, { atomSource: atomSource, setModalOpened: setModalOpened, opened: modalOpened }),
        react_2.default.createElement(core_1.Paper, { ref: drag, shadow: "md", p: "md", radius: "lg", role: "DraggableBox", sx: (theme) => ({
                backgroundColor: theme.colors.dark[4],
                border: `solid 6px ${atomSource.color}`,
                width: "200px",
            }) },
            react_2.default.createElement(core_1.Group, null,
                react_2.default.createElement(core_1.Text, { color: atomSource.color, size: "xl", weight: 800 }, atomSource.label.split("/")[1]),
                react_2.default.createElement(core_1.ActionIcon, { onClick: () => setDropdown(!dropDown), style: { float: "right" } }, dropDown ? react_2.default.createElement(icons_1.IconCaretUp, null) : react_2.default.createElement(icons_1.IconCaretDown, null))),
            dropDown ? (
            //  TODO: refactor atomSource dropdown into it's own component
            react_2.default.createElement(react_2.default.Fragment, null,
                react_2.default.createElement(core_1.Group, { mt: "xs" },
                    react_2.default.createElement(icons_1.IconChartCircles, { color: "gray" }),
                    react_2.default.createElement(core_1.Text, { color: "white", size: "md", weight: 800 },
                        " ",
                        "Multiplicity",
                        " ")),
                react_2.default.createElement(core_1.Text, { ml: "sm", color: atomSource.color, size: "md", weight: 600 },
                    " ",
                    multiplicity,
                    " "),
                react_2.default.createElement(core_1.Group, { mt: "xs" },
                    react_2.default.createElement(icons_1.IconArrowMoveRight, { color: "gray" }),
                    react_2.default.createElement(core_1.Text, { color: "white", size: "md", weight: 800 },
                        " ",
                        "Relations",
                        " ")),
                atomSource.fromRelations ? (atomSource.fromRelations.map((item) => (react_2.default.createElement(core_1.Group, null,
                    react_2.default.createElement(core_1.Text, { ml: "sm", color: "white", weight: 600 },
                        " ",
                        item.label,
                        ":"),
                    react_2.default.createElement(core_1.Text, { color: "white" },
                        " ",
                        item.multiplicity,
                        " "))))) : (react_2.default.createElement(core_1.Text, { color: "dimmed" }, " None ")),
                react_2.default.createElement(core_1.Group, { mt: "xs" },
                    react_2.default.createElement(icons_1.IconSubtask, { color: "gray" }),
                    react_2.default.createElement(core_1.Text, { color: "white", size: "md", weight: 800 },
                        " ",
                        "Extends",
                        " ")),
                atomSource.isChildOf.length > 0 ? (atomSource.isChildOf.map((relation) => (react_2.default.createElement(core_1.Group, null,
                    react_2.default.createElement(core_1.Text, { ml: "sm", color: "white", weight: 600 },
                        " ",
                        relation.parentLabel))))) : (react_2.default.createElement(core_1.Text, { color: "dimmed" }, " None ")),
                react_2.default.createElement(core_1.Group, { position: "right" },
                    react_2.default.createElement(core_1.ActionIcon, { onClick: editAtom },
                        react_2.default.createElement(icons_1.IconEdit, null))))) : (react_2.default.createElement(react_2.default.Fragment, null)))));
}
exports.AtomSourceItem = AtomSourceItem;
