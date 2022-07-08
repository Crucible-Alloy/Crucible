import logo from './logo.svg';
import './App.css';
import {AppShell, Container, Header, Navbar, Title} from "@mantine/core";
import SidebarWrapper from "./components/SidebarWrapper";
import BodyWrapper from "./components/BodyWrapper";
import {useViewportSize} from "@mantine/hooks";
import {useState} from "react";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DragDrop} from "tabler-icons-react";

function App() {
    const { viewHeight, viewWidth } = useViewportSize();

    // State for canvas tabs
    const [tabs, setTabs] = useState([
        {
            key: 1,
            title: "Test 1",
            active: true
        },
        {
            key: 2,
            title: "Test 2",
            active: false
        }
    ]);

    const headerHeight = 60;
    const sidebarWidth = 500;

    return (
        <DndProvider backend={HTML5Backend}>
            <AppShell
                sx={{
                     height: `${viewHeight}`,
                     width: `${viewWidth}`,
                }}
                padding="xs"
                navbar={<Navbar width={{ base: sidebarWidth }} height={viewHeight} p="xs">{<SidebarWrapper />}</Navbar>}
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
                                 style={{height: "100%",
                                     backgroundColor: "#FF0000",
                                     margin: 0,
                                     padding: 0}}/>}
            </AppShell>
        </DndProvider>
    );
}

export default App;
