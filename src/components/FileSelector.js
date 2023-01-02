"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const react_2 = require("react");
function FileSelector(props) {
    const [trimmedPath, setTrimmedPath] = (0, react_2.useState)("");
    function trimFullPath(filePath) {
        let segments = filePath.split('/');
        let stringCandidate = segments.pop();
        if (stringCandidate) {
            return stringCandidate;
        }
        else {
            return "";
        }
    }
    function handleSelectFile() {
        window.electronAPI.selectFile().then((filePath) => {
            setTrimmedPath(trimFullPath(filePath));
            props.setSelectedFile(filePath);
        });
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(core_1.Input.Wrapper, { required: true, labelElement: "div", label: "Primary Alloy File", description: "Select the Alloy file you wish to test." },
            react_1.default.createElement(core_1.Input, { icon: react_1.default.createElement(icons_1.IconFileSearch, null), onClick: handleSelectFile, value: trimmedPath })),
        react_1.default.createElement("br", null)));
}
exports.default = FileSelector;
