import {Box, Tabs} from '@mantine/core';
import {Atom, FileCode, Settings} from "tabler-icons-react";
import AtomsSidebarTab from "./AtomsSidebarTab";

function SidebarWrapper() {
    return (
        <Tabs color="blue" grow>
            <Tabs.Tab label="Atoms" icon={<Atom size={16} />}><AtomsSidebarTab /></Tabs.Tab>
            <Tabs.Tab label="Code" icon={<FileCode size={16} />}>Code Here</Tabs.Tab>
            <Tabs.Tab label="Settings" icon={<Settings size={16} />}>
                Settings Here
            </Tabs.Tab>
        </Tabs>
    );
}

export default SidebarWrapper;