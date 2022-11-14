import {IconCheck, IconPlayerPlay, IconX} from "@tabler/icons";
import {Button, Tooltip, ActionIcon} from "@mantine/core";
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
        <Tooltip label={"Run"} position={"bottom"}>
            <ActionIcon
                disabled={disabled}
                color="teal"
                variant={"light"}
                onClick={() => {runTest()}}
                loading={running}
            ><IconPlayerPlay size={20}/></ActionIcon>
        </Tooltip>
    );
}

export default TestPlayBtn;