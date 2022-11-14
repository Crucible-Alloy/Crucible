import {Box, Tabs} from '@mantine/core';
import {IconAdjustmentsHorizontal, IconAtom, IconTestPipe} from "@tabler/icons";
import AtomsSidebarTab from "./AtomsSidebarTab";
import SettingsSidebarTab from "./SettingsSidebarTab";
import TestsSidebarTab from "./TestsSidebarTab";

function SidebarWrapper({projectKey}) {
    return (
        <Tabs color="blue" p={"none"} m={0} defaultValue={"atoms"}>
            <Tabs.List grow>
                <Tabs.Tab value="atoms" icon={<IconAtom size={16} />}>Atoms</Tabs.Tab>
                <Tabs.Tab value="tests" icon={<IconTestPipe size={16} />}>Tests</Tabs.Tab>
                <Tabs.Tab value="settings" icon={<IconAdjustmentsHorizontal size={16} />}>Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value={"atoms"}>
                <AtomsSidebarTab projectKey={projectKey} />
            </Tabs.Panel>

            <Tabs.Panel value={"tests"}>
                <TestsSidebarTab projectKey={projectKey}/>
            </Tabs.Panel>

            <Tabs.Panel value={"settings"}>
                <SettingsSidebarTab projectKey={projectKey}/>
            </Tabs.Panel>

        </Tabs>
    );
}

export default SidebarWrapper;