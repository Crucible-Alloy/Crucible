import {PlayerPlay} from "tabler-icons-react";
import {Avatar, Button} from "@mantine/core";

function TestPlayBtn ({disabled}) {
    return (
        <Button
            disabled={disabled}
            color="green"
            variant={"light"}
            size={"md"}
        >
            <PlayerPlay size={24}/>
        </Button>
    );
}

export default TestPlayBtn;