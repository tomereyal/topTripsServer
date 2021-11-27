import React, { useState } from "react";
import styled from "styled-components";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useHistory } from "react-router";
import { device } from "../../../app/clientConfig";
import { Link } from "react-router-dom";
import {
  useIsUsernameTakenMutation,
  useRegisterMutation,
} from "../../../app/services/tripsApi";

const RegistrationFormContainer = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  @media ${device.laptop} {
    width: 400px;
  }
  @media ${device.desktop} {
    width: 700px;
  }
`;

const CustomForm = styled(Form)`
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

export default function RegistrationForm() {
  const [isTaken, setIsTaken] = useState(false);
  const history = useHistory();
  const [register] = useRegisterMutation();
  const [isUsernameTaken] = useIsUsernameTakenMutation();
  async function checkIfUsernameIsTaken(value: string) {
    if (!value) return;
    const result = (await isUsernameTaken(value)) as any;
    console.log(`result`, result);
    setIsTaken(result.data.isUsernameTaken);
  }

  const onFinish = async (values: any) => {
    console.log("Received values of form: ", values);
    const result = (await register(values)) as { data: number };
    if (result.data) history.push("/login");
  };

  return (
    <RegistrationFormContainer>
      <CustomForm
        name="normal_registration"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 60 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <p>Create Account</p>

        <Form.Item
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input placeholder="First Name" size="large" />
        </Form.Item>
        <Form.Item
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input placeholder="Last Name" size="large" />
        </Form.Item>
        <Form.Item
          name="username"
          hasFeedback
          extra={
            isTaken
              ? "Sorry this username is taken. Please Choose another.."
              : ""
          }
          validateStatus={isTaken ? "error" : "success"}
          rules={[
            { required: true, message: "Please input your Username!" },
            {
              required: true,
              validator: (rule, value) => {
                return checkIfUsernameIsTaken(value);
              },
              message: "Username Taken",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
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
            Register
          </RegisterButton>
          Or <Link to="/login">Already have an account?</Link>
        </Form.Item>
      </CustomForm>
    </RegistrationFormContainer>
  );
}
