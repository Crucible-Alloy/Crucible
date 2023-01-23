"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const form_1 = require("@mantine/form");
function NewTestModal({ opened, setModalOpened, setTests, tests, projectID, }) {
    const form = (0, form_1.useForm)({
        initialValues: {
            testName: "",
        },
    });
    function createNewTest(testName) {
        console.log("Create new test");
        window.electronAPI
            .createNewTest({ projectID, testName })
            .then((resp) => {
            console.log(resp);
            if (resp.error) {
                resp.error.forEach((error) => {
                    console.log(error);
                    form.setFieldError(error.path[0], error.message);
                });
            }
            else {
                console.log("Test created!");
                window.electronAPI.getTests(projectID).then((newTests) => {
                    setTests(newTests);
                    setModalOpened(false);
                    form.reset();
                });
            }
        });
    }
    return (react_1.default.createElement(core_1.Modal, { opened: opened, onClose: () => setModalOpened(false), title: "Create a New Test" },
        react_1.default.createElement("form", { onSubmit: form.onSubmit((values) => createNewTest(values.testName)) },
            react_1.default.createElement(core_1.TextInput, Object.assign({ required: true, placeholder: "New Test", label: "Test Name", description: "Enter a name for the new test", icon: react_1.default.createElement(icons_1.IconTag, null) }, form.getInputProps("testName"))),
            react_1.default.createElement("br", null),
            react_1.default.createElement(core_1.Button, { m: "sm", type: "submit" }, "Create Test"))));
}
exports.default = NewTestModal;
