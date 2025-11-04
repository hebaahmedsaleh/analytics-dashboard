import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { DateRangeProvider } from "./context/date-range-context";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DateRangeProvider>
        <App />
      </DateRangeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
