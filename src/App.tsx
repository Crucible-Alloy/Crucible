import "./App.css";
import { z, ZodError } from "zod";
import { AppShell, MantineProvider, Navbar } from "@mantine/core";
import SidebarWrapper from "./components/SideBar/SidebarWrapper";
import BodyWrapper from "./components/BodyWrapper";
import { useViewportSize } from "@mantine/hooks";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { NewProject } from "../public/validation/formValidation";
import { Atom, AtomSource, Project, Relation, Test } from "@prisma/client";
import { AtomSourceWithRelations, TestWithCanvas } from "../public/main";
import { ElectronAPI } from "../public/preload";
const { CustomDragLayer } = require("./components/CustomDragLayer");

// TODO: Import Window electronAPI types in App.ts or somewhere more appropriate once we
//  get it to refactored Typescript.

declare global {
  interface Window {
    electronAPI: ElectronAPI | any;
  }
  interface SetColor {
    sourceAtomID: number;
    color: string;
  }
  type AtomDraggable = {
    renderType: string;
    data: Atom | AtomSourceWithRelations;
    metadata?: any;
  };
}

function App() {
  const { width, height } = useViewportSize();
  const { projectID } = useParams();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const number = z.coerce.number();
  const handleMouseMove = (event: any) => {
    // 👇 Get mouse position relative to element
    const localX = event.clientX - event.target.offsetLeft;
    const localY = event.clientY - event.target.offsetTop;

    setMousePos({ x: localX, y: localY });
  };

  useEffect(() => {
    const handleMouseMove = (event: any) => {
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
                height: `${height}px`,
                width: `${width}px`,
                position: "absolute",
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
                    height: `${height}px`,
                  })}
                >
                  {" "}
                  {<SidebarWrapper projectID={number.parse(projectID)} />}{" "}
                </Navbar>
              }
            >
              <BodyWrapper
                projectID={number.parse(projectID)}
                mousePos={mousePos}
              />
            </AppShell>
          </NotificationsProvider>
        </MantineProvider>
        <CustomDragLayer mousePos={mousePos} />
      </DndProvider>
    </div>
  );
}

export default App;
