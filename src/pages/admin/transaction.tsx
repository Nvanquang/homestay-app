import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IPaymentTransaction } from "@/types/backend";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Tag } from "antd";
import { useRef } from 'react';
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import dayjs from "dayjs";
import { fetchTransaction } from "@/redux/slice/transactionSlide";
import { CheckCircleOutlined } from "@ant-design/icons";
import { formatCurrency } from "@/config/utils";

const TransactionPage = () => {

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.transaction.isFetching);
    const meta = useAppSelector(state => state.transaction.meta);
    const transactions = useAppSelector(state => state.transaction.result);
    const dispatch = useAppDispatch();

    const columns: ProColumns<IPaymentTransaction>[] = [
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
            title: 'Trans ID',
            dataIndex: 'transactionId'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render(dom, entity, index, action, schema) {
                return <>
                    <Tag color={entity.status === "00" ? 'blue' : 'red'} >
                        {entity.status === '00' 
                        ? <CheckCircleOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} /> 
                        : null}
                        {entity.status === "00" ? ' SUCCESS' : ' FAILD'}
                    </Tag>
                </>
            },
            hideInSearch: true,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            sorter: true,
            render: (dom: React.ReactNode, entity: IPaymentTransaction) => {
                return formatCurrency(entity.amount);
            },
            hideInSearch: true,
        },
        {
            title: 'Response',
            dataIndex: 'responseMessage',
            hideInSearch: true,
        },
        {
            title: 'Request ID',
            dataIndex: 'requestId'
        },
        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
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

        if (clone.transactionId) {
            filterConditions.push(`${sfLike("transactionId", clone.transactionId)}`);
        }
        if (clone.requestId) {
            filterConditions.push(`${sfLike("requestId", clone.requestId)}`);
        }
        q.filter = filterConditions.length > 0 ? filterConditions.join(" and ") : "";


        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.amount) {
            sortBy = sort.amount === 'ascend' ? "sort=amount,asc" : "sort=amount,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }

        //mặc định sort theo checkinDate
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=createdAt,asc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.PAYMENT.GET_ALL}
            >
                <DataTable<IPaymentTransaction>
                    actionRef={tableRef}
                    headerTitle="Danh sách Transaction"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={transactions}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchTransaction({ query }))
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

export default TransactionPage;