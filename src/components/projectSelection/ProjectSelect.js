import React, {useEffect, useState} from 'react';
import {
    AppShell, Burger, Header, MediaQuery, Navbar, Text, Title, Footer, useMantineTheme,
    ActionIcon, Stack, UnstyledButton, Group, Avatar, Button, Loader, Center, Grid, ScrollArea,
} from "@mantine/core";
import {IconSettings} from "@tabler/icons";
import NewProjectModal from "./NewProjectModal";

export const ProjectSelect = () => {

    const theme = useMantineTheme();
    const [loading, setLoading] = useState(true);
    const [opened, setOpened] = useState(false);
    const [projects, setProjects] = useState([]);
    const [modalOpened, setModalOpened] = useState(false);

    // Load projects from store
    useEffect(() => {
        window.electronAPI.getProjects().then(projects => {
            setLoading(false)
            setProjects(projects)
        })
    }, []);


    function openProject(projectKey) {
        window.electronAPI.openProject(projectKey);
    }

    if (loading) {
        return (
            <Center style={{height: 400}}>
                <Loader/>
            </Center>
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
                                <IconSettings />
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
                <ScrollArea>
                    <Group spacing={"lg"}>
                        {Object.entries(projects).map(([key, value]) => (
                                <>
                                        <UnstyledButton onClick={() => {openProject(key)}}>
                                            <Group p={"xs"}  position={"left"} styles={(theme) => ({
                                                root: {

                                                    borderRadius: 8,
                                                    maxHeight: 60,
                                                    width: 320,
                                                    whitespace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                    '&:hover': {
                                                        backgroundColor: theme.colors.gray[2],
                                                    },
                                                }})}>
                                                <Avatar size={40} color="blue">{projects[key]["name"].charAt(0)}</Avatar>
                                                <Text p={0} m={0}>{projects[key]["name"]}</Text>
                                            </Group>
                                        </UnstyledButton>
                                    </>
                                ))}
                    </Group>
                </ScrollArea>
                <NewProjectModal setModalOpened={setModalOpened} opened={modalOpened}/>

            </AppShell>
        )
    }
}

export default ProjectSelect;