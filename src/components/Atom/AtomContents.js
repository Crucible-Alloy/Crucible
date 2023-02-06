"use strict";
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
exports.AtomContents = void 0;
const react_1 = require("react");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const constants_1 = require("../../utils/constants");
const core_1 = require("@mantine/core");
const icons_1 = require("@tabler/icons");
const notifications_1 = require("@mantine/notifications");
function AtomContents({ atom }) {
    const [atomData, setAtomData] = (0, react_1.useState)(initializeAtom);
    const [metaData, setMetaData] = (0, react_1.useState)(initializeMetaData);
    const [acceptTypes, setAcceptTypes] = (0, react_1.useState)([]);
    const renderType = constants_1.ATOM;
    const theme = (0, core_1.useMantineTheme)();
    (0, react_1.useEffect)(() => {
        window.electronAPI.listenForMetaDataChange((_event) => {
            window.electronAPI.getAtom(projectKey, sourceAtomKey).then((atom) => {
                setMetaData(atom);
            });
        });
    }, []);
    (0, react_1.useEffect)(() => {
        window.electronAPI
            .getAcceptTypes(projectKey, sourceAtomKey)
            .then((types) => {
            setAcceptTypes(types);
        });
    }, []);
    (0, react_1.useEffect)(() => {
        preview((0, react_dnd_html5_backend_1.getEmptyImage)(), { captureDraggingState: true });
    }, []);
    const [{ isDragging }, drag, preview] = (0, react_dnd_1.useDrag)(() => ({
        type: constants_1.ATOM,
        item: {
            renderType,
            atom,
            metaData,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [renderType, atom, metaData]);
    const [{ isOver, canDrop }, drop] = (0, react_dnd_1.useDrop)(() => ({
        accept: acceptTypes,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        drop(item, monitor) {
            const delta = monitor.getDifferenceFromInitialOffset();
            console.log("AttemptedDrop");
            if (item.renderType === constants_1.CONNECTION) {
                console.log("Attempted connection");
                addNewConnection(item.id, atom.id);
            }
            return undefined;
        },
    }), [createConnection, atomData, metaData]);
    function createConnection(fromAtom, toAtom, fromAtomLabel, toAtomLabel, fromNickname, toNickname, connectionLabel) {
        window.electronAPI.makeConnection(projectKey, testKey, fromAtom, toAtom, fromAtomLabel, toAtomLabel, fromNickname, toNickname, connectionLabel);
    }
    function addNewConnection(fromAtomKey, toAtomKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let toAtom, fromAtom;
            let eligibleToAdd = true;
            let targetLabels = [];
            /* Get atom data and metadata. */
            function getAtom(atomKey) {
                return new Promise((resolve) => {
                    window.electronAPI
                        .getAtomInstance(projectKey, testKey, atomKey)
                        .then((atomInstance) => {
                        window.electronAPI
                            .getAtom(projectKey, atomInstance["sourceAtomKey"])
                            .then((atomMetaData) => {
                            resolve({ data: atomInstance, metaData: atomMetaData });
                        });
                    });
                });
            }
            /* Get the toAtom and fromAtom data. */
            function getAtoms(fromAtomKey, toAtomKey, callback) {
                getAtom(toAtomKey).then((atom) => {
                    toAtom = atom;
                    getAtom(fromAtomKey).then((atom) => {
                        fromAtom = atom;
                        callback(fromAtom, toAtom);
                    });
                });
            }
            /* Check for multiplicity violations.*/
            function findMatches(fromAtom, toAtom) {
                // Get relations of originating atom
                window.electronAPI
                    .getRelations(projectKey, fromAtom.data.sourceAtomKey)
                    .then((relations) => {
                    // Get connections of the originating atom
                    window.electronAPI
                        .getConnections(projectKey, testKey, fromAtomKey)
                        .then((connections) => {
                        // Get the labels of the receiving atom and it's parents.
                        targetLabels = [
                            toAtom.metaData.label,
                            ...toAtom.metaData.parents,
                        ];
                        // Filter the originating atom's relations by the two Atom' labels.
                        let matchingRelations = relations.filter((relation) => targetLabels.includes(relation.toLabel) &&
                            relation.fromLabel === fromAtom.metaData.label);
                        // Make sure we only have one matching relation signature, or else way might have issues...
                        if (matchingRelations.length > 1) {
                            console.log(`More than one relation with the signature ${fromAtom.metaData.label}->${toAtom.metaData.label}`);
                            return;
                        }
                        // Check that the multiplicity of the matching relation is lone or one (otherwise we don't care).
                        if (["lone", "one"].includes(matchingRelations[0].multiplicity)) {
                            // Get the number of matching connections.
                            console.log(matchingRelations[0].multiplicity);
                            console.log(matchingRelations[0].connectionLabel);
                            let numberOfConnections = connections.filter((connection) => connection.connectionLabel === matchingRelations[0].label).length;
                            if (numberOfConnections > 0) {
                                eligibleToAdd = false;
                            }
                        }
                        if (eligibleToAdd) {
                            createConnection(fromAtomKey, toAtomKey, fromAtom.metaData.label, toAtom.metaData.label, fromAtom.data.nickname, toAtom.data.nickname, matchingRelations[0].label);
                        }
                        else {
                            (0, notifications_1.showNotification)({
                                title: "Cannot add connection",
                                message: `Adding that connection would exceed it's ${matchingRelations[0].multiplicity} multiplicity.`,
                                color: "red",
                                icon: React.createElement(icons_1.IconAlertTriangle, null),
                            });
                        }
                    });
                });
            }
            getAtoms(fromAtomKey, toAtomKey, findMatches);
        });
    }
    function getAtomStyles(theme, shape, left, top) {
        // const transform = `translate3d(${left}px, ${top}px, 0)`
        return {
            position: "relative",
            // IE fallback: hide the real node using CSS when dragging
            // because IE will ignore our custom "empty image" drag preview.
            opacity: isDragging ? 0 : 1,
            backgroundColor: canDrop ? theme.colors.dark[3] : theme.colors.dark[5],
            margin: "auto",
        };
    }
    function initializeAtom() {
        window.electronAPI.getAtomInstance(projectKey, testKey, id).then((atom) => {
            setAtomData(atom);
        });
    }
    function initializeMetaData() {
        window.electronAPI.getAtom(projectKey, sourceAtomKey).then((atom) => {
            setMetaData(atom);
        });
    }
    function deleteAtom(id) {
        window.electronAPI.deleteAtom(projectKey, testKey, id);
    }
    function deleteConnections(id) {
        window.electronAPI.deleteConnections(projectKey, testKey, id);
    }
    return metaData && atomData ? (React.createElement(core_1.Paper, { ref: drag, p: "md", radius: "md", role: "DraggableBox", style: getAtomStyles(theme, metaData.shape, left, top) },
        React.createElement(core_1.Text, { ref: drop, p: "xl", size: "xl", color: metaData.color, weight: 800, align: "center" },
            " ",
            atomData.nickname,
            " "))) : (React.createElement(core_1.Paper, { ref: drag, p: "md", radius: "md", role: "DraggableBox", stye: { opacity: isDragging ? 0 : 1 } },
        React.createElement(core_1.Text, { ref: drop, size: "xl", weight: 800 },
            " ",
            " ")));
}
exports.AtomContents = AtomContents;
