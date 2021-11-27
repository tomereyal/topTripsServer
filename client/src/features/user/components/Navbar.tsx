import React, { useState } from "react";
import { Button } from "antd";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { PlusCircleOutlined } from "@ant-design/icons";
import AdminUpdateModal from "../../vacations/components/AdminUpdateModal";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { selectIsAdmin, selectIsAuth, selectUserId } from "../userSlice";
import { useLogoutMutation } from "../../../app/services/tripsApi";

const Container = styled.div`
  position: absolute;
  height: 80px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  background-color: transparent;
  width: 100%;
  font-size: calc(10px + 1vmin);
  z-index: 3;
  border-bottom: 2px solid rgba(255, 255, 255, 0.062);
`;
const Logo = styled.div`
  width: 120px;
  height: 100%;
  background-image: url("/topTripsLogo2.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin-left: 24px;
`;

const CustomMenu = styled.div`
  background-color: transparent;
  min-width: 250px;
`;
const LoginMenu = styled.div`
  min-width: 100px;
  background-color: transparent;
  margin-left: auto;
`;
const MenuButton = styled(Button)`
  color: white;
  background-color: transparent;
`;

export default function Navbar() {
  const isAuth = useAppSelector(selectIsAuth);
  const userId = useAppSelector(selectUserId);
  const isAdmin = useAppSelector(selectIsAdmin);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [isCreatingVacation, setIsCreatingVacation] = useState(false);
  const [logout] = useLogoutMutation();

  async function logoutUser() {
    history.push("/login");
    await logout(userId);
  }

  return (
    <Container>
      <Logo />
      {isAuth && (
        <CustomMenu>
          {isAdmin && (
            <MenuButton key="2">
              <Link to="/chart">Admin Charts</Link>
            </MenuButton>
          )}
          <MenuButton key="1">
            <Link to={"/"}>Vacations</Link>
          </MenuButton>
          {isAdmin && (
            <MenuButton
              onClick={() => {
                setIsCreatingVacation(true);
              }}
              children={"Create Vacation"}
              icon={<PlusCircleOutlined />}
            />
          )}
        </CustomMenu>
      )}

      <LoginMenu>
        {isAuth ? (
          <MenuButton key="4" onClick={logoutUser}>
            Logout
          </MenuButton>
        ) : (
          <>
            {/* <MenuButton key="5">
              <Link to="/login">Login</Link>
            </MenuButton>
            <MenuButton key="6">
              <Link to="/register">Register</Link>
            </MenuButton> */}
          </>
        )}
      </LoginMenu>

      {isCreatingVacation && (
        <AdminUpdateModal
          isShown={isCreatingVacation}
          setIsShown={setIsCreatingVacation}
          vacation={null}
        />
      )}
    </Container>
  );
}
