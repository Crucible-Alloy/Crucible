"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mantine/core");
const react_1 = require("react");
const AtomSourceItem_1 = require("../AtomSource/AtomSourceItem");
const react_2 = require("react");
const react_3 = __importDefault(require("react"));
const { SIDEBAR_HEIGHT } = require("../../utils/constants");
function AtomsSidebarTab({ projectID }) {
    const [atoms, setAtoms] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const getAtoms = () => {
        setLoading(true);
        window.electronAPI
            .getAtomSources(projectID)
            .then((atoms) => {
            if (atoms.length > 0) {
                setAtoms(atoms);
                setLoading(false);
            }
        });
    };
    (0, react_2.useEffect)(() => {
        getAtoms();
    }, []);
    if (loading) {
        return (react_3.default.createElement(core_1.Stack, { sx: { marginTop: "40%" } },
            react_3.default.createElement(core_1.Center, null,
                react_3.default.createElement(core_1.Title, { order: 4, color: "dimmed" }, "Loading atoms...")),
            react_3.default.createElement(core_1.Center, null,
                react_3.default.createElement(core_1.Loader, null))));
    }
    else {
        return (react_3.default.createElement(core_1.ScrollArea, { style: { height: SIDEBAR_HEIGHT } },
            react_3.default.createElement(core_1.Group, { p: "lg" }, atoms.map((atom) => atom.isAbstract ? (react_3.default.createElement(react_3.default.Fragment, null)) : (react_3.default.createElement(AtomSourceItem_1.AtomSourceItem, { key: atom.id, atomSource: atom }))))));
    }
}
exports.default = AtomsSidebarTab;
