import {IconDeviceFloppy} from "@tabler/icons";
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
            <IconDeviceFloppy size={24}/>
        </Button>
    );
}

export default TestSaveBtn;