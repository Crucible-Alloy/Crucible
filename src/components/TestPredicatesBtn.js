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
Object.defineProperty(exports, "__esModule", { value: true });
const icons_1 = require("@tabler/icons");
const core_1 = require("@mantine/core");
const react_1 = __importStar(require("react"));
const Predicate_1 = require("./Predicate/Predicate");
function TestPredicatesBtn({ projectID, testID }) {
    const [opened, setOpened] = (0, react_1.useState)(false);
    const [predicates, setPredicates] = (0, react_1.useState)([]);
    const [atoms, setAtoms] = (0, react_1.useState)([]);
    function fetchAndSetPredicates(testID) {
        return __awaiter(this, void 0, void 0, function* () {
            const predicates = yield window.electronAPI.getPredicates(testID);
            setPredicates(predicates);
        });
    }
    function fetchAndSetAtoms(testID) {
        return __awaiter(this, void 0, void 0, function* () {
            const test = yield window.electronAPI.readTest(testID);
            setAtoms(test.atoms);
        });
    }
    (0, react_1.useEffect)(() => {
        // Initialize State
        fetchAndSetAtoms(testID).catch();
        fetchAndSetPredicates(testID).catch();
        // Bind listeners for database updates.
        window.electronAPI.listenForPredicatesChange((_event, value) => {
            console.log("Predicates Change");
            fetchAndSetPredicates(testID).catch();
        });
        window.electronAPI.listenForCanvasChange((_event, value) => {
            fetchAndSetAtoms(testID).catch();
        });
    }, [testID]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(core_1.Modal, { opened: opened, onClose: () => setOpened(false), title: react_1.default.createElement(core_1.Title, { size: "md" }, "Predicates") },
            react_1.default.createElement(core_1.Text, { size: "xs", color: "dimmed" }, "For each predicate, select a state and parameters."),
            react_1.default.createElement("br", null),
            Object.entries(predicates).map(([key, value]) => (react_1.default.createElement(Predicate_1.Predicate, { key: key, predicate: value, atoms: atoms })))),
        react_1.default.createElement(core_1.Tooltip, { label: "Predicates", position: "bottom" },
            react_1.default.createElement(core_1.ActionIcon, { color: "violet", variant: "light", size: "lg", onClick: () => setOpened(true), style: { zIndex: 1 } },
                react_1.default.createElement(icons_1.IconFunction, null)))));
}
exports.default = TestPredicatesBtn;
