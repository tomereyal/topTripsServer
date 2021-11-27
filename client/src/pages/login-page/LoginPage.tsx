import React from "react";
import styled from "styled-components";
import LoginForm from "../../features/user/components/LoginForm";

const InnerLayout = styled.div`
  background-color: ${(props) => props.theme.bgBright};
  height: 100vh;

  display: flex;
  flex-wrap: wrap;
`;

const RightContainer = styled.div`
  background-color: white;
  width: 60%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function LoginPage() {
  return (
    <InnerLayout>
      <RightContainer>
        <LoginForm />
      </RightContainer>
    </InnerLayout>
  );
}
