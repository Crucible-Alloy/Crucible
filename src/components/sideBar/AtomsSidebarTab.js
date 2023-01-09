"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mantine/core");
const react_1 = require("react");
const AtomSourceItem_1 = require("../atoms/AtomSourceItem");
const react_2 = require("react");
const constants_1 = require("../../utils/constants");
function AtomsSidebarTab({ projectKey }) {
    const [atoms, setAtoms] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const getAtoms = () => {
        setLoading(true);
        window.electronAPI.getAtomSources(projectKey).then(atoms => {
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
        return (React.createElement(core_1.Stack, { sx: { marginTop: "40%" } },
            React.createElement(core_1.Center, null,
                React.createElement(core_1.Title, { order: 4, color: 'dimmed' }, "Loading atoms...")),
            React.createElement(core_1.Center, null,
                React.createElement(core_1.Loader, null))));
    }
    else {
        return (React.createElement(core_1.ScrollArea, { style: { height: constants_1.SIDEBAR_HEIGHT } },
            React.createElement(core_1.Group, { p: "lg" }, Object.entries(atoms).map(([key, value]) => (value["isAbstract"] ?
                React.createElement(React.Fragment, null) :
                React.createElement(AtomSourceItem_1.AtomSourceItem, { label: value["label"], color: value["color"], sourceAtomKey: key, projectKey: projectKey, atom: value, top: 0, left: 0 }))))));
    }
}
exports.default = AtomsSidebarTab;
