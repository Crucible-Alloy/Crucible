"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
function SettingsSidebarTab({ projectID }) {
    const [projectFile, setProjectFile] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        window.electronAPI.getProjectFile(projectID).then((filePath) => {
            setProjectFile(trimFullPath(filePath));
        });
    }, []);
    function trimFullPath(filePath) {
        let segments = filePath.split("/");
        console.log(segments[-1]);
        return segments.pop();
    }
    function handleSelectFile() {
        window.electronAPI.updateProjectFile(projectID).then((filePath) => {
            console.log(filePath);
            setProjectFile(trimFullPath(filePath));
        });
    }
    return (react_2.default.createElement(core_1.Group, { p: "sm" },
        react_2.default.createElement(core_1.Input.Wrapper, { labelElement: "div", label: "Project File", description: "Select the Alloy file you wish to test" },
            react_2.default.createElement(core_1.Input, { icon: react_2.default.createElement(icons_1.IconFileSearch, null), onClick: () => handleSelectFile, value: projectFile }))));
}
exports.default = SettingsSidebarTab;
