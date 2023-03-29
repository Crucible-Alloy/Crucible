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
exports.PredicateState = void 0;
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const react_1 = __importStar(require("react"));
function PredicateState({ predicate }) {
    const [stringState, setStringState] = (0, react_1.useState)(predicate.state === null ? "null" : predicate.state.toString());
    function handleChange(value) {
        let boolVal = null;
        console.log("value: ", value);
        if (value === "true") {
            boolVal = true;
        }
        else if (value === "false") {
            boolVal = false;
        }
        console.log("calling updatePredicateState");
        window.electronAPI.updatePredicateState({
            predicateID: predicate.id,
            state: boolVal,
        });
        setStringState(value);
    }
    return (react_1.default.createElement(core_1.Input.Wrapper, { label: predicate.predicate.name, description: "State", mt: "xs" },
        react_1.default.createElement(core_1.SegmentedControl, { size: "xs", mt: "xs", mb: "sm", value: stringState, onChange: (value) => handleChange(value), data: [
                {
                    label: (react_1.default.createElement(core_1.Center, null,
                        react_1.default.createElement(icons_1.IconEyeOff, { size: 16 }),
                        react_1.default.createElement(core_1.Box, { ml: 10 }, "Don't Test"))),
                    value: "null",
                },
                {
                    label: (react_1.default.createElement(core_1.Center, null,
                        react_1.default.createElement(icons_1.IconEqual, { size: 16 }),
                        react_1.default.createElement(core_1.Box, { ml: 10 }, "Equals"))),
                    value: "true",
                },
                {
                    label: (react_1.default.createElement(core_1.Center, null,
                        react_1.default.createElement(icons_1.IconEqualNot, { size: 16 }),
                        react_1.default.createElement(core_1.Box, { ml: 10 }, "Not Equals"))),
                    value: "false",
                },
            ] })));
}
exports.PredicateState = PredicateState;
