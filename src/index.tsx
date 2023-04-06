import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
    {/*<BrowserRouter>*/}
    {/*  <Routes>*/}
    {/*    <Route path={"main_window/:projectID"} element={<App />} />*/}
    {/*    <Route path={"main_window"} element={<ProjectSelect />} />*/}
    {/*  </Routes>*/}
    {/*</BrowserRouter>*/}
  </React.StrictMode>
);
