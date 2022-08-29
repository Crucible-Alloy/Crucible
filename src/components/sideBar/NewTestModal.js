import React from 'react';
import {Button, Input, InputWrapper, Modal, TextInput} from "@mantine/core";
import {IconFolders, IconTag} from "@tabler/icons";
import FileSelector from "../FileSelector";
import {useState} from "react";
import {useEffect} from "react";

function NewTestModal({opened, setModalOpened, setTests, tests, projectKey}) {
    const [testName, setTestName] = useState("");

    function createNewTest() {
        window.electronAPI.createNewTest(projectKey, testName).then((test) => {
                window.electronAPI.getTests(projectKey).then((newTests) => {
                    setTests(newTests)
                    setModalOpened(false)
                })

        })
    }

    function updateName(val) {
        //console.log(val)
        setTestName(val);
    }

    return (
        <Modal
            opened={opened}
            onClose={() => setModalOpened(false)}
            title="Create a New Test"
        >
            <TextInput
                required
                placeholder="New Test"
                onChange={(event) => updateName(event.target.value)}
                label="Test Name"
                description={"Enter a name for the new test"}
                icon={<IconTag />}
            />
            <br/>

            <Button  m={"sm"} onClick={() => createNewTest()} >Create Test</Button>

        </Modal>
    );
}

export default NewTestModal;