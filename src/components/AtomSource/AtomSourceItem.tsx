import React, { useEffect, useState } from "react";
import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import {
  IconArrowMoveRight,
  IconCaretDown,
  IconCaretUp,
  IconChartCircles,
  IconEdit,
  IconSubtask,
} from "@tabler/icons";
import AtomSourceSettingsModal from "./AtomSourceSettingsModal";
import { AtomSourceWithRelations } from "../../main";
import { ATOM_SOURCE } from "../../utils/constants";

interface Props {
  atomSource: AtomSourceWithRelations;
}

export function AtomSourceItem({ atomSource }: Props) {
  const [modalOpened, setModalOpened] = useState(false);
  const [dropDown, setDropdown] = useState(false);
  const [multiplicity, setMultiplicity] = useState("not Defined");

  const renderType = ATOM_SOURCE;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ATOM_SOURCE,
      item: {
        data: atomSource,
        renderType,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    []
  );

  useEffect(() => {
    return () => {
      findAndSetMultiplicity();
    };
  }, []);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // TODO: Set listener for color change.

  function findAndSetMultiplicity() {
    atomSource.isLone
      ? setMultiplicity("isLone")
      : atomSource.isOne
      ? setMultiplicity("isOne")
      : atomSource.isSome
      ? setMultiplicity("isSome")
      : setMultiplicity("not defined");
  }

  function editAtom() {
    setModalOpened(true);
  }
  return (
    <>
      <AtomSourceSettingsModal
        atomSource={atomSource}
        setModalOpened={setModalOpened}
        opened={modalOpened}
      />

      <Paper
        ref={drag}
        shadow="md"
        p="md"
        radius={"lg"}
        role="DraggableBox"
        sx={(theme) => ({
          backgroundColor: theme.colors.dark[4],
          border: `solid 6px ${atomSource.color}`,
          width: "200px",
        })}
      >
        <Group>
          <Text color={atomSource.color} size={"xl"} weight={800}>
            {atomSource.label.split("/")[1]}
          </Text>
          <ActionIcon
            onClick={() => setDropdown(!dropDown)}
            style={{ float: "right" }}
          >
            {dropDown ? <IconCaretUp /> : <IconCaretDown />}
          </ActionIcon>
        </Group>
        {dropDown ? (
          //  TODO: refactor atomSource dropdown into it's own component
          <>
            <Group mt={"xs"}>
              <IconChartCircles color={"gray"} />
              <Text color={"white"} size={"md"} weight={800}>
                {" "}
                Multiplicity{" "}
              </Text>
            </Group>
            <Text ml={"sm"} color={atomSource.color} size={"md"} weight={600}>
              {" "}
              {multiplicity}{" "}
            </Text>

            <Group mt={"xs"}>
              <IconArrowMoveRight color={"gray"} />
              <Text color="white" size={"md"} weight={800}>
                {" "}
                Relations{" "}
              </Text>
            </Group>
            {atomSource.fromRelations ? (
              atomSource.fromRelations.map((item) => (
                <Group>
                  <Text ml={"sm"} color="white" weight={600}>
                    {" "}
                    {item.label}:
                  </Text>
                  <Text color="white"> {item.multiplicity} </Text>
                </Group>
              ))
            ) : (
              <Text color={"dimmed"}> None </Text>
            )}

            <Group mt={"xs"}>
              <IconSubtask color={"gray"} />
              <Text color="white" size={"md"} weight={800}>
                {" "}
                Extends{" "}
              </Text>
            </Group>
            {atomSource.isChildOf.length > 0 ? (
              atomSource.isChildOf.map((relation) => (
                <Group>
                  <Text ml={"sm"} color="white" weight={600}>
                    {" "}
                    {relation.parentLabel}
                  </Text>
                </Group>
              ))
            ) : (
              <Text color={"dimmed"}> None </Text>
            )}

            <Group position={"right"}>
              <ActionIcon onClick={editAtom}>
                <IconEdit />
              </ActionIcon>
            </Group>
          </>
        ) : (
          <></>
        )}
      </Paper>
    </>
  );
}
