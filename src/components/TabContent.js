"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const Canvas_1 = __importDefault(require("./Canvas"));
const hooks_1 = require("@mantine/hooks");
const TestPredicatesBtn_1 = __importDefault(require("./TestPredicatesBtn"));
const TestPlayBtn = require("./TestPlayBtn.js");
const TestSettingsBtn = require("./TestSettingsBtn.js");
function TabContent({ test, projectID, mousePos }) {
    const { width, height } = (0, hooks_1.useViewportSize)();
    return (react_1.default.createElement(core_1.Box, { sx: (theme) => ({
            position: "relative",
            height: "100%",
            width: "100%",
            overflow: "scroll",
            backgroundColor: theme.colors.gray[0],
            border: "solid 1px gray",
        }) },
        react_1.default.createElement(TestPredicatesBtn_1.default, { projectID: projectID, testID: test.id }),
        react_1.default.createElement(Canvas_1.default, { projectID: projectID, testID: test.id })));
}
exports.default = TabContent;
