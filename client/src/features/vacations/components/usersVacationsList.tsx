import React from "react";
import { List, Spin } from "antd";
import VacationCard from "./VacationCard";

import { useGetUsersVacationsQuery } from "../../../app/services/tripsApi";

export default function UsersVacationsList() {
  const { data, isLoading, isFetching } = useGetUsersVacationsQuery();
  console.log(`data`, data);
  if (isLoading) return <Spin />;

  return (
    <div
      id="scrollableDiv"
      style={{
        minHeight: "100%",
        width: "100%",
        overflow: "auto",
        padding: "0 16px",
      }}
      className={"hidden-scroll-bars"}
    >
      <List
        dataSource={data}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 4,
          lg: 4,
          xl: 6,
          xxl: 3,
        }}
        renderItem={(vacation) => (
          <List.Item
            key={vacation.id}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <VacationCard {...vacation} followedByUser={true} />
          </List.Item>
        )}
      />
    </div>
  );
}
