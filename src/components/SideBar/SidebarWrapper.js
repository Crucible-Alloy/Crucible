"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
// import AtomsSidebarTab from "./AtomsSidebarTab";
// import SettingsSidebarTab from "./SettingsSidebarTab";
// import TestsSidebarTab from "./TestsSidebarTab";
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
const AtomsSidebarTab_1 = __importDefault(require("./AtomsSidebarTab"));
const TestsSidebarTab_1 = __importDefault(require("./Tests/TestsSidebarTab"));
const SettingsSidebarTab_1 = __importDefault(require("./SettingsSidebarTab"));
function SidebarWrapper({ projectID }) {
    const [active, setActive] = (0, react_1.useState)(null);
    const [drawerOpen, setDrawerOpen] = (0, react_1.useState)(false);
    const ref = (0, react_1.useRef)(null);
    const data = [
        {
            icon: icons_1.IconAtom,
            label: "atoms",
            drawerContent: react_2.default.createElement(AtomsSidebarTab_1.default, { projectID: projectID }),
        },
        {
            icon: icons_1.IconTestPipe,
            label: "tests",
            drawerContent: react_2.default.createElement(TestsSidebarTab_1.default, { projectID: projectID }),
        },
        {
            icon: icons_1.IconAdjustmentsHorizontal,
            label: "settings",
            drawerContent: react_2.default.createElement(SettingsSidebarTab_1.default, { projectID: projectID }),
        },
    ];
    function handleClick(index) {
        if (index !== active) {
            setActive(index);
            setDrawerOpen(true);
        }
        else {
            setActive(null);
            setDrawerOpen(!drawerOpen);
        }
    }
    const items = data.map((item, index) => (react_2.default.createElement(core_1.Center, { sx: (theme) => ({ width: "100%" }) },
        react_2.default.createElement(core_1.ActionIcon, { key: item.label, size: "xl", radius: "lg", variant: index === active ? "light" : "subtle", color: index === active ? "blue" : "gray", sx: (theme) => ({
                "&:hover": {
                    backgroundColor: theme.colors.blue[0],
                    color: theme.colors.blue[6],
                },
            }), onClick: () => handleClick(index) },
            react_2.default.createElement(item.icon, { size: 34 })))));
    // return (
    //   <Tabs
    //     color="blue"
    //     p={"none"}
    //     m={"sm"}
    //     defaultValue={"atoms"}
    //     variant={"pills"}
    //     radius={"xl"}
    //     orientation={"vertical"}
    //   >
    //     <Tabs.List>
    //       <Tabs.Tab value="atoms" icon={<IconAtom size={34} />}></Tabs.Tab>
    //       <Tabs.Tab value="tests" icon={<IconTestPipe size={34} />}></Tabs.Tab>
    //       <Tabs.Tab
    //         value="settings"
    //         icon={<IconAdjustmentsHorizontal size={34} />}
    //       ></Tabs.Tab>
    //     </Tabs.List>
    //
    //     <Tabs.Panel value={"atoms"}>
    //       <AtomsSidebarTab projectID={projectID} />
    //     </Tabs.Panel>
    //
    //     <Tabs.Panel value={"tests"}>
    //       <TestsSidebarTab projectID={projectID} />
    //     </Tabs.Panel>
    //
    //     <Tabs.Panel value={"settings"}>
    //       <SettingsSidebarTab projectID={projectID} />
    //     </Tabs.Panel>
    //   </Tabs>
    // );
    return (react_2.default.createElement(react_2.default.Fragment, null,
        react_2.default.createElement(core_1.Stack, { id: "sidebar", py: "sm", sx: (theme) => ({
                zIndex: 4,
                backgroundColor: theme.white,
                height: "100%",
            }) }, items),
        react_2.default.createElement(core_1.Drawer, { zIndex: 2, opened: drawerOpen, withOverlay: false, size: 400, onClose: () => setDrawerOpen(false) },
            react_2.default.createElement(core_1.Box, { sx: (theme) => ({
                    paddingLeft: "100px",
                    paddingRight: theme.spacing.sm,
                }) }, active !== null ? data[active].drawerContent : ""))));
}
exports.default = SidebarWrapper;
