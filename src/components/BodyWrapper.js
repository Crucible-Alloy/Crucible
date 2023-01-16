import { CloseButton, Group, Tabs, Text } from "@mantine/core";
import { IconChartDots3 } from "@tabler/icons";
import TabContent from "./TabContent";
import { useEffect, useState } from "react";

function BodyWrapper({ projectKey, mousePos }) {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");

  // Initialize tabs
  useEffect(() => {
    window.electronAPI.getProjectTabs(projectKey).then((data) => {
      setTabs(data[0]);
      setActiveTab(data[1]);
    });
  }, []);

  // useEffect(() => {
  //     updateTabs()
  // }, [tabs, activeTab])

  // Listen for updates to tabs
  useEffect(() => {
    window.electronAPI.listenForTabsChange((_event, value) => {
      window.electronAPI.getProjectTabs(projectKey).then((data) => {
        setTabs(data[0]);
        setActiveTab(data[1]);
      });
    });
  }, []);

  function updateActiveTab(tabName) {
    window.electronAPI.setActiveTab(projectKey, tabName);
  }

  function closeTab(tabName) {
    window.electronAPI.closeTab(projectKey, tabName);
  }

  if (tabs) {
    return (
      <>
        <Tabs
          value={activeTab}
          onTabChange={updateActiveTab}
          keepMounted={false}
          radius={"md"}
        >
          <Tabs.List>
            {tabs.map((tab, index) => (
              <Tabs.Tab
                value={tab.name}
                icon={<IconChartDots3 size={16} />}
                sx={(theme) => ({
                  backgroundColor:
                    activeTab === tab.name ? "white" : theme.colors.gray[2],
                  height: 36,
                  borderRadius:
                    activeTab === tab.name ? "2px 8px 0 0" : "0 0 0 0",
                })}
              >
                {
                  <Group position={"apart"}>
                    <Text>{tab.name}</Text>{" "}
                    <CloseButton onClick={() => closeTab(tab.name)} />
                  </Group>
                }
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {tabs.map((tab, index) => (
            <Tabs.Panel
              value={tab.name}
              sx={{
                backgroundColor: "white",
                border: "1px",
                margin: 0,
                height: "parent",
              }}
            >
              <TabContent
                sx={{ height: "90vh" }}
                projectKey={projectKey}
                testKey={tab.testKey}
                tab={tab}
                mousePos={mousePos}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      </>
    );
  } else {
    return <></>;
  }
}

export default BodyWrapper;
