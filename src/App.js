import logo from './logo.svg';
import './App.css';
import {AppShell, Header, Navbar, Title} from "@mantine/core";
import SidebarWrapper from "./components/SidebarWrapper";
import CanvasWrapper from "./components/CanvasWrapper";
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

    return (
        <DndProvider backend={HTML5Backend}>
            <AppShell
                sx={{height: `${viewHeight}`,
                     width: `${viewWidth}`,
                }}
                padding="md"
                navbar={<Navbar width={{ base: 500 }} height={{viewHeight}} p="xs">{<SidebarWrapper />}</Navbar>}
                header={<Header height={60} p="xs">{<Title>Alloy Sketch</Title>}</Header>}
                styles={(theme) => ({
                    main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
                })}
            >
                {<CanvasWrapper tabs={tabs} setTabs={setTabs} />}
            </AppShell>
        </DndProvider>
    );
}

export default App;
