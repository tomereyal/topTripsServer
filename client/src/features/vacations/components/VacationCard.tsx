import React, { useState } from "react";
import { Card, Button, Tag, Badge, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  HeartOutlined,
  HeartFilled,
  SwapRightOutlined,
  LikeOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { VacationModel } from "../../../models/vacation.model";
import styled, { css } from "styled-components";
import AdminUpdateModal from "./AdminUpdateModal";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { selectIsAdmin, selectUserId } from "../../user/userSlice";

import {
  useDeleteVacationMutation,
  useFollowVacationMutation,
  useUnfollowVacationMutation,
} from "../../../app/services/tripsApi";
import moment from "moment";
import ShowMoreText from "react-show-more-text";
const { Meta } = Card;

export default function VacationCard(
  props: VacationModel & { followedByUser?: boolean }
) {
  const count = useAppSelector(() => {});
  const isAdmin = useAppSelector(selectIsAdmin);
  const userId = useAppSelector(selectUserId);
  const dispatch = useAppDispatch();
  const [isEdited, setIsEdited] = useState(false);
  const {
    id,
    title,
    description,
    price,
    fromDate,
    toDate,
    follows,
    url,
    followedByUser,
  } = props;
  const duration =
    Math.abs(
      moment(fromDate, "D-MM-YYYY")
        .startOf("day")
        .diff(moment(toDate, "D-MM-YYYY").startOf("day"), "days")
    ) + 1;

  const [deleteVacation, { isLoading }] = useDeleteVacationMutation();
  const [followVacation] = useFollowVacationMutation();
  const [unfollowVacation] = useUnfollowVacationMutation();
  const [isFollowedByUser, setIsFollowedByUser] = useState(followedByUser);

  const toggleFollow = async () => {
    if (!isFollowedByUser) {
      console.log(`follow this vacation id`, id);
      followVacation(id);
    } else {
      console.log(`unfollow this vacation id`, id);
      unfollowVacation(id);
    }
    setIsFollowedByUser((prev) => !prev);
  };

  const AdminToolbox = (
    <ToolButtonBox>
      <Button
        type="text"
        onClick={() => {
          setIsEdited(true);
        }}
        icon={
          <EditOutlined
            key="edit"
            style={{ fontSize: "1.2rem", color: "white" }}
          />
        }
      />
      <Popconfirm
        placement="bottomLeft"
        title={"Permanently delete Vacation? "}
        onConfirm={async () => {
          await deleteVacation(id);
        }}
        okText="Yes"
        cancelText="No"
      >
        <Button
          type="text"
          icon={
            <DeleteOutlined
              style={{ fontSize: "1.4rem", color: "white" }}
              key="delete"
            />
          }
        />
      </Popconfirm>
    </ToolButtonBox>
  );

  const DefaultToolbox = (
    <ToolButtonBox>
      <Button
        ghost
        onClick={toggleFollow}
        style={{
          marginLeft: "auto",
          color: "red",
          border: "none",
        }}
        icon={
          isFollowedByUser ? (
            <HeartFilled
              style={{
                fontSize: "1.7rem",
                color: "#e75a5a",
              }}
            />
          ) : (
            <HeartOutlined
              style={{
                fontSize: "2rem",
                color: "#ffffff",
              }}
            />
          )
        }
      />
    </ToolButtonBox>
  );

  return (
    <>
      <Card
        style={{
          width: 320,
          minHeight: "300px",
          padding: "0px",
          boxShadow: "0px 4px 5px #cfcccc",
          borderRadius: "10px",
        }}
        cover={
          <>
            {isAdmin ? AdminToolbox : DefaultToolbox}
            <TitleContainer url={url}>
              <Title>{title}</Title>
            </TitleContainer>
          </>
        }
        bodyStyle={{
          padding: "0px 3px",
        }}
      >
        <Datebar>
          <Tag
            color="#fff"
            style={{
              borderRadius: "6px",
              fontSize: "1.2rem",
              padding: "7px",
              margin: "2px",
              fontFamily: "lato",
              fontWeight: "bold",
              fontStyle: "italic",
              backgroundColor: "#4651e9",
            }}
          >
            {moment(fromDate, "D-MM-YYYY").format("MMM D")}
            <span
              style={{
                margin: "0 10px",
                textAlign: "center",
              }}
            >
              <Tag
                color="gold"
                style={{
                  position: "absolute",
                  top: "-30%",
                  left: "42%",
                  fontSize: "0.9rem",
                }}
              >
                {duration} days
              </Tag>
              <SwapRightOutlined />
            </span>
            {moment(toDate, "D-MM-YYYY").format("MMM D ")}
          </Tag>
        </Datebar>
        <TextContainer>
          <ShowMoreText
            /* Default options */
            lines={2}
            more="Show more"
            less="Show less"
            className="content-css"
            anchorClass="my-anchor-css-class"
            expanded={false}
            width={280}
            truncatedEndingComponent={"... "}
          >
            {description}
          </ShowMoreText>
        </TextContainer>
        <Footer>
          <Hoverbar>
            <PriceBadge price={price}>
              <DollarCircleOutlined />
              <span>{price?.toLocaleString()}</span>
            </PriceBadge>
            <div>
              <LikeOutlined
                style={{ fontSize: "1.4rem", color: "#1a1919ba" }}
              />
              <Badge
                count={follows}
                overflowCount={1000}
                style={{
                  backgroundColor: "#ff2424a9",
                  marginBottom: "6px",
                  marginRight: "2px",
                }}
                title={"Followers"}
              />
            </div>
          </Hoverbar>
        </Footer>
      </Card>
      {isEdited && (
        <AdminUpdateModal
          isShown={isEdited}
          setIsShown={setIsEdited}
          vacation={props}
        />
      )}
    </>
  );
}

const TitleContainer = styled.div<{ url: string }>`
  background-image: url(${(props) => props.url});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  height: 200px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
`;

const Title = styled.div`
  color: white;
  text-align: center;
  font-size: 2rem;
  text-overflow: clip;
  overflow-wrap: break-word;
  font-family: "Bree Serif", sans-serif;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0px 0px 5px #2b2929;
  padding-bottom: 2px;
  padding-top: 20px;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 0px 10px 25px;
  min-height: 60px;
  color: black;
  font-size: 1rem;
  font-family: "lato";
  padding-bottom: 20px;
`;

const Hoverbar = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  right: 0;
`;
const Datebar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  transform: translateY(-15px);
`;

const ToolButtonBox = styled.div`
  position: absolute;
  display: flex;
  justify-content: space-between;
  right: 0;
`;

type IPropsPriceBadge = { price: number };
const PriceBadge = styled.div<IPropsPriceBadge>`
  min-width: 100px;
  min-height: 20px;
  text-align: center;
  background-color: #fbab7e;
  color: white;
  margin: 0 10px
    ${({ price }) =>
      price > 0 &&
      css`
        background-color: #3749ee;
        background-image: linear-gradient(62deg, #3749ee 0%, #8ba9eb 100%);
        box-shadow: 0px 0px 10px #68bef7;
      `};
  ${({ price }) =>
    price > 2000 &&
    css`
      background-color: #79d376;
      background-image: linear-gradient(62deg, #79d376 0%, #ccff9d 100%);
      box-shadow: 0px 0px 10px #68f76f;
    `};
  ${({ price }) =>
    price > 10000 &&
    css`
      background-color: #fbab7e;
      background-image: linear-gradient(62deg, #fbab7e 0%, #f7ce68 100%);
      box-shadow: 0px 0px 10px #f7ce68;
    `};

  border-radius: 10px;
  span {
    font-weight: bolder;
  }
`;
const Footer = styled.div`
  position: absolute;
  padding: 10px 5px;
  bottom: 0;
  right: 0;
  left: 0;
  /* background-color: #f7f6f6; */
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #f7f6f6;
`;
