import { IconSettings, IconTag } from "@tabler/icons";
import { Modal, TextInput, ActionIcon } from "@mantine/core";
import { useState } from "react";

function TestSettingsBtn({ tab }) {
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
          icon={<IconTag />}
        />
      </Modal>

      <ActionIcon variant={"subtle"} onClick={() => setOpened(true)}>
        <IconSettings size={24} />
      </ActionIcon>
    </>
  );
}

export default TestSettingsBtn;
