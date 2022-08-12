import logo from './logo.svg';
import './App.css';
import {AppShell, Container, Header, Navbar, Title} from "@mantine/core";
import SidebarWrapper from "./components/sideBar/SidebarWrapper";
import BodyWrapper from "./components/BodyWrapper";
import {useViewportSize} from "@mantine/hooks";
import { useState } from "react";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DragDrop} from "tabler-icons-react";
import {HANDLE_FETCH_DATA, HANDLE_SAVE_DATA, SIDEBAR_WIDTH} from "./utils/constants";
import {useParams} from "react-router-dom";
import {useEffect} from "react";

function App() {
    const { viewHeight, viewWidth } = useViewportSize();
    const { projectKey } = useParams();
    // State for canvas tabs
    const [tabs, setTabs] = useState([

        // {
        //     key: 2,
        //     title: "Test 2",
        //     active: false
        // }
    ]);

    // TODO: Refactor how tabs are loaded from project tests
    // useEffect(() => {
    //     window.electronAPI.getTests(projectKey).then(tests => {
    //         setTabs(tests)
    //     })
    // }, );


    const headerHeight = 60;

    return (
        <DndProvider backend={HTML5Backend}>
            <AppShell
                sx={{
                     height: `${viewHeight}`,
                     width: `${viewWidth}`,
                }}
                padding="xs"
                navbar={<Navbar width={{ base: SIDEBAR_WIDTH }} height={viewHeight} p="xs">{<SidebarWrapper tabs={tabs} setTabs={setTabs} projectKey={projectKey}/>}</Navbar>}
                header={<Header height={headerHeight} p="xs">{<Title>Alloy Sketch</Title>}</Header>}
                styles={(theme) => ({
                    main: {
                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
                        //height: (viewHeight - headerHeight),
                        //width: (viewWidth - sidebarWidth)},
                    }})}
            >
                {
                    <BodyWrapper tabs={tabs}
                                 setTabs={setTabs}
                                 projectKey={projectKey}
                                 style={{height: "100%",
                                     backgroundColor: "#FF0000",
                                     margin: 0,
                                     padding: 0}}/>}
            </AppShell>
        </DndProvider>
    );
}

export default App;
