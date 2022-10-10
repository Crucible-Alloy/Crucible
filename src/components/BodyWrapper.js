import {CloseButton, Group, Tabs} from '@mantine/core';
import {IconChartDots3} from "@tabler/icons";
import TabContent from "./TabContent";
import {useCallback, useEffect, useState} from "react";

function BodyWrapper({projectKey}) {
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState("");

    // Initialize tabs
    useEffect(() => {
        window.electronAPI.getProjectTabs(projectKey).then(data => {
            setTabs(data[0])
            setActiveTab(data[1])
        })
    }, []);

    // useEffect(() => {
    //     updateTabs()
    // }, [tabs, activeTab])

    // Listen for updates to tabs
    useEffect( () => {
        window.electronAPI.listenForTabsChange((_event, value) => {
            window.electronAPI.getProjectTabs(projectKey).then(data => {
                setTabs(data[0])
                setActiveTab(data[1])
            })
        })
    }, []);

    function updateActiveTab(tabName) {
        window.electronAPI.setActiveTab(projectKey, tabName)
    }

    function closeTab(tabName) {
        window.electronAPI.closeTab(projectKey, tabName);
    }

    if (tabs) {
        return (
            <>
                <Tabs sx={{height: "100%"}} value={activeTab} onTabChange={updateActiveTab} keepMounted={false} variant={"outline"}>
                    <Tabs.List>
                        {tabs.map((tab, index) => (
                            <Tabs.Tab
                                value={tab.name}
                                icon={<IconChartDots3 size={16} />}
                            >
                                {<Group>{tab.name} <CloseButton onClick={() => closeTab(tab.name)}/> </Group>}
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
