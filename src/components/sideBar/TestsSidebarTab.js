import {
    ActionIcon,
    Avatar,
    Button,
    Center,
    Container,
    Grid,
    Group,
    ScrollArea,
    Text,
    Title,
    UnstyledButton
} from "@mantine/core";
import {useState} from "react";
import {AtomSource} from "../atoms/AtomSource";
import {v4 as uuidv4} from "uuid";
import {useEffect} from "react";
import React from "react";
import {PlayerPlay, Plus} from "tabler-icons-react";
import {SIDEBAR_WIDTH} from "../../utils/constants";
import NewTestModal from "./NewTestModal";

function TestsSidebarTab({ projectKey, tabs, setTabs }) {

    const [tests, setTests] = useState([]);
    const [modalOpened, setModalOpened] = useState(false);

    useEffect(() => {
        getTests();
    }, []);

    const getTests = () => {
        window.electronAPI.getTests(projectKey).then(tests => {
            setTests(tests)
            console.log(tests)
        })
    }

    function openTab(testKey, testObj) {
        const newTab = testObj
        newTab["active"] = true
        newTab["index"] = tabs.length + 1
        newTab["testKey"] = testKey

        //TODO: Set other tabs "Active" state to false


        setTabs((tabs) => [...tabs, testObj])
    }

    if (Object.keys(tests).length > 0) {
        console.log("Tests detected")
        return (
            <>
            <ScrollArea style={{height: 670}} offsetScrollbars>
                <Group>

                    {Object.entries(tests).map(([key, value]) => (
                        <>
                            <Container onClick={() => openTab(key, value)} p={"xs"} styles={(theme) => ({
                                root: {

                                    borderRadius: 8,
                                    width: SIDEBAR_WIDTH - 50,

                                    '&:hover': {
                                        backgroundColor: theme.colors.gray[1],
                                    },
                                }})}>
                                <Group>
                                    <Avatar size={30} color="blue">{value["name"].charAt(0)}</Avatar>
                                    <div>
                                        <Text>{value["name"]}</Text>
                                    </div>
                                </Group>
                            </Container>
                        </>
                    ))}
                </Group>
            </ScrollArea>
            <hr />
            <NewTestModal projectKey={projectKey} opened={modalOpened} tests={tests} setTests={setTests} setModalOpened={setModalOpened} />
            <Button onClick={() => setModalOpened((o) => !o)}>New Test</Button>
        </>);
    } else {
        console.log("No tests yet")
        return (
            <>
                <Group sx={{height: 680}} position={"center"}>
                    <Text color={"dimmed"} weight={700}>No tests yet... Click below to create one!</Text>
                </Group>
                <hr />
                <Group position={"right"}>
                        <NewTestModal projectKey={projectKey} opened={modalOpened} tests={tests} setTests={setTests} setModalOpened={setModalOpened} />
                        <Button leftIcon={<Plus/>} onClick={() => setModalOpened((o) => !o)}>New Test</Button>
                </Group>

            </>
        );
    }
}

export default TestsSidebarTab;