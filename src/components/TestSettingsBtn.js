import { IconSettings, IconTag } from "@tabler/icons";
import { Modal, TextInput, ActionIcon } from "@mantine/core";
import { useState } from "react";

export function TestSettingsBtn({ test }) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={"Test Settings"}
      >
        <TextInput
          defaultValue={test.name}
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
