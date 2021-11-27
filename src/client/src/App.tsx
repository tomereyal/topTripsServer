import React from "react";
import "./App.css";
import { Layout } from "antd";
import Navbar from "./features/user/components/Navbar";
import styled, { ThemeProvider } from "styled-components";

import LoginPage from "./pages/login-page/LoginPage";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Switch } from "react-router";
import RegistrationPage from "./pages/registration-page/RegistrationPage";
import VacationsPage from "./pages/vacations-page/VacationsPage";
import AdminChartPage from "./pages/admin-chart-page/AdminChartPage";
import AuthChecker from "./features/user/components/AuthChecker";

const theme = {
  bgLight: "rgb(234, 238, 241)",
  bgOrange: " #ffb167",
  bgBright: " #ffffec",
};

const OuterLayout = styled(Layout)`
  position: relative;
  background-color: ${(props) => props.theme.bgLight};
  width: 100%;
  min-height: 100vh;
`;

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <OuterLayout>
          <Navbar />
          <Switch>
            <Route
              path="/chart"
              component={AuthChecker(AdminChartPage, true)}
            />
            <Route path="/register" component={RegistrationPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/" component={AuthChecker(VacationsPage, false)} />
          </Switch>
        </OuterLayout>
      </ThemeProvider>
    </Router>
  );
}

export default App;
