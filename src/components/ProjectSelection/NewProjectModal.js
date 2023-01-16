"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const react_2 = require("react");
const form_1 = require("@mantine/form");
function NewProjectModal({ setModalOpened, opened }) {
    const form = (0, form_1.useForm)({
        initialValues: {
            projectName: "",
            projectPath: "",
            alloyFile: "",
        },
    });
    // Set the default project location in the form
    // TODO: Can this be moved into initial values somehow? I think the issue is that it is async.
    (0, react_2.useEffect)(() => {
        window.electronAPI.getHomeDirectory().then((homedir) => {
            form.setFieldValue("projectPath", `${homedir}/aSketchProjects/`);
        });
    }, [opened]);
    /* Asynchronously check for validation errors and if none, create the project on ipcMain */
    function createProject(data) {
        window.electronAPI
            .createNewProject(data)
            .then((resp) => {
            if (resp.error) {
                resp.error.forEach((error) => {
                    form.setFieldError(error.path[0], error.message);
                });
            }
            else if (resp.projectID) {
                window.electronAPI.openProject(resp.projectID);
            }
        });
    }
    /* Close the modal and reset the form to default values. */
    function closeModal() {
        setModalOpened(false);
        form.reset();
    }
    /* Calls ipcMain to select a file. File selection must be done on main in order to get full path. */
    function selectAlloyFile() {
        window.electronAPI.selectFile().then((fileName) => {
            form.setFieldValue("alloyFile", fileName);
        });
    }
    return (react_1.default.createElement(core_1.Modal, { opened: opened, onClose: () => closeModal(), title: "Create a New Project" },
        react_1.default.createElement("form", { onSubmit: form.onSubmit((values) => createProject(values)) },
            react_1.default.createElement(core_1.Stack, null,
                react_1.default.createElement(core_1.TextInput, Object.assign({ required: true, withAsterisk: true, placeholder: "New Project", label: "Project Name", description: "The name of your project.", icon: react_1.default.createElement(icons_1.IconTag, null) }, form.getInputProps("projectName"))),
                react_1.default.createElement(core_1.TextInput, Object.assign({ required: true, withAsterisk: true, icon: react_1.default.createElement(icons_1.IconFileSearch, null), placeholder: "Select File", label: "Alloy File", description: "Select the Alloy file you wish to test.", onClick: () => selectAlloyFile() }, form.getInputProps("alloyFile"))),
                react_1.default.createElement(core_1.TextInput, Object.assign({ required: true, withAsterisk: true, icon: react_1.default.createElement(icons_1.IconFolders, null), label: "Project Location", description: "Where the project will be saved." }, form.getInputProps("projectPath"))),
                react_1.default.createElement(core_1.Button, { m: "sm", type: "submit" }, "Create Project")))));
}
exports.default = NewProjectModal;
