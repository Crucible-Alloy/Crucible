import './App.css';
import {AppShell, Header, MantineProvider, Navbar, Title, Center} from "@mantine/core";
import SidebarWrapper from "./components/sideBar/SidebarWrapper";
import BodyWrapper from "./components/BodyWrapper";
import {useViewportSize} from "@mantine/hooks";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {SIDEBAR_WIDTH} from "./utils/constants";
import {useParams} from "react-router-dom";
import {NotificationsProvider} from "@mantine/notifications";
import {useEffect, useState} from "react";
import {CustomDragLayer} from "./components/CustomDragLayer";

function App() {
    const { viewHeight, viewWidth } = useViewportSize();
    const { projectKey } = useParams();
    const [mousePos, setMousePos] = useState({x: 0, y: 0});

    const handleMouseMove = (event) => {
        // 👇 Get mouse position relative to element
        const localX = event.clientX - event.target.offsetLeft;
        const localY = event.clientY - event.target.offsetTop;

        setMousePos({ x: localX, y: localY });
    };

    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePos({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener(
                'mousemove',
                handleMouseMove
            );
        };
    }, []);

    console.log(mousePos.x)

    return (
            <div onMouseMove={handleMouseMove}>
                <DndProvider backend={HTML5Backend} >
                    <MantineProvider>
                        <NotificationsProvider>
                            <AppShell
                                padding={0}
                                sx={(theme) => ({
                                    height: `${viewHeight}`,
                                    width: `${viewWidth}`,
                                    backgroundColor: theme.colors.gray[2],
                                })}
                                navbar={
                                <Navbar
                                    width={{
                                        // When viewport is larger than theme.breakpoints.sm, Navbar width will be 300
                                        sm: 300,

                                        // When viewport is larger than theme.breakpoints.lg, Navbar width will be 400
                                        lg: 400,

                                        // When other breakpoints do not match base width is used, defaults to 100%
                                        base: 100,
                                    }}
                                    height={viewHeight}
                                    > { <SidebarWrapper projectKey={projectKey} /> } </Navbar>
                                }
                                header={
                                    <Header className={"menuBar"} height={32} styles={(theme) => ({
                                        root: {
                                            backgroundColor: theme.colors.gray[3],
                                            borderBottom: `solid 1px ${theme.colors.gray[4]}`
                                        }
                                        })}
                                    >
                                    <Center><Title weight={700} pt={8} size={14}>ASketch</Title></Center>
                                    </Header>
                                }>
                                <BodyWrapper projectKey={projectKey} mousePos={mousePos} />
                            </AppShell>
                        </NotificationsProvider>
                    </MantineProvider>
                    <CustomDragLayer mousePos={mousePos}/>
                </DndProvider>

            </div>
    )
}

export default App;
