import React from "react";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { IconFileSearch, IconFolders, IconTag } from "@tabler/icons";
import { useEffect } from "react";
import { useForm } from "@mantine/form";
import { NewProject } from "../../../public/validation/formValidation";

// TODO: Validation for project location to ensure no conflicting paths
// TODO: Zod schema validation for form?

interface Props {
  setModalOpened(val: boolean): any;
  opened: boolean;
}

function NewProjectModal({ setModalOpened, opened }: Props) {
  const form = useForm({
    initialValues: {
      projectName: "",
      projectPath: "",
      alloyFile: "",
    },
  });

  // Set the default project location in the form
  // TODO: Can this be moved into initial values somehow? I think the issue is that it is async.
  useEffect(() => {
    window.electronAPI.getHomeDirectory().then((homedir: string) => {
      form.setFieldValue("projectPath", `${homedir}/aSketchProjects/`);
    });
  }, [opened]);

  /* Asynchronously check for validation errors and if none, create the project on ipcMain */
  function createProject(data: NewProject) {
    window.electronAPI
      .createNewProject(data)
      .then((resp: { success: boolean; error: any; projectID?: number }) => {
        if (resp.error) {
          resp.error.forEach((error: any) => {
            form.setFieldError(error.path[0], error.message);
          });
        } else if (resp.projectID) {
          window.electronAPI.openProject(resp.projectID);
        }
      });
  }

  /* Close the modal and reset the form to default values. */
  function closeModal() {
    setModalOpened(false);
    form.reset();
  }

  /* Calls ipcMain to select a file. File selection must be done on main in order to get full path. */
  function selectAlloyFile() {
    window.electronAPI.selectFile().then((fileName: string) => {
      form.setFieldValue("alloyFile", fileName);
    });
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
            required
            withAsterisk
            placeholder="New Project"
            label="Project Name"
            description={"The name of your project."}
            icon={<IconTag />}
            {...form.getInputProps("projectName")}
          />

          <TextInput
            required
            withAsterisk
            icon={<IconFileSearch />}
            placeholder="Select File"
            label={"Alloy File"}
            description={"Select the Alloy file you wish to test."}
            onClick={() => selectAlloyFile()}
            {...form.getInputProps("alloyFile")}
          />

          <TextInput
            required
            withAsterisk
            icon={<IconFolders />}
            label={"Project Location"}
            description={"Where the project will be saved."}
            {...form.getInputProps("projectPath")}
          />

          <Button m={"sm"} type="submit">
            Create Project
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

export default NewProjectModal;
