import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Upload,
} from "antd";

import { PlusOutlined } from "@ant-design/icons";
import { uploadsServerEndpoint } from "../../../app/serverConfig";
import { useAppSelector, useAppDispatch } from "../../../hooks/store";
import { selectAccessToken } from "../../../features/user/userSlice";

import { VacationModel } from "../../../models/vacation.model";
import moment from "moment";

import {
  useCreateVacationMutation,
  useUpdateVacationMutation,
} from "../../../app/services/tripsApi";
const { RangePicker } = DatePicker;

interface IEditModal {
  isShown: boolean;
  setIsShown: Dispatch<SetStateAction<boolean>>;
  vacation: VacationModel | null;
}

export default function AdminUpdateModal(props: IEditModal) {
  const [createVacation, { isLoading: isCreating }] =
    useCreateVacationMutation();
  const [updateVacation, { isLoading: isUpdating }] =
    useUpdateVacationMutation();
  const dispatch = useAppDispatch();
  const { isShown, setIsShown, vacation } = props;
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [currentUrl, setCurrentUrl] = useState(
    vacation && vacation.url ? vacation.url : ""
  );
  let initialFormValues = {};

  if (vacation !== null) {
    const { title, description, price, fromDate, toDate, id } = vacation;
    initialFormValues = {
      title,
      description,
      price,
      rangePicker: [
        moment(fromDate, "DD-MM-YYYY"),
        moment(toDate, "DD-MM-YYYY"),
      ],
    };
  }
  const handleCancel = () => {
    console.log("Clicked cancel button");
    setIsShown(false);
  };
  const onFinish = async (fieldValues: any) => {
    console.log(`fieldValues `, fieldValues);
    const rangeValue = fieldValues["rangePicker"];
    const url =
      fieldValues.url && fieldValues.url[0].response.url
        ? fieldValues.url[0].response.url
        : vacation?.url;
    const values = {
      ...fieldValues,
      fromDate: rangeValue[0].format("YYYY-MM-DD"),
      toDate: rangeValue[1].format("YYYY-MM-DD"),
      url,
    };
    delete values.rangePicker;
    console.log(`values`, values);
    if (!vacation) {
      setIsShown(false);

      return await createVacation(values);
    }
    // dispatch(createVacationAsync(values));
    else {
      values["id"] = vacation.id;
      setIsShown(false);

      return await updateVacation(values);

      // dispatch(updateVacationAsync(values));
    }
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const validateMessages = {
    required: "${label} is required!",
    types: {
      email: "${label} is not a valid email!",
      number: "${label} is not a valid number!",
    },
    number: {
      range: "${label} must be between ${min} and ${max}",
    },
  };
  const normFile = (e: any) => {
    console.log("Upload event:", e);
    if (e?.file?.thumbUrl) setCurrentUrl(e.file.thumbUrl);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  const accessToken = useAppSelector(selectAccessToken);

  const [fileList, setFileList] = useState([]);

  //@ts-ignore
  const handleChange = ({ fileList }) => {
    console.log(`fileList`, fileList);
    setFileList(fileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      title={vacation ? "Edit Vacation" : "Create A Vacation"}
      visible={isShown}
      footer={null}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Form
        {...layout}
        name="vacation_form"
        onFinish={onFinish}
        validateMessages={validateMessages}
        initialValues={initialFormValues}
      >
        <Form.Item name={"title"} label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={"description"} label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name={"price"}
          label="Price"
          rules={[{ type: "number", min: 0, max: 20000 }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item name="rangePicker" label="RangePicker">
          <RangePicker format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item
          name="url"
          label="Upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="images"
        >
          {/* <ImgUploader /> */}
          {/* <div>
            <img src={currentUrl} width={"120px"} />
          </div> */}

          {/* <Upload name="logo" action="/upload.do" listType="picture">
            <Button icon={<UploadOutlined />}>
              {vacation?.url ? "Replace Image" : "Click to upload"}
            </Button>
          </Upload> */}
          <Upload
            action={`${uploadsServerEndpoint}/`}
            headers={{
              Authorization: `Bearer ${accessToken}`,
            }}
            name={"avatar"}
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
