import {IconSettings, IconTag} from "@tabler/icons";
import {Button, Modal, TextInput} from "@mantine/core";
import {useState} from "react";

function TestSettingsBtn ({tab}) {

    const [opened, setOpened] = useState(false);

    return (
        <>
        <Modal
            opened={opened}
            onClose={() => setOpened(false)}
            title={"Test Settings"}
        >
            <TextInput
                defaultValue={tab.title}
                label="Test Name"
                icon={<IconTag />} />
        </Modal>

        <Button
            color="blue"
            variant={"light"}
            size={"md"}
            onClick={() => setOpened(true)}
        >
            <IconSettings size={24}/>
        </Button>
        </>
    );
}

export default TestSettingsBtn;