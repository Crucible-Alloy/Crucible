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
require("./App.css");
const zod_1 = require("zod");
const core_1 = require("@mantine/core");
const SidebarWrapper_1 = __importDefault(require("./components/SideBar/SidebarWrapper"));
const BodyWrapper_1 = __importDefault(require("./components/BodyWrapper"));
const hooks_1 = require("@mantine/hooks");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const react_router_dom_1 = require("react-router-dom");
const notifications_1 = require("@mantine/notifications");
const react_1 = __importStar(require("react"));
const { CustomDragLayer } = require("./components/CustomDragLayer");
function App() {
    const { width, height } = (0, hooks_1.useViewportSize)();
    const { projectID } = (0, react_router_dom_1.useParams)();
    const [mousePos, setMousePos] = (0, react_1.useState)({ x: 0, y: 0 });
    const number = zod_1.z.coerce.number();
    const handleMouseMove = (event) => {
        // 👇 Get mouse position relative to element
        const localX = event.clientX - event.target.offsetLeft;
        const localY = event.clientY - event.target.offsetTop;
        setMousePos({ x: localX, y: localY });
    };
    (0, react_1.useEffect)(() => {
        const handleMouseMove = (event) => {
            setMousePos({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);
    return (react_1.default.createElement("div", { onMouseMove: handleMouseMove },
        react_1.default.createElement(react_dnd_1.DndProvider, { backend: react_dnd_html5_backend_1.HTML5Backend },
            react_1.default.createElement(core_1.MantineProvider, null,
                react_1.default.createElement(notifications_1.NotificationsProvider, null,
                    react_1.default.createElement(core_1.AppShell, { padding: 0, sx: (theme) => ({
                            height: `${height}px`,
                            width: `${width}px`,
                            position: "absolute",
                            backgroundColor: theme.colors.gray[2],
                        }), navbar: react_1.default.createElement(core_1.Navbar, { width: {
                                // When other breakpoints do not match base width is used, defaults to 100%
                                base: 84,
                            }, sx: (theme) => ({
                                backgroundColor: theme.white,
                                height: `${height}px`,
                            }) },
                            " ",
                            react_1.default.createElement(SidebarWrapper_1.default, { projectID: number.parse(projectID) }),
                            " ") },
                        react_1.default.createElement(BodyWrapper_1.default, { projectID: number.parse(projectID), mousePos: mousePos })))),
            react_1.default.createElement(CustomDragLayer, { mousePos: mousePos }))));
}
exports.default = App;
