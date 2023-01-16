"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const react_2 = require("react");
function NewTestModal({ opened, setModalOpened, setTests, tests, projectID, }) {
    const [testName, setTestName] = (0, react_2.useState)("");
    function createNewTest() {
        window.electronAPI.createNewTest(projectID, testName).then(() => {
            window.electronAPI.getTests(projectID).then((newTests) => {
                setTests(newTests);
                setModalOpened(false);
            });
        });
    }
    function updateName(val) {
        //console.log(val)
        setTestName(val);
    }
    return (react_1.default.createElement(core_1.Modal, { opened: opened, onClose: () => setModalOpened(false), title: "Create a New Test" },
        react_1.default.createElement(core_1.TextInput, { required: true, placeholder: "New Test", onChange: (event) => updateName(event.target.value), label: "Test Name", description: "Enter a name for the new test", icon: react_1.default.createElement(icons_1.IconTag, null) }),
        react_1.default.createElement("br", null),
        react_1.default.createElement(core_1.Button, { m: "sm", onClick: () => createNewTest() }, "Create Test")));
}
exports.default = NewTestModal;
