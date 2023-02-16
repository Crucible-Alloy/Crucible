"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atom = void 0;
const react_1 = require("react");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const AtomContents_1 = require("./AtomContents");
const core_1 = require("@mantine/core");
const { v4: uuidv4 } = require("uuid");
const { CONNECTION } = require("../../../utils/constants");
function getAtomStyles(
  contentsBeingDragged,
  theme,
  shape,
  isDragging,
  left,
  top,
  color
) {
  const transform = `translate3d(${left}px, ${top}px, 0)`;
  // If we are being dragged via the AtomContents module, leave the positioning to the drag layer.
  if (!contentsBeingDragged) {
    return {
      position: "absolute",
      transform,
      WebkitTransform: transform,
      backgroundColor: color,
      borderRadius: "8px",
      border: `solid 20px ${isDragging ? theme.colors.green[5] : color}`,
    };
  } else {
    return {
      position: "absolute",
      backgroundColor: color,
      borderRadius: "8px",
      border: `solid 20px ${
        isDragging ? theme.colors.green[5] : theme.colors.dark[5]
      }`,
    };
  }
}
function Atom({ contentsBeingDragged, atom, projectID }) {
  const renderType = CONNECTION;
  const theme = (0, core_1.useMantineTheme)();
  const [atomColor, setColor] = (0, react_1.useState)(atom.srcAtom.color);
  const [metaData, setMetaData] = (0, react_1.useState)(atom.srcAtom);
  (0, react_1.useEffect)(() => {
    window.electronAPI.listenForMetaDataChange((_event, value) => {
      window.electronAPI.getAtom(atom.srcID).then((atom) => {
        setMetaData(atom);
      });
    });
  }, []);
  // TODO: Check if any accept types are not at their multiplicity, set canDrag accordingly.
  (0, react_1.useEffect)(() => {
    preview((0, react_dnd_html5_backend_1.getEmptyImage)(), {
      captureDraggingState: true,
    });
  }, []);
  (0, react_1.useEffect)(() => {
    window.electronAPI.listenForColorChange((_event, value) => {
      window.electronAPI
        .getAtomColor(projectKey, sourceAtomKey)
        .then((color) => {
          setColor(color);
        });
    });
  }, []);
  const [{ isDragging }, drag, preview] = (0, react_dnd_1.useDrag)(
    () => ({
      type: atomLabel,
      item: {
        id,
        renderType,
        atomLabel,
        sourceAtomKey,
        nickname,
        top,
        left,
        metaData,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, atomLabel, sourceAtomKey, nickname, top, left, metaData]
  );
  return isDragging
    ? React.createElement(
        core_1.Container,
        {
          ref: drag,
          id: id,
          style: getAtomStyles(
            contentsBeingDragged,
            theme,
            atomShape,
            isDragging,
            left,
            top,
            atomColor
          ),
          shadow: "md",
        },
        React.createElement(AtomContents_1.AtomContents, {
          id: id,
          sourceAtomKey: sourceAtomKey,
          projectKey: projectKey,
          testKey: testKey,
          left: left,
          top: top,
        })
      )
    : React.createElement(
        core_1.Container,
        {
          ref: drag,
          id: id,
          style: getAtomStyles(
            contentsBeingDragged,
            theme,
            atomShape,
            isDragging,
            left,
            top,
            atomColor
          ),
          shadow: "md",
        },
        React.createElement(AtomContents_1.AtomContents, {
          id: id,
          left: left,
          top: top,
          sourceAtomKey: sourceAtomKey,
          projectKey: projectKey,
          testKey: testKey,
        })
      );
}
exports.Atom = Atom;
