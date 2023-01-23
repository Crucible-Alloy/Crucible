"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mantine/core");
const react_1 = require("react");
const react_2 = require("react");
const react_3 = __importDefault(require("react"));
const NewTestModal_1 = __importDefault(require("./NewTestModal"));
const TestListItem_1 = __importDefault(require("./TestListItem"));
const { SIDEBAR_WIDTH } = require("../../../utils/constants");
function TestsSidebarTab({ projectID }) {
    const [tests, setTests] = (0, react_1.useState)([]);
    const [modalOpened, setModalOpened] = (0, react_1.useState)(false);
    // Initialize Tests
    (0, react_2.useEffect)(() => {
        console.log("get tests");
        window.electronAPI.getTests(projectID).then((tests) => {
            setTests(tests);
        });
    }, []);
    // TODO: Determine type of testObj
    function handleRowClick(testID, testObj) {
        let newTab = testObj;
        newTab.testKey = testID;
        // If there isn't a tab with a matching name, add the tab.
        window.electronAPI.openTab(projectID, newTab);
    }
    return (react_3.default.createElement(core_1.Container, { style: { height: "100vh" } },
        tests.length > 0 ? (react_3.default.createElement(core_1.Stack, { sx: { height: "100vh" } },
            react_3.default.createElement(core_1.ScrollArea, { offsetScrollbars: true }, Object.entries(tests).map(([key, value]) => (react_3.default.createElement(react_3.default.Fragment, null,
                react_3.default.createElement(core_1.Container, { p: "xs", styles: (theme) => ({
                        root: {
                            borderRadius: 8,
                            width: SIDEBAR_WIDTH - 50,
                            "&:hover": {
                                backgroundColor: theme.colors.gray[1],
                            },
                        },
                    }) },
                    react_3.default.createElement(TestListItem_1.default, { test: value, testID: value.id, handleRowClick: handleRowClick })))))),
            react_3.default.createElement(core_1.Button, { sx: { position: "absolute", bottom: 16 }, onClick: () => setModalOpened((o) => !o) }, "New Test"))) : (react_3.default.createElement(core_1.Center, { sx: { height: "60vh" } },
            react_3.default.createElement(core_1.Stack, null,
                react_3.default.createElement(core_1.Title, { order: 4, color: "dimmed", align: "center" }, "You don't have any tests!")),
            react_3.default.createElement(core_1.Button, { sx: { position: "fixed", bottom: 0 }, onClick: () => setModalOpened((o) => !o) }, "New Test"))),
        react_3.default.createElement(NewTestModal_1.default, { projectID: projectID, opened: modalOpened, tests: tests, setTests: setTests, setModalOpened: setModalOpened })));
}
exports.default = TestsSidebarTab;
