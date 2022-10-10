import React from 'react';
import {Group} from "@mantine/core";
import TestPlayBtn from "../TestPlayBtn";
import TestSettingsBtn from "../TestSettingsBtn";
import TestDeleteBtn from "../TestDeleteBtn";
import Canvas from "../Canvas";
import {CustomDragLayer} from "../CustomDragLayer";
import DemoCanvas from "../DemoCanvas";

function SvgDemo(props) {

    return (
        <div style={{height: "100%"}}>
            <Group pb={"xs"}>
                <TestPlayBtn />
                <TestDeleteBtn />
            </Group>

            <div className={"canvasContainer"}>
                <DemoCanvas />
            </div>
            <CustomDragLayer />
        </div>
    );
}

export default SvgDemo;