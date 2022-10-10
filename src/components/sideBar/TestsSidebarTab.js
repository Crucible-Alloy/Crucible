import { Avatar, Button, Container, Group, ScrollArea, Text, ActionIcon} from "@mantine/core";
import {useCallback, useState} from "react";
import {useEffect} from "react";
import React from "react";
import {IconPlayerPlay, IconPlus, IconStatusChange} from "@tabler/icons";
import {SIDEBAR_WIDTH} from "../../utils/constants";
import NewTestModal from "./NewTestModal";
import SidebarTestRow from "./SidebarTestRow";

function TestsSidebarTab({ projectKey }) {

    const [tests, setTests] = useState([]);
    const [modalOpened, setModalOpened] = useState(false);

    // Initialize Tests
    useEffect(() => {
        console.log("get tests")
        window.electronAPI.getTests(projectKey).then(tests => {
            setTests(tests)
        });
    }, []);


    function handleRowClick(testKey, testObj) {
        let newTab = testObj;
        newTab.testKey = testKey;
        // If there isn't a tab with a matching name, add the tab.
        window.electronAPI.openTab(projectKey, newTab)
    }

    if (Object.keys(tests).length > 0) {
        return (
            <Container>
                <ScrollArea style={{}} offsetScrollbars>
                        {Object.entries(tests).map(([key, value]) => (
                            <>
                                <Container p={"xs"} styles={(theme) => ({
                                    root: {

                                        borderRadius: 8,
                                        width: SIDEBAR_WIDTH - 50,

                                        '&:hover': {
                                            backgroundColor: theme.colors.gray[1],
                                        },
                                    }})}>
                                    <SidebarTestRow
                                        test={value}
                                        testKey={key}
                                        handleRowClick={handleRowClick}
                                    />
                                </Container>
                            </>
                        ))}
                </ScrollArea>
                <hr />
                <NewTestModal projectKey={projectKey} opened={modalOpened} tests={tests} setTests={setTests} setModalOpened={setModalOpened} />
                <Button onClick={() => setModalOpened((o) => !o)}>New Test</Button>
            </Container>);
    } else {
        console.log("No tests yet")
        return (
            <>
                <Group sx={{}} position={"center"}>
                    <Text color={"dimmed"} weight={700}>No tests yet... Click below to create one!</Text>
                </Group>
                <hr />
                <Group position={"right"}>
                        <NewTestModal projectKey={projectKey} opened={modalOpened} tests={tests} setTests={setTests} setModalOpened={setModalOpened} />
                        <Button leftIcon={<IconPlus/>} onClick={() => setModalOpened((o) => !o)}>New Test</Button>
                </Group>

            </>
        );
    }
}

export default TestsSidebarTab;