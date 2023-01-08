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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSelect = void 0;
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const NewProjectModal_1 = __importDefault(require("./NewProjectModal"));
const ProjectListItem_1 = __importDefault(require("./ProjectListItem"));
const ProjectSelect = () => {
    const theme = (0, core_1.useMantineTheme)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [opened, setOpened] = (0, react_1.useState)(false);
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [modalOpened, setModalOpened] = (0, react_1.useState)(false);
    // Load projects from sqlite db
    // TODO: Dynamically reload after project deletion
    (0, react_1.useEffect)(() => {
        const loadProjects = () => __awaiter(void 0, void 0, void 0, function* () {
            window.electronAPI.getProjects().then((projects) => {
                setProjects(projects);
            });
        });
        loadProjects().then(() => setLoading(false));
    }, []);
    if (loading) {
        return (react_1.default.createElement(core_1.Center, { style: { height: 400 } },
            react_1.default.createElement(core_1.Loader, null)));
    }
    else {
        if (projects) {
            return (react_1.default.createElement(core_1.AppShell, { styles: {
                    main: {
                        background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                    },
                }, navbarOffsetBreakpoint: "sm", asideOffsetBreakpoint: "sm", navbar: react_1.default.createElement(core_1.Navbar, { p: "md", hiddenBreakpoint: "sm", hidden: !opened, width: { sm: 200, lg: 300 } },
                    react_1.default.createElement(core_1.Stack, null,
                        react_1.default.createElement(core_1.Text, { weight: 600, color: "blue" }, " Projects "))), footer: react_1.default.createElement(core_1.Footer, { height: 60, p: "md" },
                    react_1.default.createElement(core_1.Group, { position: "apart" },
                        react_1.default.createElement(core_1.ActionIcon, null,
                            react_1.default.createElement(icons_1.IconSettings, null)),
                        react_1.default.createElement(core_1.Button, { onClick: () => setModalOpened(true) }, "New Project"))), header: react_1.default.createElement(core_1.Header, { height: 70, p: "md" },
                    react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', height: '100%' } },
                        react_1.default.createElement(core_1.MediaQuery, { largerThan: "sm", styles: { display: 'none' } },
                            react_1.default.createElement(core_1.Burger, { opened: opened, onClick: () => setOpened((o) => !o), size: "sm", color: theme.colors.gray[6], mr: "xl" })),
                        react_1.default.createElement(core_1.Title, null, "ASketch"))) },
                react_1.default.createElement(core_1.ScrollArea, null,
                    react_1.default.createElement(core_1.Stack, { mr: 'xl' }, projects.map((project) => (react_1.default.createElement(ProjectListItem_1.default, { project: project, key: project.id }))))),
                react_1.default.createElement(NewProjectModal_1.default, { setModalOpened: setModalOpened, opened: modalOpened })));
        }
        else {
            return (react_1.default.createElement(core_1.AppShell, { styles: {
                    main: {
                        background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                    },
                }, navbarOffsetBreakpoint: "sm", asideOffsetBreakpoint: "sm", navbar: react_1.default.createElement(core_1.Navbar, { p: "md", hiddenBreakpoint: "sm", hidden: !opened, width: { sm: 200, lg: 300 } },
                    react_1.default.createElement(core_1.Stack, null,
                        react_1.default.createElement(core_1.Text, { weight: 600, color: "blue" }, " Projects "))), footer: react_1.default.createElement(core_1.Footer, { height: 60, p: "md" },
                    react_1.default.createElement(core_1.Group, { position: "apart" },
                        react_1.default.createElement(core_1.ActionIcon, null,
                            react_1.default.createElement(icons_1.IconSettings, null)))), header: react_1.default.createElement(core_1.Header, { height: 70, p: "md" },
                    react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', height: '100%' } },
                        react_1.default.createElement(core_1.MediaQuery, { largerThan: "sm", styles: { display: 'none' } },
                            react_1.default.createElement(core_1.Burger, { opened: opened, onClick: () => setOpened((o) => !o), size: "sm", color: theme.colors.gray[6], mr: "xl" })),
                        react_1.default.createElement(core_1.Title, null, "ASketch"))) },
                react_1.default.createElement(core_1.ScrollArea, { m: "xl", p: "xl" },
                    react_1.default.createElement(core_1.Center, { m: "xl" },
                        react_1.default.createElement(core_1.Title, { size: "lg", color: "dimmed" }, " Looks like you don't have any projects yet...")),
                    react_1.default.createElement(core_1.Center, null,
                        react_1.default.createElement(core_1.Button, { onClick: () => setModalOpened(true) }, "Create a Project"))),
                react_1.default.createElement(NewProjectModal_1.default, { setModalOpened: setModalOpened, opened: modalOpened })));
        }
    }
};
exports.ProjectSelect = ProjectSelect;
exports.default = exports.ProjectSelect;
