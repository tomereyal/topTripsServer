import React from "react";
import styled from "styled-components";
//@ts-ignore
import video from "../../../assests/coverVideo.mp4";
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 30vh;
  overflow: hidden;
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;
const VideoBg = styled.video`
  -o-object-fit: cover;
  object-fit: cover;
  background: #232a34;
  width: 100%;
  height: 100%;
`;
export default function Header() {
  return (
    <Container>
      <HeroBackground>
        <VideoBg autoPlay loop muted src={video} typeof="video/mp4" />
      </HeroBackground>
    </Container>
  );
}
