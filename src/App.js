import "./App.css";
import {
  AppShell,
  Header,
  MantineProvider,
  Navbar,
  Title,
  Center,
} from "@mantine/core";
import SidebarWrapper from "./components/SideBar/SidebarWrapper";
import BodyWrapper from "./components/BodyWrapper";
import { useViewportSize } from "@mantine/hooks";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SIDEBAR_WIDTH } from "./utils/constants";
import { useParams } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { CustomDragLayer } from "./components/CustomDragLayer";

function App() {
  const { viewHeight, viewWidth } = useViewportSize();
  const { projectID } = useParams();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div onMouseMove={handleMouseMove}>
      <DndProvider backend={HTML5Backend}>
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
                    // When other breakpoints do not match base width is used, defaults to 100%
                    base: 84,
                  }}
                  sx={(theme) => ({
                    backgroundColor: theme.white,
                    height: "100vh",
                  })}
                >
                  {" "}
                  {<SidebarWrapper projectID={projectID} />}{" "}
                </Navbar>
              }
            >
              <BodyWrapper projectID={projectID} mousePos={mousePos} />
            </AppShell>
          </NotificationsProvider>
        </MantineProvider>
        <CustomDragLayer mousePos={mousePos} />
      </DndProvider>
    </div>
  );
}

export default App;
