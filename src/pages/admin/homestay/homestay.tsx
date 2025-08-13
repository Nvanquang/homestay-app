import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchHomestay } from "@/redux/slice/homestaySlide";
import { IBackendError, IHomestay } from "@/types/backend";
import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import { callDeleteHomestay } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import { isSuccessResponse } from "@/config/utils";
import ModalHomestay from "@/components/admin/homestay/modal.homestay";

interface HomestayPageProps {
  setActiveKey: (key: string) => void;
  setOpenViewAvailabity: (value: boolean) => void;
  setInitHomestayId: (id: string | null) => void;
  setHomestayName: (name: string) => void;
}

const HomestayPage = ({ setActiveKey, setOpenViewAvailabity, setInitHomestayId, setHomestayName }: HomestayPageProps) => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IHomestay | null>(null);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.homestay.isFetching);
    const meta = useAppSelector(state => state.homestay.meta);
    const homestays = useAppSelector(state => state.homestay.result);
    const dispatch = useAppDispatch();

    const handleDeleteHomestay = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteHomestay(id);
            if (isSuccessResponse(res) && +res.status === 200) {
                message.success('Xóa Homestay thành công');
                reloadTable();
            } else {
                const errRes = res as IBackendError;
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: errRes.detail
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IHomestay>[] = [
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
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render(dom, entity, index, action, schema) {
                return (
                    <Tag
                        color={
                            entity.status === "ACTIVE"
                                ? "blue"
                                : entity.status === "INACTIVE"
                                    ? "lime"
                                    : entity.status === "CLOSED"
                                        ? "red"
                                        : "default"
                        }
                    >
                        {entity.status}
                    </Tag>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Guests',
            dataIndex: 'guests'
        },
        {
            title: 'Actions',
            hideInSearch: true,
            width: 100,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.AVAILABILITY.CREATE} hideChildren>
                        <CalendarOutlined
                            style={{ fontSize: 20, color: '#1890ff' }}
                            onClick={() => {
                                setOpenViewAvailabity(true);
                                setInitHomestayId(String(entity.id));
                                setActiveKey('2'); // Chuyển sang tab AvailabilityPage
                                setHomestayName(entity.name);
                                message.success(`Mở lịch sẵn có cho homestay ${entity.name}`);
                            }}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        />
                    </Access>
                    <Access
                        permission={ALL_PERMISSIONS.HOMESTAY.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        />
                    </Access>
                    <Access
                        permission={ALL_PERMISSIONS.HOMESTAY.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa homestay"}
                            description={"Bạn có chắc chắn muốn xóa homestay này ?"}
                            onConfirm={() => handleDeleteHomestay(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.address) {
            q.filter = clone.name
                ? q.filter + " and " + `${sfLike("address", clone.address)}`
                : `${sfLike("address", clone.address)}`;
        }

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.address) {
            sortBy = sort.address === 'ascend' ? "sort=address,asc" : "sort=address,desc";
        }

        // Mặc định sort theo updatedAt
        if (!sortBy) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access permission={ALL_PERMISSIONS.HOMESTAY.GET_ALL}>
                <DataTable<IHomestay>
                    actionRef={tableRef}
                    headerTitle="Danh sách Homestay"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={homestays}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        const result = await dispatch(fetchHomestay({ query })).unwrap();
                        return {
                            data: result.data,
                            success: true,
                            total: result.data?.meta.total,
                        };
                    }}
                    scroll={{ x: true }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => {
                            return <div>{range[0]}-{range[1]} trên {total} rows</div>;
                        },
                    }}
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Access permission={ALL_PERMISSIONS.HOMESTAY.CREATE} hideChildren>
                                <Button
                                    icon={<PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                                    type="primary"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Thêm mới
                                </Button>
                            </Access>
                        );
                    }}
                />
            </Access>
            <ModalHomestay
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}

export default HomestayPage;