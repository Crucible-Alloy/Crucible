import {Group} from "@mantine/core";
import TestPlayBtn from "./TestPlayBtn";
import TestSettingsBtn from "./TestSettingsBtn";
import TestSaveBtn from "./TestSaveBtn";
import {CustomDragLayer} from "./CustomDragLayer";
import Canvas from "./Canvas";

function TabContent ({tab, projectKey, testKey}) {

    return (
        <div style={{height: "100%"}}>
            <Group pb={"xs"}>
                <TestPlayBtn projectKey={projectKey} testKey={testKey}/>
                <TestSettingsBtn tab={tab} />
                <TestSaveBtn />
            </Group>

            <div className={"canvasContainer"}>
                <Canvas projectKey={projectKey} testKey={testKey} tab={tab}/>
                <CustomDragLayer />
            </div>

        </div>
    );
}

export default TabContent;