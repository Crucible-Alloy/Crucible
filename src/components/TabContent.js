import {Group, Container, Tooltip} from "@mantine/core";
import TestPlayBtn from "./TestPlayBtn";
import TestSettingsBtn from "./TestSettingsBtn";
import {CustomDragLayer} from "./CustomDragLayer";
import Canvas from "./Canvas";
import TestPredicatesBtn from "./TestPredicatesBtn";

function TabContent ({tab, projectKey, testKey, mousePos}) {

    return (
            <Container styles={(theme) => ({height: "100%", width:"100%", position:"relative"})} p={"sm"}>
            <Group position={"apart"}>
                <Group>
                    <TestPlayBtn projectKey={projectKey} testKey={testKey}/>
                    <TestPredicatesBtn projectKey={projectKey} testKey={testKey}/>
                </Group>

                <TestSettingsBtn tab={tab} />
            </Group>
            <Container p={"sm"} sx={{position: "relative", height: "100%"}}>
                <div className={"canvasContainer"}>
                    <Canvas projectKey={projectKey} testKey={testKey} tab={tab}/>
                </div>
            </Container>
        </Container>
    );
}

export default TabContent;