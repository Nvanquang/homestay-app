export interface IBackendRes<T> {
    status: number | string;
    message: string;
    data?: T;
    timestamp: date;
}

export interface IBackendError {
    type: string;
    title: string;
    status: number | string;
    detail: string;
    message: string;
    params: string;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

// Auth & User
export interface IAccount {
    access_token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: {
            id?: string;
            name?: string;
            description?: string;
            active?: boolean;
            createdAt?: Date | null;
            createdBy?: string;
            updatedAt?: Date | null;
            updatedBy?: string;
            permissions?: {
                id: string;
                name: string;
                apiPath?: string;
                method?: string;
                module?: string;
            }[]
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface IUser {
    id?: string;
    userName: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber: string;
    fullName: string;
    gender: string;
    createdAt?: Date | null;
    createdBy?: string;
    updatedAt?: Date | null;
    updatedBy?: string;
    role?: {
        id: string;
        name: string;
    }

}

// Role & Permission
export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | number[];

    createdAt?: Date | null;
    createdBy?: string;
    updatedAt?: Date | null;
    updatedBy?: string;
}

export interface IPermission {
    id?: string | number;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdAt?: Date | null;
    createdBy?: string;
    updatedAt?: Date | null;
    updatedBy?: string;
}

// Homestay
export interface IHomestay {
    id?: string;
    name: string;
    description: string;
    status: string; 
    guests: number;
    phoneNumber?: string;
    address?: string;
    longitude?: number; 
    latitude?: number;  
    images?: string[];
    deletedImages?: string[] | null; 
    amenities?: IAmenity[] | number[]; 
    createdAt?: Date | null;
    createdBy?: string;
    updatedAt?: Date | null;
    updatedBy?: string;
}

export interface ISearchHomestayRequest {
    longitude?: number;
    latitude?: number;
    radius?: number;
    checkinDate?: string;
    checkoutDate?: string;
    guests?: number;
    status?: string;
}

export interface ISearchHomestayResponse {
    id?: string;
    name: string;
    description: string;
    guests: number;
    status: string;
    phoneNumber: string;
    nightAmount: number;
    totalAmount: number;
    address: string;
    longitude: number;
    latitude: number;
    images: string[];
    amenities: number[];
}

// Homestay Image
export interface IHomestayImage {
    id?: string;
    imageUrl: string;
    publicId: string;
}

// Booking
export interface IBooking {
    id?: string;
    checkinDate: string;
    checkoutDate: string;
    guests: number;
    status: string;
    subtotal: number;
    fee: number;
    discount: number;
    totalAmount: number;
    note: string;
    user: {
        id: number;
        fullName: string;
    };
    homestay: {
        id: number;
        name: string;
        address: string;
    };
}

    export interface IBookingStatus {
        bookingId: string;
        userId: string;
        homestayId: string;
        status: string;
    }

export interface IVnpayBookingResponse {
    booking: IBooking;
    payment: {
        vnpUrl: string;
    }
}

// Amenity
export interface IAmenity {
    id?: string;
    name: string;
}

// Review
export interface IReview {
    rating: number;
    comment?: string;
    postingDate: Date | null;
    hostReply?: string;
    homestayId?: string;
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
    }
}

export interface IReviewTotal {
    totalReviews: number;
    averageRating: number;
}

// Payment
export interface IPaymentTransaction {
    id: string;
    transactionId: string;
    status: string;
    amount: number;
    responseMessage: string;
    requestId: string;
    createdAt: Date | null;
}


// Homestay Availability
export interface IHomestayAvailability {
    homestayId: number | string;
    date: string | null;
    price: number;
    status: string;
}

export interface IAvailabilityRequest {
    homestayId: string;
    dates: Date[] | null;
    price: number;
    status: string;
}
