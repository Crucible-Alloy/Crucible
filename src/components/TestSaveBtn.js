import {DeviceFloppy, PlayerPlay} from "tabler-icons-react";
import {Button} from "@mantine/core";

function TestSaveBtn ({disabled}) {

    return (
        <Button
            disabled={disabled}
            color="blue"
            variant={"light"}
            size={"md"}
            //onClick={saveFile}
        >
            <DeviceFloppy size={24}/>
        </Button>
    );
}

export default TestSaveBtn;