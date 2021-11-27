import React, { useState } from "react";
import { List, Skeleton, Divider, Spin } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import VacationCard from "./VacationCard";

import {
  useGetCurrentVacationsQuery,
  useGetTotalVacationsQuery,
} from "../../../app/services/tripsApi";



export default function CurrentVacationsList() {
  const [fetchSize, setFetchSize] = useState(20);
  const [current, setCurrent] = useState(0);
  const { data, isLoading } = useGetCurrentVacationsQuery({
    current,
    fetchSize,
  });
  const { data: total } = useGetTotalVacationsQuery();

  const loadMoreData = () => {
    if (data) setCurrent(data.length);
  };

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
      <InfiniteScroll
        dataLength={data ? data.length : 0}
        next={loadMoreData}
        hasMore={!!data && !!total && data.length < total}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
        style={{ overflowX: "hidden" }}
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
            xxl: 6,
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
              <VacationCard {...vacation} />
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
}
