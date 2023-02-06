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
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const react_1 = __importStar(require("react"));
const TabContent_1 = __importDefault(require("./TabContent"));
function BodyWrapper({ projectID, mousePos }) {
    const [tabs, setTabs] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)(null);
    // Initialize tabs
    (0, react_1.useEffect)(() => {
        loadTabs().then(() => loadActiveTab().then(() => console.log("Init tabs and active tab")));
    }, []);
    // Listen for updates to tabs
    (0, react_1.useEffect)(() => {
        window.electronAPI.listenForTabsChange((_event, value) => {
            console.log("got tabs update");
            loadTabs().then(() => loadActiveTab().then(() => console.log("Update tabs and active tab")));
        });
    }, []);
    const loadTabs = () => __awaiter(this, void 0, void 0, function* () {
        window.electronAPI.getTests(projectID).then((tests) => {
            let openTests = tests.filter((test) => test.tabIsOpen);
            setTabs(openTests);
        });
    });
    const loadActiveTab = () => __awaiter(this, void 0, void 0, function* () {
        window.electronAPI.getActiveTab(projectID).then((activeTab) => {
            if (activeTab) {
                setActiveTab(activeTab);
            }
            else {
                setActiveTab(tabs[0].name);
            }
        });
    });
    function updateActiveTab(testName) {
        window.electronAPI.setActiveTab({ projectID, testName });
    }
    function closeTab(testID) {
        window.electronAPI.closeTab({ projectID, testID });
    }
    if (tabs) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(core_1.Tabs, { value: activeTab, onTabChange: (value) => updateActiveTab(value), keepMounted: false, radius: "md", sx: {
                    display: "flex",
                    flexDirection: "column",
                    // TODO: Add "Open a test to get started image here"
                    position: "relative",
                    width: "100%",
                    height: "100%",
                } },
                react_1.default.createElement(core_1.Tabs.List, { sx: (theme) => ({
                        backgroundColor: theme.colors.gray[2],
                        boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.15)",
                        zIndex: 1,
                        height: 40,
                    }) }, tabs.map((tab) => (react_1.default.createElement(core_1.Tabs.Tab, { key: tab.id, value: tab.name, icon: react_1.default.createElement(icons_1.IconChartDots3, { size: 16 }), sx: (theme) => ({
                        backgroundColor: activeTab === tab.name ? "white" : theme.colors.gray[2],
                        height: "100%",
                        borderRadius: activeTab === tab.name ? "2px 8px 0 0" : "0 0 0 0",
                    }) }, react_1.default.createElement(core_1.Group, { position: "apart" },
                    react_1.default.createElement(core_1.Text, null, tab.name),
                    " ",
                    react_1.default.createElement(core_1.CloseButton, { onClick: () => closeTab(tab.id) })))))),
                tabs.map((test) => (react_1.default.createElement(core_1.Tabs.Panel, { key: test.id, value: test.name, sx: (theme) => ({
                        flex: "1",
                        backgroundColor: theme.colors.gray[3],
                        padding: "32px",
                    }) },
                    react_1.default.createElement(TabContent_1.default, { projectID: projectID, test: test, mousePos: mousePos })))))));
    }
    else {
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
}
exports.default = BodyWrapper;
