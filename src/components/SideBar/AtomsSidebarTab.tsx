import {Center, Container, Group, Loader, ScrollArea, Stack, Title} from "@mantine/core";
import React, { useState, useEffect } from "react";
import { AtomSourceItem } from "../AtomSource/AtomSourceItem";
import { AtomSourceWithRelations } from "../../main";
import { SIDEBAR_HEIGHT } from "../../utils/constants";

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
      <Container style={{ height: "100vh", width: '240px', position: 'absolute' }}>
        <Title pb={'sm'} size={'md'}>Your Atoms</Title>
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
      </Container>
    );
  }
}

export default AtomsSidebarTab;
