import {Box, Container, Group, Text} from "@mantine/core";
import TestPlayBtn from "./TestPlayBtn";
import TestSettingsBtn from "./TestSettingsBtn";
import {useState} from "react";
import {useDrop} from "react-dnd";
import Atom from "./AtomSource";
import TestSaveBtn from "./TestSaveBtn";
import {CustomDragLayer} from "./CustomDragLayer";
import Canvas from "./Canvas";

function TabContent ({tab, projectKey, testKey}) {

    return (
        <div style={{height: "100%"}}>
            <Group pb={"xs"}>
                <TestPlayBtn />
                <TestSettingsBtn tab={tab} />
                <TestSaveBtn />
            </Group>

            <div className={"canvasContainer"}>
                <Canvas projectKey={projectKey} testKey={testKey} tab={tab}/>
            </div>
            <CustomDragLayer />
        </div>
    );
}

export default TabContent;