import React from "react";
import styled from "styled-components";
import VacationChart from "../../features/vacations/components/VacationChart";

const Container = styled.div`
  height: 100%;
  padding: 0 14px;
  padding-top: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function () {
  return (
    <Container>
      <VacationChart />
    </Container>
  );
}
