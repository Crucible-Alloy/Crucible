import {IconTrash} from "@tabler/icons";
import {Button} from "@mantine/core";

function TestDeleteBtn ({projectKey, testKey}) {

    function deleteTest() {
        console.log("delete!")
        window.electronAPI.deleteTest(projectKey, testKey)
    }

    return (
        <Button
            onClick={() => deleteTest()}
            color="red"
            variant={"light"}
            size={"md"}
            //onClick={saveFile}
        >
            <IconTrash size={24}/>
        </Button>
    );
}

export default TestDeleteBtn;