import { useDragLayer } from "react-dnd";
import { ATOM, ATOM_SOURCE, CONNECTION } from "../utils/constants";
import { useMantineTheme } from "@mantine/core";
import { Arrow } from "react-absolute-svg-arrows";
import { AtomInstance } from "./Atom/AtomInstance";
import { AtomSourceItem } from "./AtomSource/AtomSourceItem";

const layerStyles = {
  position: "absolute",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

function getItemStyles(
  item,
  initialSourceOffset,
  initialOffset,
  currentSourceOffset,
  currentOffset,
  delta,
  mousePos
) {
  let { x, y } = currentSourceOffset;
  if (item.renderType === ATOM_SOURCE) {
    const transform = `translate(${x}px, ${y}px)`;
    return {
      transform,
      WebkitTransform: transform,
    };
  }
  if (item.renderType === ATOM) {
    let left = Math.round(delta.x);
    let top = Math.round(delta.y);
    const transform = `translate(
            ${mousePos.x + (initialSourceOffset.x - initialOffset.x) + left}px, 
            ${mousePos.y + (initialSourceOffset.y - initialOffset.y) + top}px
        )`;
    return { transform, WebkitTransform: transform };
  }
}

export const CustomDragLayer = ({ mousePos }) => {
  const theme = useMantineTheme();

  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    initialSourceOffset,
    currentSourceOffset,
    currentOffset,
    delta,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialSourceOffset: monitor.getInitialSourceClientOffset(),
    initialOffset: monitor.getInitialClientOffset(),
    delta: monitor.getDifferenceFromInitialOffset(),
    currentSourceOffset: monitor.getSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const renderItem = () => {
    switch (item.renderType) {
      case ATOM:
        return (
          <AtomInstance
            contentsBeingDragged={true}
            id={item.id}
            left={item.left}
            atomLabel={item.metaData.label}
            top={item.top}
            sourceAtomKey={item.sourceAtomKey}
            projectKey={item.projectKey}
            testKey={item.testKey}
          />
        );

      case ATOM_SOURCE:
        return <AtomSourceItem atomSource={item.atomSource} />;

      case CONNECTION:
        return (
          <Arrow
            startPoint={{ x: mousePos.x, y: mousePos.y }}
            endPoint={{
              x: mousePos.x + delta.x + 16,
              y: mousePos.y + delta.y + 16,
            }}
            config={{ arrowColor: theme.colors.blue[5], strokeWidth: 5 }}
          />
        );
      default:
        return null;
    }
  };

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(
          item,
          initialSourceOffset,
          initialOffset,
          currentSourceOffset,
          currentOffset,
          delta,
          mousePos
        )}
      >
        {renderItem()}
      </div>
    </div>
  );
};
