import {Box, Tabs} from '@mantine/core';
import {IconAdjustmentsHorizontal, IconAtom, IconTestPipe} from "@tabler/icons";
import AtomsSidebarTab from "./AtomsSidebarTab";
import SettingsSidebarTab from "./SettingsSidebarTab";
import TestsSidebarTab from "./TestsSidebarTab";

function SidebarWrapper({projectKey, tabs, setTabs }) {
    return (
        <Tabs color="blue" grow>
            <Tabs.Tab label="Atoms" icon={<IconAtom size={16} />}><AtomsSidebarTab projectKey={projectKey} /></Tabs.Tab>
            <Tabs.Tab label="Tests" icon={<IconTestPipe size={16} />}><TestsSidebarTab tabs={tabs} setTabs={setTabs} projectKey={projectKey}/></Tabs.Tab>
            <Tabs.Tab label="Settings" icon={<IconAdjustmentsHorizontal size={16} />}> <SettingsSidebarTab projectKey={projectKey}/> </Tabs.Tab>
        </Tabs>
    );
}

export default SidebarWrapper;