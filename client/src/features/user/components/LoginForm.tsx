import React from "react";
import styled from "styled-components";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../../../hooks/store";
import { selectIsAuth } from "../userSlice";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { useLoginMutation } from "../../../app/services/tripsApi";

const RegistrationFormContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
`;

const CustomForm = styled(Form)`
  /* max-width: 400px; */
  width: 600px;
  p {
    font-size: 2rem;
    font-family: "Cabin", sans-serif;
    font-weight: bolder;
    letter-spacing: 1px;
  }
`;

const RegisterButton = styled(Button)`
  width: 100%;
  color: white;
  font-weight: 800;
  border-color: white;

  background-color: ${(props) => props.theme.bgOrange};
  &:hover {
    background-color: white;
    color: ${(props) => props.theme.bgOrange};
    border-color: ${(props) => props.theme.bgOrange};
  }
`;

export default function LoginForm() {
  const [login, { isLoading, isSuccess }] = useLoginMutation();
  const isAuth = useAppSelector(selectIsAuth);
  const dispatch = useAppDispatch();
  const history = useHistory();

  // const login = async (values: any) => {
  //   const result = await dispatch(loginAsync(values));
  //   //@ts-ignore
  //   const accessTokenExpiration = result?.payload?.accessTokenExpiration;
  //   if (accessTokenExpiration) history.push("/");
  //   setTimeout(() => {
  //     console.log(`Refreshing authentification and renewing tokens!`);

  //     dispatch(loginAsync({}));
  //   }, accessTokenExpiration - 10000);
  // };

  const onFinish = async (values: any) => {
    console.log("Received values of form: ", values);
    const userCredentials = await (login(values) as any);
    if (userCredentials.data) {
      history.push("/");
    }
  };

  return (
    <RegistrationFormContainer>
      <CustomForm
        name="normal_login"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 60 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <p>Log-in</p>

        <Form.Item
          name="username"
          hasFeedback
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
          hasFeedback
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <RegisterButton htmlType="submit" size="large">
            Enter
          </RegisterButton>
          Or don't have an account? <Link to="/register">Create Acount </Link>
        </Form.Item>
      </CustomForm>
    </RegistrationFormContainer>
  );
}
