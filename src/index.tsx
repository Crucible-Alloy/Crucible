import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  MemoryRouter,
  Routes,
  Route,
  HashRouter,
  BrowserRouter,
  createBrowserRouter,
  RouterProvider, createHashRouter, createMemoryRouter
} from "react-router-dom";
import { ProjectSelect } from "./components/ProjectSelection/ProjectSelect";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createMemoryRouter([
  {
    path: "/", element: <ProjectSelect />,
    children: [
      {
        path: 'projects',
        element: <ProjectSelect/>,
      },
      {
        path: 'main_window/:projectID',
        element: <App />
      }
    ]
  },
]);

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <RouterProvider router={router} />
// );

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
