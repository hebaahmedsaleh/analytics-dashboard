import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { DateRangeProvider } from "./context/date-range-context";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DateRangeProvider>
      <App />
    </DateRangeProvider>
  </React.StrictMode>
);
