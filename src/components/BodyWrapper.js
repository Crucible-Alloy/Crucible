import {CloseButton, Group, Tabs} from '@mantine/core';
import {IconChartDots3} from "@tabler/icons";
import TabContent from "./TabContent";
import {useState} from "react";

function BodyWrapper({tabs, setTabs, projectKey}) {

    const [activeTab, setActiveTab] = useState(0);

    function updateTab(index) {
            setActiveTab(index)
            tabs[index].active = true;
    }

    function closeTab(e) {
        const tabIndex = e.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute("index")
        console.log(`Removing tab ${tabIndex}`);
        let updatedTabs = tabs.splice(tabIndex, 1)
        setTabs([...tabs.slice(0, tabIndex),
            ...tabs.slice(tabIndex + 1)]);
    }

    // New Tab function removed in favor of creating new tests via the sidebar...

    // function newTab() {
    //     // Create new test in store, generate placeholder file in /tests.
    //     window.electronAPI.createNewTest(projectKey, "New Test").then( (test) => {
    //         //setTabs(tabs => [...tabs, test]);
    //         //setActiveTab(tabs.length);
    //
    //
    //
    //     })
    // }

    if (tabs.length > 0) {
        return (
            <>
                <Tabs sx={{height: "100%"}} active={activeTab} onTabChange={updateTab} variant={"outline"}>
                    <Tabs.List>
                        {tabs.map((tab, index) => (
                            <Tabs.Tab
                                value={tab.name}
                                icon={<IconChartDots3 size={16} />}
                            >
                                {<Group>{tab.name} <CloseButton onClick={closeTab}/> </Group>}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                    {tabs.map((tab, index) => (
                        <Tabs.Panel value={tab.name}>
                            <TabContent projectKey={projectKey} testKey={tab.testKey} tab={tab}/>
                        </Tabs.Panel>
                    ))}
                </Tabs>
            </>
        );
    } else {
        return (<></>);
    }
}

export default BodyWrapper;
