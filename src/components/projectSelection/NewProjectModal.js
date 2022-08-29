import React from 'react';
import {Button, Input, InputWrapper, Modal, TextInput} from "@mantine/core";
import {IconFolders, IconTag} from "@tabler/icons";
import FileSelector from "../FileSelector";
import {useState} from "react";
import {useEffect} from "react";

function NewProjectModal(props) {
    const [newProjectLocation, setNewProjectLocation] = useState("");
    const [projectName, setProjectName] = useState("");
    const [alloyFile, setAlloyFile] = useState("");

    useEffect(() => {
        window.electronAPI.getHomeDirectory().then(homedir => {
            setNewProjectLocation(`${homedir}/aSketchProjects/`)
        })
    }, []);

    function createNewProject() {
        // Needs to call to ipcMain, save project object to store, create folder in correct directory, copy selected alloy file to it.
        window.electronAPI.createNewProject(alloyFile, projectName, newProjectLocation)
    }

    function handleNewProjectLocation() {
        window.electronAPI.setNewProjectLocation().then( filePath => {
            setNewProjectLocation(filePath);
        })
    }

    function updateName(val) {
        //console.log(val)
        setProjectName(val);
    }

    function updateProjectFolder(val) {
        setNewProjectLocation(val);
    }

    function checkState() {
        console.log(projectName);
        console.log(alloyFile);
        console.log(newProjectLocation);
    }

    return (
        <Modal
            opened={props.opened}
            onClose={() => props.setModalOpened(false)}
            title="Create a New Project"
        >
            <TextInput
                required
                placeholder="New Project"
                onChange={(event) => updateName(event.target.value)}
                label="Project Name"
                description={"The name of your project."}
                icon={<IconTag />}
            />
            <br/>

            <FileSelector setSelectedFile={setAlloyFile} selectedFile={alloyFile}/>

            <InputWrapper
                labelElement="div"
                label={"Project Location"}
                description={"Where the project will be saved."}
            >
                <Input icon={<IconFolders />} onClick={() => handleNewProjectLocation} onChange={(event) => updateProjectFolder(event.target.value)} value={newProjectLocation} />
            </InputWrapper>
            <Button  m={"sm"} onClick={() => createNewProject()} >Create Project</Button>

        </Modal>
    );
}

export default NewProjectModal;