import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    ApiOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BugOutlined,
    AntDesignOutlined,
    HeartTwoTone,
    HomeOutlined,
    BarChartOutlined,
    BookOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { Footer } from 'antd/es/layout/layout';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);

    const permissions = useAppSelector(state => state.account.user.role.permissions);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
        if (permissions?.length || ACL_ENABLE === 'false') {

            const viewUser = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.USER.GET_ALL.apiPath
                && item.method === ALL_PERMISSIONS.USER.GET_ALL.method
            )

            const viewHomestay = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.HOMESTAY.GET_ALL.apiPath
                && item.method === ALL_PERMISSIONS.HOMESTAY.GET_ALL.method
            )

            const viewRole = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ROLE.GET_ALL.apiPath
                && item.method === ALL_PERMISSIONS.ROLE.GET_ALL.method
            )

            const viewPermission = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PERMISSION.GET_ALL.apiPath
                && item.method === ALL_PERMISSIONS.USER.GET_ALL.method
            )

            const full = [
                {
                    label: <Link to='/admin'>Dashboard</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                },

                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>User</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                }] : []),
                ...(viewHomestay || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/homestay'>Homestay</Link>,
                    key: '/admin/homestay',
                    icon: <HomeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                }] : []),
                ...(viewHomestay || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/booking'>Booking</Link>,
                    key: '/admin/booking',
                    icon: <BookOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                }] : []),
                ...(viewHomestay || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/transaction'>Transaction</Link>,
                    key: '/admin/transaction',
                    icon: <BarChartOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                }] : []),
                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Permission</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                }] : []),
                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/role'>Role</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                }] : []),



            ];

            setMenuItems(full);
        }
    }, [permissions])
    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.status === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    // if (isMobile) {
    //     items.push({
    //         label: <label
    //             style={{ cursor: 'pointer' }}
    //             onClick={() => handleLogout()}
    //         >Đăng xuất</label>,
    //         key: 'logout',
    //         icon: <LogoutOutlined />
    //     })
    // }

    const itemsDropdown = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },
    ];

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >
                {!isMobile ?
                    <Sider
                        theme='light'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}>
                        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                            <AntDesignOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />  ADMIN
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={(e) => setActiveMenu(e.key)}
                        />
                    </Sider>
                    :
                    <Menu
                        selectedKeys={[activeMenu]}
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                        mode="horizontal"
                    />
                }

                <Layout>
                    {!isMobile &&
                        <div className='admin-header' style={{ display: "flex", justifyContent: "space-between", marginRight: 20 }}>
                            <Button
                                type="text"
                                icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: "pointer" }}>
                                    Welcome {user?.name}
                                    <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar>

                                </Space>
                            </Dropdown>
                        </div>
                    }
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                    <Footer style={{ padding: 10, textAlign: 'center' }}>
                        React Typescript quang - Made with <HeartTwoTone onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                    </Footer>
                </Layout>
            </Layout>

        </>
    );
};

export default LayoutAdmin;