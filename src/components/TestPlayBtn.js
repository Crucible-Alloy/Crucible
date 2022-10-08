import {IconPlayerPlay} from "@tabler/icons";
import {Avatar, Button} from "@mantine/core";



function TestPlayBtn ({disabled, projectKey, testKey}) {

    const runTest = () => {
        window.electronAPI.runTest(projectKey, testKey);
    }

    return (
        <Button
            disabled={disabled}
            color="green"
            variant={"light"}
            size={"md"}
            onClick={() => {runTest()}}
        >
            <IconPlayerPlay size={24}/>
        </Button>
    );
}

export default TestPlayBtn;