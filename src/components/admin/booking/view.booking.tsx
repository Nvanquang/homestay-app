import { IBooking } from "@/types/backend";
import { Descriptions, Drawer } from "antd";

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IBooking | null;
    setDataInit: (v: any) => void;
}
const ViewDetailBooking = (props: IProps) => {
    const { onClose, open, dataInit, setDataInit } = props;

    return (
        <>
            <Drawer
                title="Thông Tin Booking"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"40vw"}
                maskClosable={false}
            >
                <Descriptions title="" bordered column={2} layout="vertical">
                    <Descriptions.Item label="Homestay name">{dataInit?.homestay?.name}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" >{dataInit?.homestay.address}</Descriptions.Item>
                    
                    <Descriptions.Item label="User">{dataInit?.user.fullName}</Descriptions.Item>

                    <Descriptions.Item label="Checkin">{dataInit?.checkinDate}</Descriptions.Item>
                    <Descriptions.Item label="Checkout">{dataInit?.checkoutDate}</Descriptions.Item>

                    <Descriptions.Item label="Số lượng khách">{dataInit?.guests}</Descriptions.Item>
                    <Descriptions.Item label="Giảm giá">{dataInit?.discount}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền (Chưa giảm)">{dataInit?.subtotal}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền (Đã giảm )">{dataInit?.totalAmount}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{dataInit?.note}</Descriptions.Item>

                </Descriptions>
            </Drawer>
        </>
    )
}

export default ViewDetailBooking;