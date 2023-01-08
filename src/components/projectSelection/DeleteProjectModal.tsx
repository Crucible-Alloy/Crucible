import React, {useState} from 'react';
import {Button, Code, Group, Modal, Stack, Text, Textarea, TextInput, Title} from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import {useEffect} from "react";
import {ZodError} from "zod";
import {Project} from "@prisma/client";
import {showNotification} from "@mantine/notifications";

// TODO: Validation for project location to ensure no conflicting paths
// TODO: Zod schema validation for form?

interface Props {
    setModalOpened(val: boolean): any;
    opened: boolean;
    project: Project;
}

function DeleteProjectModal({ setModalOpened, opened, project }: Props) {
    const [equiv, setEquiv] = useState<boolean>(false);

    /* Asynchronously delete a project from the database */
    function deleteProject( ) {
        window.electronAPI.deleteProject( project ).then((respProject: Project) => {
            closeModal();
            showNotification({title: "Project Deleted", message: `Successfully deleted ${respProject.name}`});
        });
    }

    /* Close the modal and reset the form to default values. */
    function closeModal() {
        setModalOpened(false);
    }

    function checkEquivalency(input:string) {
        if (input === project.name) {
            setEquiv(true)
        } else {
            setEquiv(false)
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={() => closeModal()}
            title="Delete Project"
        >
            <Title mb={'md'} order={3} >Delete this project?</Title>
            <Code >{project ? project.projectPath : "..."}</Code>
            <Text size={"sm"} my={'lg'}>This will delete the project, its tests, and all associated files from your projects
                directory and the application database. This action cannot be undone. </Text>
            <br/>
            <TextInput
                label={`Type "${project.name}" to delete the project`}
                onChange={(event) => checkEquivalency(event.target.value)}
            >
            </TextInput>
            <Group position={'right'} mt={'lg'}>
                <Button variant={'outline'} color={'gray'} onClick={() => closeModal()}>Cancel</Button>
                <Button color={'red'} onClick={() => deleteProject() } disabled={ !equiv }>Delete My Project</Button>
            </Group>
        </Modal>
    );
}

export default DeleteProjectModal;