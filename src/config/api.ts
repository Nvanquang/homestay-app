import { IBackendRes, IBackendError, IModelPaginate, IAccount, IGetAccount, IUser, IRole, IPermission, IHomestay, IHomestayImage, IBooking, IAmenity, IReview, IPaymentTransaction, IAvailabilityRequest, IHomestayAvailability, IReviewTotal } from '@/types/backend';
import axios from './axios-customize';

/**
 * 
Module Auth
 */
export const callRegister = async (userName: string, password: string, confirmPassword: string, email: string, phoneNumber: string, fullName: string, gender: string): Promise<IBackendRes<IUser> | IBackendError> => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { userName, password, confirmPassword, email, phoneNumber, fullName, gender })
}

export const callVeriryOtp = async (email: string, otp: string): Promise<IBackendRes<IUser> | IBackendError> => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/verify-otp', { email, otp })
}

export const callLogin = async (userName: string, password: string): Promise<IBackendRes<IAccount> | IBackendError> => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { userName, password })
        .then((res) => res)
        .catch((error) => error.response.data);
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account');
}

export const callRefreshToken = async (): Promise<IBackendRes<IAccount> | IBackendError> => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
        .then((res) => res)
        .catch((error) => error.response.data);
}

export const callLogout = async (): Promise<IBackendRes<string> | IBackendError> => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
        .then((res) => res)
        .catch((error) => error.response.data);
}



// AMENITY
export const callCreateAmenity = async (name: string): Promise<IBackendRes<IBooking> | IBackendError> => {
    return axios.post<IBackendRes<IAmenity>>('/api/v1/amenities', { name })
    .then((res) => res)
    .catch((error) => error.response.data);
};

export const callGetAmenityById = async (id: string): Promise<IBackendRes<IBooking> | IBackendError> => {
    return axios.get<IBackendRes<IAmenity>>(`/api/v1/amenities/${id}`)
    .then((res) => res)
    .catch((error) => error.response.data);
};

export const callGetAmenities = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IAmenity>>>(`/api/v1/amenities?${query}`);
};

export const callDeleteAmenity = async (id: string): Promise<IBackendRes<IBooking> | IBackendError> => {
    return axios.delete<IBackendRes<IAmenity>>(`/api/v1/amenities/${id}`)
    .then((res) => res)
    .catch((error) => error.response.data);
};



// BOOKING
export const callGetBookingById = async (id: string): Promise<IBackendRes<IBooking> | IBackendError> => {
    return axios.get<IBackendRes<IBooking>>(`/api/v1/bookings/${id}`)
    .then((res) => res)
    .catch((error) => error.response.data);
};

export const callGetBookingHistory = async (userId: number): Promise<IBackendRes<IBooking> | IBackendError> => {
    return axios.get<IModelPaginate<IBooking>>(`/api/v1/bookings/history/${userId}`)
    .then((res) => res)
    .catch((error) => error.response.data);
};

export const callGetBookingStatus = async (id: string): Promise<IBackendRes<IBooking> | IBackendError> => {
    return axios.get<IBackendRes<IBooking>>(`/api/v1/bookings/${id}/status`)
    .then((res) => res)
    .catch((error) => error.response.data);
};

export const callGetBookings = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IBooking>>>(`/api/v1/bookings?${query}`);
};

// export const callUpdateBooking = (id: string, data: { status?: string; paymentDate?: string }) => {
//     return axios.patch<IBackendRes<IBooking>>(`/api/v1/bookings/${id}`, { id, ...data });
// };



// HOMESTAY
export const callCreateHomestay = async (
    homestay: IHomestay,
    files: File[],
    folder: string = "homestay"
) => {
    const formData = new FormData();
    formData.append(
        "homestay",
        new Blob([JSON.stringify(homestay)], { type: "application/json" })
    );
    files.forEach(file => {
        formData.append("files", file);
    });
    formData.append("folder", folder);

    return axios.post<IBackendRes<IHomestay>>("/api/v1/homestays", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetHomestayById = async (id: string): Promise<IBackendRes<IHomestay> | IBackendError> => {
    return axios.get<IBackendRes<IHomestay>>(`/api/v1/homestays/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callSearchHomestays = async (params: {
    longitude?: number;
    latitude?: number;
    radius?: number;
    checkinDate?: string;
    checkoutDate?: string;
    guests?: number;
    status?: string;
}): Promise<IBackendRes<IPermission> | IBackendError> => {
    return axios.get<IBackendRes<IModelPaginate<IHomestay>>>('/api/v1/homestays/search', { params })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetHomestays = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IHomestay>>>(`/api/v1/homestays?${query}`);
};

export const callAddAmenitiesToHomestay = (homestayId: string, amenities: string[]) => {
    return axios.post<IBackendRes<IHomestay>>(`/api/v1/homestays/${homestayId}/amenities`, { amenities });
};

export const callUpdateHomestay = async (
    id: string, 
    homestay: IHomestay,
    files: File[],
    folder: string = "homestay"

): Promise<IBackendRes<IPermission> | IBackendError> => {

    const formData = new FormData();
    formData.append(
        "homestay",
        new Blob([JSON.stringify(homestay)], { type: "application/json" })
    );
    files.forEach(file => {
        formData.append("files", file);
    });
    formData.append("folder", folder);

    return axios.patch<IBackendRes<IHomestay>>(`/api/v1/homestays/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callDeleteHomestay = async (id: string): Promise<IBackendRes<IPermission> | IBackendError> => {
    return axios.delete<IBackendRes<IHomestay>>(`/api/v1/homestays/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};



// HOMESTAY_IMAGE
export const callUploadHomestayImages = async (
    homestayId: string,
    files: File[],
    folder: string
): Promise<IBackendRes<IPermission> | IBackendError> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append("files", file);
    });
    formData.append("folder", folder);
    return axios.post<IBackendRes<IHomestayImage>>(`/api/v1/homestay/${homestayId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetHomestayImages = (homestayId: number) => {
    return axios.get<IBackendRes<IBackendRes<IHomestayImage>>>(`/api/v1/homestay/${homestayId}/images`);
};

export const callDeleteHomestayImage = (id: string) => {
    return axios.delete<IBackendRes<IHomestayImage>>(`/api/v1/homestay-images/${id}`);
};



// PERMISSION
export const callCreatePermission = async (data: IPermission): Promise<IBackendRes<IPermission> | IBackendError> => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', data)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetPermissionById = async (id: string): Promise<IBackendRes<IPermission> | IBackendError> => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetPermissions = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
};

export const callUpdatePermission = async (id: string, data: IPermission): Promise<IBackendRes<IPermission> | IBackendError> => {
    return axios.patch<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`, { id, ...data })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callDeletePermission = async (id: string): Promise<IBackendRes<IPermission> | IBackendError> => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};



// ROLE
export const callCreateRole = async (data: IRole): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', data)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callAddPermissionsToRole = async (id: string, data: IRole): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.post<IBackendRes<IRole>>(`/api/v1/roles/${id}/permissions`, { id, ...data })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetRoleById = async (id: string): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetRoles = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
};

export const callUpdateRole = async (id: string, data: IRole): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.patch<IBackendRes<IRole>>(`/api/v1/roles/${id}`, { id, ...data })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callDeleteRolePermissions = async (id: string, permissions: number[]): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}/permissions`, { data: { id, permissions } })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callDeleteRole = async (id: string): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};



// USER
export const callCreateUser = async (data: {
    userName: string;
    password: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    gender: string;
    roleId: number;
}): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', data)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetUserById = async (id: string): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.get<IBackendRes<IUser>>(`/api/v1/users/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetUsers = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
};

export const callUpdateUser = async (id: string, data: {
    gender?: string;
    userName?: string;
    fullName?: string;
    phoneNumber?: string;
    verified?: boolean;
    roleId?: string;
}): Promise<IBackendRes<IRole> | IBackendError> => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/${id}`, { id, ...data })
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callDeleteUser = async (id: string) => {
    return axios.delete(`/api/v1/users/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};



// REVIEW
export const callCreateReview = (data: IReview) => {
    return axios.post<IBackendRes<IReview>>('/api/v1/reviews', data);
};

export const callGetReviewsByHomestay = (homestayId: string, query?: string) => {
    return axios.get<IBackendRes<IModelPaginate<IReview>>>(`/api/v1/reviews/homestay/${homestayId}?${query}`);
};

export const callGetReviewTotal = async (homestayId: string): Promise<IBackendRes<IReviewTotal> | IBackendError> => {
    return axios.get<IBackendRes<IReviewTotal>>(`/api/v1/reviews/homestay/${homestayId}/total`)
        .then((res) => res)
        .catch((error) => error.response.data);
};


// TRANSACTIONAL
export const callGetTransactionById = async (id: string): Promise<IBackendRes<IPaymentTransaction> | IBackendError> => {
    return axios.get<IBackendRes<IPaymentTransaction>>(`/api/v1/payments/${id}`)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetTransactions = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPaymentTransaction>>>(`/api/v1/payments?${query}`);
};


// HOMESTAY AVAILABILITY
export const callCreateAvailability = async (data: IAvailabilityRequest): Promise<IBackendRes<IAvailabilityRequest> | IBackendError> => {
    return axios.post<IBackendRes<IAvailabilityRequest>>('/api/v1/availabilities', data)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callUpdateAvailability = async (data: IHomestayAvailability): Promise<IBackendRes<IHomestayAvailability> | IBackendError> => {
    return axios.patch<IBackendRes<IHomestayAvailability>>('/api/v1/availabilities', data)
        .then((res) => res)
        .catch((error) => error.response.data);
};

export const callGetAvailabilities = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IHomestayAvailability>>>(`/api/v1/availabilities?${query}`);
};
