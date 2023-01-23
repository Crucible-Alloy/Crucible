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
const icons_1 = require("@tabler/icons");
function TestListItem({ test, testID, handleRowClick }) {
    const [settingsModal, setSettingsModal] = (0, react_1.useState)(false);
    return (react_1.default.createElement(core_1.Grid, { p: "xs", sx: (theme) => ({
            borderRadius: theme.radius.sm,
            "&:hover": {
                cursor: "pointer",
                backgroundColor: theme.colors.gray[2],
            },
        }) },
        react_1.default.createElement(core_1.Grid.Col, { m: "sx", span: "auto", onClick: () => {
                handleRowClick(test, testID);
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
                react_1.default.createElement(core_1.Text, { p: 0, m: 0, size: "sm" }, test.name))),
        react_1.default.createElement(core_1.Grid.Col, { span: 4, m: "sx" },
            react_1.default.createElement(core_1.Group, { position: "right" },
                react_1.default.createElement(core_1.ActionIcon, { color: "gray", variant: "subtle", size: 16 },
                    react_1.default.createElement(icons_1.IconPlayerPlay, null)),
                react_1.default.createElement(core_1.ActionIcon, { color: "gray", variant: "subtle", size: 16, onClick: () => {
                        setSettingsModal(true);
                    } },
                    react_1.default.createElement(icons_1.IconSettings, null))))));
    /* TODO: Test Settings Modal
              - Rename test
              - Delete test */
    /*<TestSettingsModal />*/
}
// return (
//   <Group onClick={() => handleRowClick(testID, test)} position={"apart"}>
//     <Group>
//       <Text weight={700}>{test["name"]}</Text>
//     </Group>
//     <div>
//       <ActionIcon variant={"filled"}>
//         <IconPlayerPlay />
//       </ActionIcon>
//     </div>
//   </Group>
// );
exports.default = TestListItem;
