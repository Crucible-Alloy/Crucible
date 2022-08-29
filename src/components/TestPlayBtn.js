import {IconPlayerPlay} from "@tabler/icons";
import {Avatar, Button} from "@mantine/core";

function TestPlayBtn ({disabled}) {
    return (
        <Button
            disabled={disabled}
            color="green"
            variant={"light"}
            size={"md"}
        >
            <IconPlayerPlay size={24}/>
        </Button>
    );
}

export default TestPlayBtn;