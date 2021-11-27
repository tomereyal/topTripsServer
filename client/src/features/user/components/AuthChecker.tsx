import { Spin } from "antd";
import React, { JSXElementConstructor } from "react";
import { Redirect, useHistory, useLocation } from "react-router";
import { useLoginMutation } from "../../../app/services/tripsApi";
import { useAppSelector } from "../../../hooks/store";
import { selectIsAdmin, selectIsAuth } from "../userSlice";

export default function AuthChecker(
  Component: JSXElementConstructor<any>,
  isAdminOnly: boolean
) {
  function CheckUserAuthentication(componentProps: any) {
    const isAuth = useAppSelector(selectIsAuth);
    const isAdmin = useAppSelector(selectIsAdmin);
    const [login, { isUninitialized }] = useLoginMutation();
    const { pathname } = useLocation();
    const history = useHistory();
    const publicPaths = ["/login", "/register"];
    console.log(`isAuth`, isAuth);
    const token = localStorage.getItem("token");
    console.log(`pathname`, pathname);

    async function loginInit() {
      const data = await login({ username: "", password: "" });
      console.log(`data from this path`, pathname, data);
      if (!data) history.push("/login");
    }
    if (token && !isAuth && isUninitialized) {
      loginInit();
      return <Spin />;
    } else if (token && !isAuth && !isUninitialized) {
      return <Spin />;
    } else {
      if (isAuth && !isAdmin && isAdminOnly) return <Redirect to="/" />;
      if (isAuth && pathname === "/login") return <Redirect to="/" />;
      else if (!isAuth && !publicPaths.includes(pathname))
        return <Redirect to="/login" />;
      else {
        console.log(`prior to rendering component the status:isAuth`, isAuth);
        return <Component {...componentProps} />;
      }
    }
  }

  return CheckUserAuthentication;
}
