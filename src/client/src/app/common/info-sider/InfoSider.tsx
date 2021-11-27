import React from "react";
import styled from "styled-components";
import { device } from "../../clientConfig";
import Marginer from "../marginer/Marginer";

const CustomSider = styled.div`
  width: 40%;
  display: flex;
  align-items: center;
  justify-content: space-around;

  /* z-index: 2; */
  @media ${device.laptop} {
    height: 100vh;
    flex-direction: column;
  }
`;

const Title = styled.p`
  color: white;
  font-size: calc(10px + 2vmin);
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  /* margin-top: 100px; */
  letter-spacing: 2px;
  word-wrap: break-word;

  /* max-width: 600px; */
`;
const VacationBlob = styled.div`
  height: 40%;
  width: 60%;
  img {
    transform: translateX(50%);
    max-width: 100%;
    height: auto;
  }
  @media ${device.laptop} {
    height: 100vh;
  }
`;

export default function InfoSider() {
  return (
    <CustomSider>
      <Marginer size={100} />
      <Title>Discover, Follow & Liveout The Top Vacations.</Title>
      <VacationBlob>
        <img src="/vacationImage.png"></img>
      </VacationBlob>
    </CustomSider>
  );
}
