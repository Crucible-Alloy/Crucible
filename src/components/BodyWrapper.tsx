import { CloseButton, Group, Tabs, TabsValue, Text } from "@mantine/core";
import { IconChartDots3 } from "@tabler/icons";
import React, { useEffect, useState } from "react";
import { Test } from "@prisma/client";
import TabContent from "./TabContent";

interface Props {
  projectID: number;
  mousePos: { x: number; y: number };
}
function BodyWrapper({ projectID, mousePos }: Props) {
  const [tabs, setTabs] = useState<Test[]>([]);
  const [activeTab, setActiveTab] = useState<TabsValue>(null);

  // Initialize tabs
  useEffect(() => {
    loadTabs().then(() =>
      loadActiveTab().then(() => console.log("Init tabs and active tab"))
    );
  }, []);

  // Listen for updates to tabs
  useEffect(() => {
    window.electronAPI.listenForTabsChange((_event: any, value: any) => {
      console.log("got tabs update");
      loadTabs().then(() =>
        loadActiveTab().then(() => console.log("Update tabs and active tab"))
      );
    });
  }, []);

  const loadTabs = async () => {
    window.electronAPI.getTests(projectID).then((tests: Test[]) => {
      let openTests = tests.filter((test: Test) => test.tabIsOpen);
      setTabs(openTests);
    });
  };

  const loadActiveTab = async () => {
    window.electronAPI.getActiveTab(projectID).then((activeTab: TabsValue) => {
      if (activeTab) {
        setActiveTab(activeTab);
      } else {
        setActiveTab(tabs[0].name);
      }
    });
  };

  function updateActiveTab(testName: TabsValue) {
    window.electronAPI.setActiveTab({ projectID, testName });
  }

  function closeTab(testID: number) {
    window.electronAPI.closeTab({ projectID, testID });
  }

  if (tabs) {
    return (
      <>
        <Tabs
          value={activeTab}
          onTabChange={(value) => updateActiveTab(value)}
          keepMounted={false}
          radius={"md"}
          sx={{
            display: "flex",
            flexDirection: "column",
            // TODO: Add "Open a test to get started image here"
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Tabs.List
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[2],
              boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.15)",
              zIndex: 1,
              height: 40,
            })}
          >
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.id}
                value={tab.name}
                icon={<IconChartDots3 size={16} />}
                sx={(theme) => ({
                  backgroundColor:
                    activeTab === tab.name ? "white" : theme.colors.gray[2],
                  height: "100%",
                  borderRadius:
                    activeTab === tab.name ? "2px 8px 0 0" : "0 0 0 0",
                })}
              >
                {
                  <Group position={"apart"}>
                    <Text>{tab.name}</Text>{" "}
                    <CloseButton onClick={() => closeTab(tab.id)} />
                  </Group>
                }
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {tabs.map((test) => (
            <Tabs.Panel
              key={test.id}
              value={test.name}
              sx={(theme) => ({
                flex: "1",
                backgroundColor: theme.colors.gray[3],
                padding: "32px",
              })}
            >
              <TabContent
                projectID={projectID}
                test={test}
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
