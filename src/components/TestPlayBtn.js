"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const icons_1 = require("@tabler/icons");
const core_1 = require("@mantine/core");
const react_1 = require("react");
const notifications_1 = require("@mantine/notifications");
const react_2 = __importDefault(require("react"));
function TestPlayBtn({ disabled, projectID, testID }) {
    const [running, setRunning] = (0, react_1.useState)(false);
    const runTest = () => {
        setRunning(true);
        window.electronAPI.runTest({ projectID, testID }).then((data) => {
            if (data === "Pass") {
                (0, notifications_1.showNotification)({
                    title: "Passed",
                    message: `The test is satisfiable`,
                    color: "green",
                    icon: react_2.default.createElement(icons_1.IconCheck, null),
                });
                setRunning(false);
            }
            else {
                (0, notifications_1.showNotification)({
                    title: "Failed",
                    message: `The test is unsatisfiable`,
                    color: "red",
                    icon: react_2.default.createElement(icons_1.IconX, null),
                });
                setRunning(false);
            }
        });
    };
    return (react_2.default.createElement(core_1.Tooltip, { label: "Run", position: "bottom" },
        react_2.default.createElement(core_1.ActionIcon, { disabled: disabled, color: "teal", variant: "light", onClick: () => {
                runTest();
            }, loading: running, style: { zIndex: 1 } },
            react_2.default.createElement(icons_1.IconPlayerPlay, { size: 20 }))));
}
exports.default = TestPlayBtn;
