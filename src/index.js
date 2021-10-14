import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";
import Canvas from "./pages/Canvas";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route path="/" component={App}>
        <Route path="/canvas" component={Canvas} />
      </Route>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
