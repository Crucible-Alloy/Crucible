"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const notifications_1 = require("@mantine/notifications");
function DeleteProjectModal({ setModalOpened, opened, project }) {
    const [equiv, setEquiv] = (0, react_1.useState)(false);
    /* Asynchronously delete a project from the database */
    function deleteProject() {
        window.electronAPI.deleteProject(project).then((respProject) => {
            closeModal();
            (0, notifications_1.showNotification)({ title: "Project Deleted", message: `Successfully deleted ${respProject.name}` });
        });
    }
    /* Close the modal and reset the form to default values. */
    function closeModal() {
        setModalOpened(false);
    }
    function checkEquivalency(input) {
        if (input === project.name) {
            setEquiv(true);
        }
        else {
            setEquiv(false);
        }
    }
    return (react_1.default.createElement(core_1.Modal, { opened: opened, onClose: () => closeModal(), title: "Delete Project" },
        react_1.default.createElement(core_1.Title, { mb: 'md', order: 3 }, "Delete this project?"),
        react_1.default.createElement(core_1.Code, null, project ? project.projectPath : "..."),
        react_1.default.createElement(core_1.Text, { size: "sm", my: 'lg' }, "This will delete the project, its tests, and all associated files from your projects directory and the application database. This action cannot be undone. "),
        react_1.default.createElement("br", null),
        react_1.default.createElement(core_1.TextInput, { label: `Type "${project.name}" to delete the project`, onChange: (event) => checkEquivalency(event.target.value) }),
        react_1.default.createElement(core_1.Group, { position: 'right', mt: 'lg' },
            react_1.default.createElement(core_1.Button, { variant: 'outline', color: 'gray', onClick: () => closeModal() }, "Cancel"),
            react_1.default.createElement(core_1.Button, { color: 'red', onClick: () => deleteProject(), disabled: !equiv }, "Delete My Project"))));
}
exports.default = DeleteProjectModal;
