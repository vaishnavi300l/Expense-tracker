import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Expenses } from "./components/Expenses";
import { Analytics } from "./components/Analytics";
import { Categories } from "./components/Categories";
import { Settings } from "./components/Settings";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "expenses", Component: Expenses },
      { path: "analytics", Component: Analytics },
      { path: "categories", Component: Categories },
      { path: "settings", Component: Settings },
    ],
  },
  { path: "/login", Component: Login },
  { path: "*", Component: NotFound },
]);
