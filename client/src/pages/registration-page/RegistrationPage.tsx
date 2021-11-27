import React from "react";
import styled from "styled-components";
import RegistrationForm from "../../features/user/components/RegistrationForm";
import InfoSider from "../../app/common/info-sider/InfoSider";

const InnerLayout = styled.div`
  background-color: ${(props) => props.theme.bgOrange};
  min-height: max-content;
  /* height: 100vh; */
  display: flex;
  flex-wrap: wrap;
`;

const RightContainer = styled.div`
  background-color: white;
  width: 60%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top-left-radius: 80px;
  border-bottom-left-radius: 80px;
`;

export default function RegistrationPage() {
  return (
    <InnerLayout>
      <InfoSider />

      <RightContainer>
        <RegistrationForm />
      </RightContainer>
    </InnerLayout>
  );
}
