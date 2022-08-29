import React from 'react';
import {Group} from "@mantine/core";
import TestPlayBtn from "../TestPlayBtn";
import TestSettingsBtn from "../TestSettingsBtn";
import TestSaveBtn from "../TestSaveBtn";
import Canvas from "../Canvas";
import {CustomDragLayer} from "../CustomDragLayer";
import DemoCanvas from "../DemoCanvas";

function SvgDemo(props) {

    return (
        <div style={{height: "100%"}}>
            <Group pb={"xs"}>
                <TestPlayBtn />
                <TestSaveBtn />
            </Group>

            <div className={"canvasContainer"}>
                <DemoCanvas />
            </div>
            <CustomDragLayer />
        </div>
    );
}

export default SvgDemo;