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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomContents = void 0;
const react_1 = require("react");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const core_1 = require("@mantine/core");
const react_2 = __importDefault(require("react"));
const notifications_1 = require("@mantine/notifications");
const icons_1 = require("@tabler/icons");
const { ATOM, CONNECTION } = require("../../utils/constants");
function AtomContents({ atom }) {
    const [srcData, setSrcData] = (0, react_1.useState)(atom.srcAtom);
    const [acceptTypes, setAcceptTypes] = (0, react_1.useState)([]);
    const renderType = ATOM;
    const theme = (0, core_1.useMantineTheme)();
    (0, react_1.useEffect)(() => {
        let acceptTypesSet = new Set();
        window.electronAPI
            .getRelationsToAtom({
            label: srcData.label,
            projectID: srcData.projectID,
        })
            .then((resp) => {
            console.log(resp);
            resp.forEach((relation) => acceptTypesSet.add(relation.fromLabel));
            if (srcData.isChildOf.length > 0) {
                srcData.isChildOf.forEach((parent) => {
                    window.electronAPI
                        .getRelationsToAtom({
                        label: parent.parentLabel,
                        projectID: srcData.projectID,
                    })
                        .then((resp) => {
                        console.log(resp);
                        resp.forEach((relation) => acceptTypesSet.add(relation.fromLabel));
                        setAcceptTypes([...acceptTypesSet]);
                    });
                });
            }
            else {
                setAcceptTypes([...acceptTypesSet]);
            }
        });
        preview((0, react_dnd_html5_backend_1.getEmptyImage)(), { captureDraggingState: true });
    }, []);
    (0, react_1.useEffect)(() => {
        console.log("Accept Types: ", acceptTypes, atom.nickname);
    }, [acceptTypes]);
    const [{ isDragging }, drag, preview] = (0, react_dnd_1.useDrag)(() => ({
        type: ATOM,
        item: {
            renderType,
            data: atom,
            metaData: srcData,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [renderType, atom, srcData]);
    const [{ isOver, canDrop }, drop] = (0, react_dnd_1.useDrop)(() => ({
        accept: acceptTypes,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        drop(item, monitor) {
            console.log("AttemptedDrop");
            if (item.renderType === CONNECTION) {
                if (item.data.srcAtom)
                    addNewConnection({
                        projectID: item.data.srcAtom.projectID,
                        testID: item.data.testID,
                        fromAtom: item.data,
                        toAtom: atom,
                    });
            }
            return undefined;
        },
    }), [atom, srcData]);
    function addNewConnection({ projectID, testID, fromAtom, toAtom, }) {
        return __awaiter(this, void 0, void 0, function* () {
            window.electronAPI
                .createConnection({
                projectID,
                testID,
                fromAtom,
                toAtom,
            })
                .then((resp) => {
                if (!resp.success) {
                    (0, notifications_1.showNotification)({
                        title: "Cannot add connection",
                        message: `Adding that connection would exceed it's multiplicity.`,
                        color: "red",
                        icon: react_2.default.createElement(icons_1.IconAlertTriangle, null),
                    });
                }
            });
        });
    }
    function getAtomStyles(theme, shape, left, top) {
        // const transform = `translate3d(${left}px, ${top}px, 0)`
        return {
            position: "relative",
            // IE fallback: hide the real node using CSS when dragging
            // because IE will ignore our custom "empty image" drag preview.
            // @ts-ignore
            opacity: isDragging ? 0 : 1,
            // @ts-ignore
            backgroundColor: canDrop ? theme.colors.dark[3] : theme.colors.dark[5],
            margin: "auto",
        };
    }
    return srcData && atom ? (react_2.default.createElement(core_1.Paper, { ref: drag, p: "md", radius: "md", role: "DraggableBox", style: getAtomStyles(theme, srcData.shape, atom.left, atom.top) },
        react_2.default.createElement(core_1.Text, { ref: drop, p: "xl", size: "xl", color: srcData.color, weight: 800, align: "center" }, ` ${atom.nickname} `))) : (react_2.default.createElement(core_1.Paper, { ref: drag, p: "md", radius: "md", role: "DraggableBox", style: { opacity: isDragging ? 0 : 1 } },
        react_2.default.createElement(core_1.Text, { ref: drop, size: "xl", weight: 800 },
            " ",
            " ")));
}
exports.AtomContents = AtomContents;
