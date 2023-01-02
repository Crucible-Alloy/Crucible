import React from 'react';
import {Button, Modal, Stack, TextInput} from "@mantine/core";
import {IconFileSearch, IconFolders, IconTag} from "@tabler/icons";
import {useEffect} from "react";
import {useForm} from '@mantine/form';

// TODO: Validation for project location to ensure no conflicting paths
// TODO: Zod schema validation for form?

interface Props {
    setModalOpened(val: boolean): any;
    opened: boolean;
}

interface NewProjectForm {
    projectName: string;
    projectLocation: string;
    alloyFile: string;
}

function NewProjectModal({setModalOpened, opened}: Props) {

    const form = useForm({
        initialValues: {
            projectName: '',
            projectLocation: '',
            alloyFile: '',
        }
    });

    // Set the default project location in the form
    // TODO: Can this be moved into initial values somehow? I think the issue is that it is async.
    useEffect(() => {
        window.electronAPI.getHomeDirectory().then( (homedir:string) => {
            form.setFieldValue('projectLocation', `${homedir}/aSketchProjects/`);
        });
    }, [opened]);

    /* Asynchronously check for validation errors and if none, create the project on ipcMain */
    function createProject({projectName, projectLocation, alloyFile} : NewProjectForm) {
        window.electronAPI.validateProjectName(projectName).then((isValid: boolean) => {
            if (alloyFile) {
                isValid ?
                window.electronAPI.createNewProject(alloyFile, projectName, projectLocation) :
                form.setFieldError('projectName', "This project name is already in use.")
            }
        })
    }

    /* Close the modal and reset the form to default values. */
    function closeModal() {
        setModalOpened(false);
        form.reset();
    }

    /* Calls ipcMain to select a file. File selection must be done on main in order to get full path. */
    function selectAlloyFile() {
        window.electronAPI.selectFile().then((fileName: string) => {
            form.setFieldValue('alloyFile', fileName)
        })
    }

    return (
        <Modal
            opened={opened}
            onClose={() => closeModal()}
            title="Create a New Project"
        >
            <form onSubmit={form.onSubmit((values) => createProject(values))}>
                <Stack>
                    <TextInput
                        required withAsterisk
                        placeholder="New Project"
                        label="Project Name"
                        description={"The name of your project."}
                        icon={<IconTag />}
                        {...form.getInputProps('projectName')}
                    />

                    <TextInput
                        required withAsterisk
                        icon={<IconFileSearch />}
                        placeholder="Select File"
                        label={"Alloy File"}
                        description={"Select the Alloy file you wish to test."}
                        onClick={() => selectAlloyFile()}
                        {...form.getInputProps('alloyFile')}
                    />

                    <TextInput
                        required withAsterisk
                        icon={<IconFolders />}
                        label={"Project Location"}
                        description={"Where the project will be saved."}
                           {...form.getInputProps('projectLocation')}
                    />

                    <Button  m={"sm"} type="submit">Create Project</Button>
                </Stack>
            </form>
        </Modal>
    );
}

export default NewProjectModal;