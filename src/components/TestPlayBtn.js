import {IconAlertTriangle, IconCheck, IconPlayerPlay, IconX} from "@tabler/icons";
import {Avatar, Button} from "@mantine/core";
import {useState} from "react";
import {showNotification} from "@mantine/notifications";



function TestPlayBtn ({disabled, projectKey, testKey}) {
    const [running, setRunning] = useState(false);

    const runTest = () => {
        setRunning(true);
        window.electronAPI.runTest(projectKey, testKey).then(data => {
            if (data === "Pass") {
                showNotification({
                    title: "Passed",
                    message: `The test is satisfiable`,
                    color: "green",
                    icon: <IconCheck/>
                });
                setRunning(false);
            } else {
                showNotification({
                    title: "Failed",
                    message: `The test is unsatisfiable`,
                    color: "red",
                    icon: <IconX/>
                });
                setRunning(false);
            }
        })

    }

    return (
        <Button
            disabled={disabled}
            color="green"
            variant={"light"}
            size={"md"}
            onClick={() => {runTest()}}
            loading={running}
        >
            <IconPlayerPlay size={24}/>
        </Button>
    );
}

export default TestPlayBtn;