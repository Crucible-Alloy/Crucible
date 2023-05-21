import { IconTrash } from "@tabler/icons";
import { Button } from "@mantine/core";

interface Props {
  projectKey: number;
  testKey: number;
}

function TestDeleteBtn({ projectKey, testKey }: Props) {
  function deleteTest() {
    console.log("delete!");
    window.electronAPI.deleteTest(projectKey, testKey);
  }

  return (
    <Button
      onClick={() => deleteTest()}
      color="red"
      variant={"light"}
      size={"md"}
      //onClick={saveFile}
    >
      <IconTrash size={24} />
    </Button>
  );
}

export default TestDeleteBtn;
