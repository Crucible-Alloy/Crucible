import { Center, Group, Loader, ScrollArea, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { AtomSourceItem } from "../AtomSource/AtomSourceItem";
import { useEffect } from "react";
import React from "react";
import { AtomSourceWithRelations } from "../../../public/ipc/atoms";
const { SIDEBAR_HEIGHT } = require("../../utils/constants.js");

interface Props {
  projectID: number;
}

function AtomsSidebarTab({ projectID }: Props) {
  const [atoms, setAtoms] = useState<AtomSourceWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getAtoms = () => {
    setLoading(true);
    window.electronAPI
      .getAtomSources(projectID)
      .then((atoms: AtomSourceWithRelations[]) => {
        if (atoms.length > 0) {
          setAtoms(atoms);
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    getAtoms();
  }, []);

  if (loading) {
    return (
      <Stack sx={{ marginTop: "40%" }}>
        <Center>
          <Title order={4} color={"dimmed"}>
            Loading atoms...
          </Title>
        </Center>
        <Center>
          <Loader />
        </Center>
      </Stack>
    );
  } else {
    return (
      <ScrollArea style={{ height: SIDEBAR_HEIGHT }}>
        <Group p={"lg"}>
          {atoms.map((atom) =>
            atom.isAbstract ? (
              <></>
            ) : (
              <AtomSourceItem key={atom.id} atomSource={atom} />
            )
          )}
        </Group>
      </ScrollArea>
    );
  }
}

export default AtomsSidebarTab;
