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
exports.Canvas = void 0;
const react_1 = __importStar(require("react"));
const react_dnd_1 = require("react-dnd");
const react_xarrows_1 = __importDefault(require("react-xarrows"));
const notifications_1 = require("@mantine/notifications");
const icons_1 = require("@tabler/icons");
const hooks_1 = require("@mantine/hooks");
const core_1 = require("@mantine/core");
//@ts-ignore
const Atom_js_1 = require("../components/Atom/Atom.js");
const { ATOM, ATOM_SOURCE } = require("../utils/constants.js");
const Canvas = ({ projectID, testID }) => {
    const [canvasItems, setCanvas] = (0, react_1.useState)();
    const [atomMenu, setAtomMenu] = (0, react_1.useState)(false);
    const [coords, setCoords] = (0, react_1.useState)({ clickX: null, clickY: null });
    const [atoms, setAtoms] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [quickInsertData, setQuickInsertData] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        return () => {
            window.electronAPI.getAtoms(projectID).then((atoms) => {
                setAtoms(atoms);
            }, []);
        };
    }, []);
    (0, react_1.useEffect)(() => {
        window.electronAPI.listenForCanvasChange((_event, value) => {
            console.log("got canvas update");
            window.electronAPI.readTest({ testID }).then((data) => {
                setCanvas(data);
            });
        });
    }, []);
    (0, react_1.useEffect)(() => {
        const loadCanvas = () => __awaiter(void 0, void 0, void 0, function* () {
            window.electronAPI.readTest({ testID }).then((data) => {
                setCanvas(data);
            });
        });
        loadCanvas().then(() => setLoading(false));
    }, []);
    // useDidUpdate(() => {
    //   setQuickInsertData(
    //     atoms.map( (atom) => ({
    //       label: value["label"],
    //       value: key,
    //     }))
    //   );
    // }, [atoms]);
    const ref = (0, hooks_1.useClickOutside)(() => setCoords({ clickX: null, clickY: null }));
    const validCoords = coords.clickX !== null && coords.clickY !== null;
    function initializeCanvas() { }
    const addNewAtom = (left, top, projectID, testID, sourceAtomID, atomLabel) => {
        window.electronAPI
            .testCanAddAtom({ testID, sourceAtomID })
            .then((resp) => {
            if (resp.success) {
                window.electronAPI.testAddAtom({ testID, sourceAtomID });
            }
            else {
                (0, notifications_1.showNotification)({
                    title: "Cannot add Atom",
                    message: `Adding that atom would exceed it's multiplicity.`,
                    color: "red",
                    icon: react_1.default.createElement(icons_1.IconAlertTriangle, null),
                });
            }
        });
    };
    const updateAtom = (id, left, top, sourceAtomID, atomLabel, nickname) => {
        window.electronAPI.createAtom(projectID, testID, id, {
            top: top,
            left: left,
            sourceAtomKey: sourceAtomID,
            atomLabel: atomLabel,
            nickname: nickname,
        });
    };
    function quickInsert(selectedAtom, coords) {
        //   window.electronAPI
        //     .getAtomInstance(projectKey, selectedAtom)
        //     .then((atom) => {
        //       console.log(coords);
        //       //let canvasRect = this.getBoundingClientRect();
        //       // TODO: Translate to coordinates in canvas.
        //       addNewAtom(
        //         coords.clickX,
        //         coords.clickY,
        //         projectKey,
        //         testKey,
        //         selectedAtom,
        //         atom.label
        //       );
        //     });
    }
    const [, drop] = (0, react_dnd_1.useDrop)(() => ({
        accept: [ATOM, ATOM_SOURCE],
        drop(item, monitor) {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (delta) {
                let left = Math.round(item.left + delta.x);
                let top = Math.round(item.top + delta.y);
                console.log(top);
                if (monitor.getItemType() === ATOM) {
                    console.log("Existing atom dragged.");
                    console.log(item.id);
                    updateAtom(item.id, left, top, item.srcID, "atom label", "atom nickname");
                }
                if (monitor.getItemType() === ATOM_SOURCE) {
                    console.log("New atom dragged.");
                    console.log(testID);
                    addNewAtom(left, top, projectID, testID, item.srcID, "atomLabel");
                }
                return undefined;
            }
        },
    }), [updateAtom, addNewAtom]);
    if (canvasItems) {
        return (react_1.default.createElement("div", { ref: drop, className: "canvas", onContextMenu: (e) => {
                e.preventDefault();
                const clickCoords = { clickX: e.pageX, clickY: e.pageY };
                console.log(clickCoords);
                console.log(quickInsertData);
                setCoords(clickCoords);
            } },
            react_1.default.createElement(core_1.Affix, { sx: { display: validCoords ? "initial" : "none" }, position: coords.clickX !== null && coords.clickY !== null
                    ? { left: coords.clickX, top: coords.clickY }
                    : undefined },
                react_1.default.createElement(core_1.Popover, { opened: validCoords, trapFocus: true, width: 400, shadow: "md" },
                    react_1.default.createElement("div", { ref: ref },
                        react_1.default.createElement(core_1.Popover.Target, null,
                            react_1.default.createElement("div", null)),
                        react_1.default.createElement(core_1.Popover.Dropdown, null,
                            react_1.default.createElement(core_1.Title, { size: "xs", color: "dimmed" }, "Quick Insert"),
                            react_1.default.createElement(core_1.Select, { data: quickInsertData, label: "Atoms", placeholder: "Pick one", searchable: true, "data-auto-focus": true, nothingFound: "No options", onChange: (selected) => quickInsert(null, coords) }))))),
            canvasItems.atoms.map((atom) => (react_1.default.createElement(Atom_js_1.Atom, { contentsBeingDragged: false, id: atom.id, projectKey: projectID, testKey: testID, sourceAtomID: atom.srcID, label: "atom", atomColor: "color" }))),
            canvasItems.connections.map((connection) => (react_1.default.createElement(react_xarrows_1.default, { start: JSON.stringify(connection.fromID), end: JSON.stringify(connection.toID) })))));
    }
    else {
        // Loading items
        return react_1.default.createElement("div", { ref: drop, className: "canvas" });
    }
};
exports.Canvas = Canvas;
exports.default = exports.Canvas;
