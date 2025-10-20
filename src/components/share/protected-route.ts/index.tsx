import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import NotPermitted from "./not-permitted";
import Loading from "../loading";
import { message } from "antd";

const RoleBaseRoute = (props: any) => {
    const user = useAppSelector(state => state.account.user);
    const userRole = user.role.name;
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');

    if (userRole !== 'USER' && isAdminPath) {
        return (<>{props.children}</>)
    } 
    else if (!isAdminPath) {
        return (<>{props.children}</>)
    }
    else {
        return (<NotPermitted />)
    }
}

const ProtectedRoute = (props: any) => {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated)
    const isLoading = useAppSelector(state => state.account.isLoading)
    const location = useLocation();

    // Show warning once when user is not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            message.open({
                type: 'warning',
                content: 'Vui lòng đăng nhập để tiếp tục!',
                key: 'login-warning', // stable key to avoid duplicates
                duration: 2,
            });
        }
    }, [isLoading, isAuthenticated, location.pathname]);

    return (
        <>
            {isLoading === true ?
                <Loading />
                :
                <>
                    {isAuthenticated === true?
                        <>
                            <RoleBaseRoute>
                                {props.children}
                            </RoleBaseRoute>
                        </>
                        : <>
                        <Navigate to='/login' replace />
                        </>
                    }
                </>
            }
        </>
    )
}

export default ProtectedRoute;