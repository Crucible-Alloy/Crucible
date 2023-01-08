import React, {useEffect, useState} from 'react';
import {
    AppShell, Burger, Header, MediaQuery, Navbar, Text, Title, Footer, useMantineTheme,
    ActionIcon, Stack, UnstyledButton, Group, Avatar, Button, Loader, Center, ScrollArea, SimpleGrid, Grid,
} from "@mantine/core";
import {IconSettings, IconTrash} from "@tabler/icons";
import NewProjectModal from "./NewProjectModal";

import { Project } from "@prisma/client"
import {NewProject} from "../../../public/ipc/ipcMain";
import DeleteProjectModal from './DeleteProjectModal';
import ProjectListItem from "./ProjectListItem";

// TODO: Import Window electronAPI types in App.js or somewhere more appropriate once we
//  get it to refactored Typescript.

interface ElectronAPI {
    getHomeDirectory: () => Promise<string>;
    validateProjectName: (projectName: string) => Promise<boolean>;
    createNewProject: (data: NewProject) => { success: boolean, error: any; };
    getProject: (projectID: number) => Promise<Project>;
    getProjects: () => Promise<Project[]>
    openProject: (projectId: number) => any;
    deleteProject: (project: Project) => any;
    selectFile: () => string;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI | any;
    }
}

export const ProjectSelect = () => {
    const theme = useMantineTheme();
    const [loading, setLoading] = useState<boolean>(true);
    const [opened, setOpened] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [deleteModalProject, setDeleteModalProject] = useState<number>();
    const [modalOpened, setModalOpened] = useState(false);

    // Load projects from sqlite db
    useEffect(() => {
        const loadProjects = async () => {
            window.electronAPI.getProjects().then((projects:Project[]) => {
                setProjects(projects);
                }
            );
        }
        loadProjects().then(() => setLoading(false))
    }, []);

    if (loading) {
        return (
            <Center style={{height: 400}}>
                <Loader/>
            </Center>
        )
    } else {
        if (projects) {
            return (
                <AppShell
                    styles={{
                        main: {
                            background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                        },
                    }}
                    navbarOffsetBreakpoint="sm"
                    asideOffsetBreakpoint="sm"
                    navbar={
                        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{sm: 200, lg: 300}}>
                            <Stack>
                                <Text weight={600} color={"blue"}> Projects </Text>
                            </Stack>
                        </Navbar>
                    }
                    footer={
                        <Footer height={60} p="md">
                            <Group position={"apart"}>
                                <ActionIcon>
                                    <IconSettings/>
                                </ActionIcon>
                                <Button onClick={() => setModalOpened(true)}>New Project</Button>
                            </Group>

                        </Footer>
                    }
                    header={
                        <Header height={70} p="md">
                            <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
                                <MediaQuery largerThan="sm" styles={{display: 'none'}}>
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
                    <ScrollArea>
                        <Stack mr={'xl'}>
                            { projects.map( (project:Project) => ( <ProjectListItem project={project} key={project.id}/> ))}
                        </Stack>
                    </ScrollArea>
                    <NewProjectModal setModalOpened={setModalOpened} opened={modalOpened}/>
                </AppShell>
            )
        } else {
            return (
                <AppShell
                    styles={{
                        main: {
                            background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                        },
                    }}
                    navbarOffsetBreakpoint="sm"
                    asideOffsetBreakpoint="sm"
                    navbar={
                        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{sm: 200, lg: 300}}>
                            <Stack>
                                <Text weight={600} color={"blue"}> Projects </Text>
                            </Stack>
                        </Navbar>
                    }
                    footer={
                        <Footer height={60} p="md">
                            <Group position={"apart"}>
                                <ActionIcon>
                                    <IconSettings/>
                                </ActionIcon>
                            </Group>

                        </Footer>
                    }
                    header={
                        <Header height={70} p="md">
                            <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
                                <MediaQuery largerThan="sm" styles={{display: 'none'}}>
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
                    <ScrollArea m={"xl"} p={"xl"}>
                            <Center m={"xl"}>
                                <Title size={"lg"} color={"dimmed"}> Looks like you don't have any projects yet...</Title>
                            </Center>
                            <Center>
                                <Button onClick={() => setModalOpened(true)}>Create a Project</Button>
                            </Center>
                    </ScrollArea>
                    <NewProjectModal setModalOpened={setModalOpened} opened={modalOpened}/>
                </AppShell>
            )
        }
    }
}

export default ProjectSelect;