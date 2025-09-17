import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IBackendError, IBooking } from "@/types/backend";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Spin, Tag, Dropdown, Modal, message, Space, notification } from "antd";
import { useRef, useState } from 'react';
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import { fetchBooking } from "@/redux/slice/bookingSlide";
import { colorBookingStatus, formatCurrency, isSuccessResponse } from "@/config/utils";
import dayjs from "dayjs";
import { CheckCircleOutlined, CheckOutlined, CloseOutlined, EyeOutlined, StopOutlined, SyncOutlined } from "@ant-design/icons";
import { callUpdateBooking } from "@/config/api";
import ViewDetailBooking from "@/components/admin/booking/view.booking";

const BookingPage = () => {

    const tableRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IBooking | null>(null);

    const isFetching = useAppSelector(state => state.booking.isFetching);
    const meta = useAppSelector(state => state.booking.meta);
    const bookings = useAppSelector(state => state.booking.result);
    const dispatch = useAppDispatch();

    const reloadTable = () => {
        tableRef?.current?.reload();
    }


    const columns: ProColumns<IBooking>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },

        {
            title: 'Checkin',
            dataIndex: 'checkinDate',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.checkinDate ? dayjs(record.checkinDate).format('DD-MM-YYYY') : ""}</>
                )
            },
        },
        {
            title: 'Checkout',
            dataIndex: 'checkoutDate',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.checkoutDate ? dayjs(record.checkoutDate).format('DD-MM-YYYY') : ""}</>
                )
            },
        },

        {
            title: 'Status',
            dataIndex: 'status',
            render(dom, entity, index, action, schema) {
                const statusOptions = [
                    { key: 'COMPLETED', label: 'COMPLETED', color: 'green' },
                    { key: 'CANCELLED', label: 'CANCELLED', color: 'red' },
                    { key: 'PAYMENT_FAILED', label: 'PAYMENT_FAILED', color: 'volcano' }
                ];

                const handleStatusChange = (newStatus: string) => {
                    Modal.confirm({
                        title: 'Xác nhận cập nhật trạng thái',
                        content: `Bạn có chắc chắn muốn cập nhật trạng thái thành "${newStatus}" không?`,
                        okText: 'Xác nhận',
                        cancelText: 'Hủy',
                        onOk: async () => {
                            try {
                                const res = await callUpdateBooking(String(entity.id), newStatus);
                                if (isSuccessResponse(res) && res.status === 200) {
                                    message.success(`Cập nhật trạng thái thành công!`);
                                    reloadTable();
                                } else {
                                    const resErr = res as IBackendError;
                                    notification.error({
                                        message: 'Có lỗi xảy ra',
                                        description: resErr.detail,
                                        duration: 2
                                    });
                                }
                            } catch (error) {
                                notification.error({
                                    message: 'Có lỗi xảy ra',
                                    description: 'Có lỗi xảy ra khi cập nhật trạng thái!',
                                    duration: 2
                                });
                            }
                        }
                    });
                };

                const menuItems = statusOptions
                    .filter(option => option.key !== entity.status)
                    .map(option => ({
                        key: option.key,
                        label: (
                            <div onClick={() => handleStatusChange(option.key)}>
                                <Tag color={option.color}>{option.label}</Tag>
                            </div>
                        )
                    }));

                return (
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        placement="bottomLeft"
                    >
                        <Tag 
                            color={colorBookingStatus(entity.status)}
                            style={{ cursor: 'pointer' }}
                        >
                            {
                                (() => {
                                    if (entity.status === 'PAYMENT_PROCESSING') {
                                        return <SyncOutlined spin onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                                    } 
                                    else if (entity.status === 'PAYMENT_FAILED') {
                                        return <StopOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                                    }
                                    else if (entity.status === 'CANCELLED') {
                                        return <CloseOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                                    }
                                    else if (entity.status === 'BOOKED') {
                                        return <CheckOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                                    }
                                    else if (entity.status === 'COMPLETED') {
                                        return <CheckCircleOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                                    }
                                })()
                            }
                            {" " + entity.status}
                        </Tag>
                    </Dropdown>
                )
            },
            hideInSearch: true,
        },

        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            sorter: true,
            render: (dom: React.ReactNode, entity: IBooking) => {
                return formatCurrency(entity.totalAmount);
            },
            hideInSearch: true,
        },
        {
            title: 'Tên khách',
            dataIndex: ['user', 'fullName'],
            hideInSearch: true,
        },
        {
            title: 'Homestay name',
            dataIndex: ['homestay', 'name'],
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 100,
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access
                        permission={ALL_PERMISSIONS.BOOKING.GET_BY_ID}
                        hideChildren
                    >
                        <EyeOutlined 
                            style={{
                                fontSize: 20,
                                color: '#315f5dff',
                            }}
                            type=""
                            onClick={() => {
                                setOpenViewDetail(true);
                                setDataInit(entity); 
                            }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                        />
                    </Access >
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }


        const clone = { ...params };
        let filterConditions = [];

        if (clone.checkinDate) {
            const cleanCheckinDate = clone.checkinDate.replace(/^like:/, '');
            const parsedDate = dayjs(cleanCheckinDate, ['YYYY-MM-DD', 'DD-MM-YYYY'], true);
            const formattedDate = parsedDate.format('YYYY-MM-DD');
            filterConditions.push(`${sfLike("checkinDate", formattedDate)}`);
        }
        if (clone.checkoutDate) {
            const cleanCheckoutDate = clone.checkoutDate.replace(/^like:/, '');
            const parsedDate = dayjs(cleanCheckoutDate, ['YYYY-MM-DD', 'DD-MM-YYYY'], true);
            const formattedDate = parsedDate.format('YYYY-MM-DD');
            filterConditions.push(`${sfLike("checkoutDate", formattedDate)}`);
        }
        q.filter = filterConditions.length > 0 ? filterConditions.join(" and ") : "";


        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.checkinDate) {
            sortBy = sort.checkinDate === 'ascend' ? "sort=checkinDate,asc" : "sort=checkinDate,desc";
        }
        if (sort && sort.checkoutDate) {
            sortBy = sort.checkoutDate === 'ascend' ? "sort=checkoutDate,asc" : "sort=checkoutDate,desc";
        }
        if (sort && sort.totalAmount) {
            sortBy = sort.totalAmount === 'ascend' ? "sort=totalAmount,asc" : "sort=totalAmount,desc";
        }

        //mặc định sort theo checkinDate
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=id,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.BOOKING.GET_ALL}
            >
                <DataTable<IBooking>
                    actionRef={tableRef}
                    headerTitle="Danh sách Bookings"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={bookings}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchBooking({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {

                    }}
                />
            </Access>
            <ViewDetailBooking
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default BookingPage;