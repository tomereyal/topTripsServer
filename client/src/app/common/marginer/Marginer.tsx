import React from "react";

type IPropsMarginer = { size: number };

export default function Marginer(props: IPropsMarginer) {
  const { size } = props;
  return <div style={{ margin: `${size / 2}px 0` }}></div>;
}
