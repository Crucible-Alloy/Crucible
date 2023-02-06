import React, { useEffect, useState } from "react";
import {
  AppShell,
  Burger,
  Header,
  MediaQuery,
  Navbar,
  Text,
  Title,
  Footer,
  useMantineTheme,
  ActionIcon,
  Stack,
  Group,
  Button,
  Loader,
  Center,
  ScrollArea,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons";
import NewProjectModal from "./NewProjectModal";

import { Project, Relation, Test } from "@prisma/client";
import { NewProject } from "../../../public/validation/formValidation";
import ProjectListItem from "./ProjectListItem";
import { TestWithCanvas } from "../../../public/main";

// TODO: Import Window electronAPI types in App.ts or somewhere more appropriate once we
//  get it to refactored Typescript.

interface ElectronAPI {
  getHomeDirectory: () => Promise<string>;
  validateProjectName: (projectName: string) => Promise<boolean>;
  createNewProject: (data: NewProject) => { success: boolean; error: any };
  getProject: (projectID: number) => Promise<Project>;
  getProjects: () => Promise<Project[]>;
  openProject: (projectId: number) => any;
  deleteProject: (project: Project) => any;
  selectFile: () => string;
  getAtomRelationsFrom: (
    projectID: number,
    sourceAtomLabel: string
  ) => Promise<Relation[]>;
  setAtomColor: (data: SetColor) => any;
  getTests: (projectID: number) => Promise<Test[]>;
  createNewTest: (data: { projectID: number; testName: string }) => {
    success: boolean;
    error: any;
  };
  readTest: (data: { testID: number }) => Promise<TestWithCanvas>;
  testCanAddAtom: (data: {
    testID: number;
    sourceAtomID: number;
  }) => Promise<{ success: boolean; error?: any }>;
  closeTab: (data: { projectID: number; testID: number }) => any;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI | any;
  }
  interface SetColor {
    sourceAtomID: number;
    color: string;
  }
}

export const ProjectSelect = () => {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [opened, setOpened] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  // Load projects from sqlite db
  // TODO: Dynamically reload after project deletion
  useEffect(() => {
    const loadProjects = async () => {
      window.electronAPI.getProjects().then((projects: Project[]) => {
        setProjects(projects);
      });
    };
    loadProjects().then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Center style={{ height: 400 }}>
        <Loader />
      </Center>
    );
  } else {
    return (
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 200, lg: 300 }}
          >
            <Stack>
              <Text weight={600} color={"blue"}>
                {" "}
                Projects{" "}
              </Text>
            </Stack>
          </Navbar>
        }
        footer={
          <Footer height={60} p="md">
            <Group position={"apart"}>
              <ActionIcon>
                <IconSettings />
              </ActionIcon>
              <Button onClick={() => setModalOpened(true)}>New Project</Button>
            </Group>
          </Footer>
        }
        header={
          <Header height={70} p="md">
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>

              <Title>ASketch</Title>
            </div>
          </Header>
        }
      >
        {/*TODO: Fix scroll area so that all projects are visible. */}
        <ScrollArea>
          <Stack mr={"xl"}>
            {projects.length > 0 ? (
              projects.map((project: Project) => (
                <ProjectListItem project={project} key={project.id} />
              ))
            ) : (
              <Center m={"xl"}>
                <Title size={"lg"} color={"dimmed"}>
                  {" "}
                  Looks like you don't have any projects yet...
                </Title>
              </Center>
            )}
          </Stack>
        </ScrollArea>
        <NewProjectModal setModalOpened={setModalOpened} opened={modalOpened} />
      </AppShell>
    );
  }
};

export default ProjectSelect;
