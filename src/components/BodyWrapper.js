import {Button, CloseButton, Group, Tabs} from '@mantine/core';
import {ChartDots3, Plus} from "tabler-icons-react";
import TestPlayBtn from "./TestPlayBtn";
import TestSettingsBtn from "./TestSettingsBtn";
import TabContent from "./TabContent";
import {useState} from "react";
import {useId} from "@mantine/hooks";
import {CustomDragLayer} from "./CustomDragLayer";



function BodyWrapper({tabs, setTabs}) {

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
        const tabIndex = e.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute("index")
        console.log(`Removing tab ${tabIndex}`);
        setTabs(tabs => tabs.splice(tabIindex, 1))
    }

    function newTab() {
        setTabs(tabs => [...tabs, {title: "New Test", active: true, key: tabs.length + 1}]);
        setActiveTab(tabs.length);
    }

    return (
        <>
            <Tabs sx={{height: "100%"}} active={activeTab} onTabChange={updateTab} variant={"outline"}>
                {tabs.map((tab, index) => (
                    <Tabs.Tab
                        index={index}
                        label={<Group>{tab.title} <CloseButton onClick={closeTab}/> </Group>}
                        icon={<ChartDots3 size={16} />}
                    >
                        <TabContent tab={tab}/>
                    </Tabs.Tab>
                ))}

                {/*New Tab Button*/}
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

export default BodyWrapper;