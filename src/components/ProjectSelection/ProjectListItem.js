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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const DeleteProjectModal_1 = __importDefault(require("./DeleteProjectModal"));
function ProjectListItem({ project }) {
    const [deleteModal, setDeleteModal] = (0, react_1.useState)(false);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(core_1.Grid, { p: "xs", sx: (theme) => ({
                borderRadius: theme.radius.sm,
                "&:hover": {
                    cursor: "pointer",
                    backgroundColor: theme.colors.gray[2],
                },
            }) },
            react_1.default.createElement(core_1.Grid.Col, { span: "auto", onClick: () => {
                    window.electronAPI.openProject(project.id);
                } },
                react_1.default.createElement(core_1.Group, { position: "left", styles: (theme) => ({
                        root: {
                            borderRadius: 8,
                            maxHeight: 60,
                            width: 320,
                            whitespace: "nowrap",
                            textOverflow: "ellipsis",
                            "&:hover": {
                                backgroundColor: theme.colors.gray[2],
                            },
                        },
                    }) },
                    react_1.default.createElement(core_1.Avatar, { size: 30, color: "blue" }, project.name.charAt(0)),
                    react_1.default.createElement(core_1.Text, { p: 0, m: 0 }, project.name))),
            react_1.default.createElement(core_1.Grid.Col, { span: 2 },
                react_1.default.createElement(core_1.Group, { position: "right" },
                    react_1.default.createElement(core_1.ActionIcon, { color: "gray", variant: "subtle", size: 20 },
                        react_1.default.createElement(icons_1.IconSettings, null)),
                    react_1.default.createElement(core_1.ActionIcon, { color: "gray", variant: "subtle", size: 20, onClick: () => {
                            setDeleteModal(true);
                        } },
                        react_1.default.createElement(icons_1.IconTrash, null))))),
        react_1.default.createElement(DeleteProjectModal_1.default, { setModalOpened: setDeleteModal, opened: deleteModal, project: project })));
}
exports.default = ProjectListItem;
