import React, {useEffect, useState} from 'react';
import {
    AppShell,
    Burger,
    Header,
    MediaQuery,
    Navbar,
    Modal,
    ScrollArea,
    Text,
    Title,
    Aside,
    Footer,
    useMantineTheme,
    ActionIcon, Stack, UnstyledButton, Group, Avatar, Button, TextInput, Input, InputWrapper,
} from "@mantine/core";
import SidebarWrapper from "./SidebarWrapper";
import BodyWrapper from "./BodyWrapper";
import {FileCode, FileSearch, FolderPlus, Settings} from "tabler-icons-react";

export const ProjectSelect = () => {

    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);
    const [modalOpened, setModalOpened] = useState(false);
    const [projects, setProjects] = useState([]);
    const [newProjectLocation, setNewProjectLocaction] = useState();


    // Load projects from store
    useEffect(() => {
        window.electronAPI.getProjects().then(projects => {
            setProjects(projects)
        })
    }, []);


    function createNewProject() {

    }

    function handleNewProjectLocation() {
        window.electronAPI.setNewProjectLocation().then( filePath => {
            setNewProjectLocaction(filePath);
        })
    }

    function openProject(projectKey) {
        window.electronAPI.openProject(projectKey);
    }

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
                <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
                    <Stack>
                        <Text weight={"600"} color={"blue"}> Projects </Text>
                    </Stack>
                </Navbar>
            }
            footer={
                <Footer height={60} p="md">
                    <Group position={"apart"}>
                        <ActionIcon>
                            <Settings />
                        </ActionIcon>
                        <Button onClick={() => setModalOpened(true)}>New Project</Button>
                    </Group>

                </Footer>
            }
            header={
                <Header height={70} p="md">
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
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

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Create a New Project"
            >
                    <TextInput
                        placeholder="New Project"
                        label="Project name"
                        required
                    />
                    <br/>
                    <InputWrapper
                        labelElement="div"
                        label={"Project Location"}
                    >
                        <Input icon={<FileSearch />} onClick={handleNewProjectLocation} value={"User/aSketchProjects/New Project"} />
                    </InputWrapper>

                <Button m={"sm"} onClick={createNewProject} >Create Project</Button>


            </Modal>

            {Object.entries(projects).map(([key, value]) => (
                <>
                <UnstyledButton onClick={() => {openProject(key)}}>
                     <Group p={"xs"}  styles={(theme) => ({
                         root: {

                             borderRadius: 8,

                             '&:hover': {
                                 backgroundColor: theme.colors.gray[2],
                             },
                         }})}>
                     <Avatar size={40} color="blue">{projects[key]["name"].charAt(0)}</Avatar>
                        <div>
                            <Text>{projects[key]["name"]}</Text>
                            <Text size="xs" color="dimmed">{projects[key]["path"]}</Text>
                        </div>
                    </Group>
                </UnstyledButton>
                </>
            ))}
        </AppShell>
    )
}

export default ProjectSelect;