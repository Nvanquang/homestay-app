import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IBooking } from "@/types/backend";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Spin, Tag } from "antd";
import { useRef } from 'react';
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import { fetchBooking } from "@/redux/slice/bookingSlide";
import { colorBookingStatus } from "@/config/utils";
import dayjs from "dayjs";
import { LoadingOutlined } from "@ant-design/icons";

const BookingPage = () => {

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.booking.isFetching);
    const meta = useAppSelector(state => state.booking.meta);
    const bookings = useAppSelector(state => state.booking.result);
    const dispatch = useAppDispatch();


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
                return <>
                    <Tag color={colorBookingStatus(entity.status)} >
                        {entity.status !== 'BOOKED' 
                        ? <Spin indicator={<LoadingOutlined spin onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} size="small" /> 
                        : null}

                        {" " + entity.status}
                    </Tag>
                </>
            },
            hideInSearch: true,
        },

        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            sorter: true,
            render: (dom: React.ReactNode, entity: IBooking) => {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(entity.totalAmount);
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
            temp = `${temp}&sort=checkinDate,desc`;
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
        </div >
    )
}

export default BookingPage;