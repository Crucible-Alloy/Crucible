import React from 'react';
import {ActionIcon, Avatar, Group, Text} from "@mantine/core";
import {IconPlayerPlay} from "@tabler/icons";

function SidebarTestRow({test, testKey, handleRowClick}) {
    return (
        <Group onClick={() => handleRowClick(testKey, test)} position={"apart"}>
            <Group >
                <Text weight={700}>{test["name"]}</Text>
            </Group>
            <div>
                <ActionIcon color={"teal"} variant={"filled"}><IconPlayerPlay/></ActionIcon>
            </div>
        </Group>
    );
}

export default SidebarTestRow;