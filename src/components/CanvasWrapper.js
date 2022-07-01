import {Button, CloseButton, Group, Tabs} from '@mantine/core';
import {ChartDots3, Plus} from "tabler-icons-react";
import TestPlayBtn from "./TestPlayBtn";
import TestSettingsBtn from "./TestSettingsBtn";
import TabCanvasContent from "./TabCanvasContent";
import {useState} from "react";
import {useId} from "@mantine/hooks";



function CanvasWrapper({tabs, setTabs}) {

    const [activeTab, setActiveTab] = useState(0);

    function updateTab(index) {

        if (index === tabs.length) {
            newTab();
        }
        else {
            setActiveTab(index)
            tabs[index].active = true;
        }
    }

    function closeTab(e) {
        const index = e.target.parentNode.tabKey;
        console.log(`Removing tab ${index}`);
        tabs.pop(index);
    }

    function newTab() {
        setTabs(tabs => [...tabs, {title: "New Test", active: true, key: tabs.length + 1}]);
        setActiveTab(tabs.length);
    }

    return (
        <>
            <Tabs active={activeTab} onTabChange={updateTab} variant={"outline"}>
                {tabs.map((tab) => (
                    <Tabs.Tab
                        label={<Group>{tab.title} <CloseButton /> </Group>}
                        icon={<ChartDots3 size={16} />}>
                            <TabCanvasContent tab={tab}/>
                    </Tabs.Tab>
                ))}
                <Tabs.Tab
                    sx={{border: "none"}}
                    color="gray"
                    variant={"subtle"}
                    onClick={newTab}
                    label={<Plus size={16}/>} />

            </Tabs>

        </>
    );
}

export default CanvasWrapper;