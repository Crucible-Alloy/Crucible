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
const { ATOM, CONNECTION } = require("../../utils/constants");
function AtomContents({ atom }) {
    const [metaData, setMetaData] = (0, react_1.useState)(atom.srcAtom);
    const [acceptTypes, setAcceptTypes] = (0, react_1.useState)([]);
    const renderType = ATOM;
    const theme = (0, core_1.useMantineTheme)();
    (0, react_1.useEffect)(() => {
        //   window.electronAPI.listenForMetaDataChange((_event: any) => {
        //     window.electronAPI
        //       .getAtomSource(atom.id)
        //       .then((atom: AtomSourceWithRelations) => {
        //         setMetaData(atom);
        //       })
        //       .then(() => {
        //         if (metaData) {
        //           setAcceptTypes(metaData.toRelations.map((entry) => entry.toLabel));
        //         }
        //       });
        //   });
        // window.electronAPI
        //   .getAtomSource(atom.id)
        //   .then((atom: AtomSourceWithRelations) => {
        //     setMetaData(atom);
        //   })
        //   .then(() => {
        //     if (metaData) {
        //       setAcceptTypes(metaData.toRelations.map((entry) => entry.label));
        //     }
        //   });
        preview((0, react_dnd_html5_backend_1.getEmptyImage)(), { captureDraggingState: true });
    }, []);
    const [{ isDragging }, drag, preview] = (0, react_dnd_1.useDrag)(() => ({
        type: ATOM,
        item: {
            renderType,
            data: atom,
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
            if (item.renderType === CONNECTION) {
                if (item.atom.srcAtom.toRelations)
                    addNewConnection({ fromAtom: item.data.id, toAtom: atom });
            }
            return undefined;
        },
    }), [createConnection, atom, metaData]);
    function createConnection(fromID, toID) { }
    function addNewConnection({ fromAtom, toAtom, }) {
        return __awaiter(this, void 0, void 0, function* () {
            window.electronAPI.makeConnection({ fromAtom, toAtom });
            // 1. Get relation with fromAtom.id and toAtom.id
            // 2. Check relation multiplicity
            // 3. If relation multiplicity is lone or one and connections > 1, return error, show notification.
            // 4. Else, add connection.
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
    return metaData && atom ? (react_2.default.createElement(core_1.Paper, { ref: drag, p: "md", radius: "md", role: "DraggableBox", style: getAtomStyles(theme, metaData.shape, atom.left, atom.top) },
        react_2.default.createElement(core_1.Text, { ref: drop, p: "xl", size: "xl", color: metaData.color, weight: 800, align: "center" }, ` ${atom.nickname} `))) : (react_2.default.createElement(core_1.Paper, { ref: drag, p: "md", radius: "md", role: "DraggableBox", style: { opacity: isDragging ? 0 : 1 } },
        react_2.default.createElement(core_1.Text, { ref: drop, size: "xl", weight: 800 },
            " ",
            " ")));
}
exports.AtomContents = AtomContents;
