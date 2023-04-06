import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ProjectSelect } from "./components/ProjectSelection/ProjectSelect";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ProjectSelect />
  </React.StrictMode>
);