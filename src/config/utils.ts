import { IBackendError, IBackendRes, IModelPaginate, IPermission } from '@/types/backend';
import { grey, green, blue, red, orange, volcano } from '@ant-design/colors';
import { groupBy, map } from 'lodash';

export const nonAccentVietnamese = (str: string) => {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}


export const convertSlug = (str: string) => {
    str = nonAccentVietnamese(str);
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
    const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

export function colorMethod(method: "POST" | "PATCH" | "GET" | "DELETE" | string) {
    switch (method) {
        case "POST":
            return green[6]
        case "PATCH":
            return orange[6]
        case "GET":
            return blue[6]
        case "DELETE":
            return red[6]
        default:
            return grey[10];
    }
}

export function colorBookingStatus(status: string) {
    switch (status) {
        case 'DRAFT':
            return "grey"; 
        case 'BOOKED':
            return "blue";
        case 'COMPLETED':
            return "green"; 
        case 'CANCELLED':
            return "red"; 
        case 'PAYMENT_PROCESSING':
            return "orange"; 
        case 'PAYMENT_FAILED':
            return "volcano"; 
        default:
            return "grey"; 
    }
}

export function isSuccessResponse<T>(res: IBackendRes<T> | IBackendError): res is IBackendRes<T> {
  return 'data' in res;
}

export const groupByPermission = (data: any[]): { module: string; permissions: IPermission[] }[] => {
    const groupedData = groupBy(data, x => x.module);
    return map(groupedData, (value, key) => {
        return { module: key, permissions: value as IPermission[] };
    });
};

export interface PopularLocation {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  description?: string;
  image?: string;
}

export const POPULAR_LOCATIONS: PopularLocation[] = [
  {
    id: 'hanoi',
    name: 'Hà Nội',
    displayName: 'Hà Nội, Việt Nam',
    latitude: 21.0278,
    longitude: 105.8342,
    description: 'Thủ đô nghìn năm văn hiến',
    image: 'https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg'
  },
  {
    id: 'hcm',
    name: 'Hồ Chí Minh',
    displayName: 'Hồ Chí Minh, Việt Nam',
    latitude: 10.8231,
    longitude: 106.6297,
    description: 'Thành phố không ngủ',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Ho_Chi_Minh_City_panorama_2019_%28cropped2%29.jpg'
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    displayName: 'Đà Nẵng, Việt Nam',
    latitude: 16.0544,
    longitude: 108.2022,
    description: 'Thành phố đáng sống nhất Việt Nam',
    image: 'https://images.vietnamtourism.gov.vn/vn/images/2017/DaNangvedem.jpg'
  },
  {
    id: 'hoian',
    name: 'Hội An',
    displayName: 'Hội An, Quảng Nam',
    latitude: 15.8801,
    longitude: 108.3383,
    description: 'Phố cổ di sản thế giới',
    image: 'https://dntt.mediacdn.vn/197608888129458176/2021/9/17/hoi-an-ve-dem-1-1582879781297957162122-1582943278401-15829432784021542260068-16318723727751114737054.gif'
  },
  {
    id: 'nhatrang',
    name: 'Nha Trang',
    displayName: 'Nha Trang, Khánh Hòa',
    latitude: 12.2388,
    longitude: 109.1967,
    description: 'Vịnh biển đẹp nhất thế giới',
    image: 'https://cdnen.thesaigontimes.vn/wp-content/uploads/2023/04/An-aerial-view-of-the-glittering-coastal-city-of-Nha-Trang.jpg'
  },
  {
    id: 'phuquoc',
    name: 'Phú Quốc',
    displayName: 'Phú Quốc, Kiên Giang',
    latitude: 10.3460,
    longitude: 103.9195,
    description: 'Đảo ngọc Việt Nam',
    image: 'https://hanoivoyage.com/uploads//Blogs/Vietnam/EN-image-cover/phu-quoc-2-3-days-01.webp'
  },
  {
    id: 'sapa',
    name: 'Sapa',
    displayName: 'Sapa, Lào Cai',
    latitude: 22.3364,
    longitude: 103.8440,
    description: 'Thành phố trong sương mù',
    image: 'https://vietlandtravel.vn/upload/img/products/05032025/sapavietnam.jpg'
  },
  {
    id: 'dalat',
    name: 'Đà Lạt',
    displayName: 'Đà Lạt, Lâm Đồng',
    latitude: 11.9404,
    longitude: 108.4583,
    description: 'Thành phố ngàn hoa',
    image: 'https://www.dalattrip.com/media/2012/10/Dalat-Vietnam-Dalat-central-lake.jpg'
  }
];

// Phone number validation utilities
export interface PhoneValidationConfig {
  // Vietnamese phone number patterns
  vietnam: RegExp;
  // International E.164 format pattern for future extension
  international: RegExp;
}

export const PHONE_REGEX: PhoneValidationConfig = {
  // Simplified: allows 10 digits starting with 0 or +84 format
  vietnam: /^(\+84|0)\d{9}$/,
  // For easy extension to international E.164 format
  international: /^\+[1-9]\d{1,14}$/
};

/**
 * Validates Vietnamese phone number format
 * @param value - Phone number string to validate
 * @param allowEmpty - Whether to allow empty values (default: true)
 * @returns boolean indicating if phone number is valid
 */
export const validateVietnamesePhoneNumber = (value: string, allowEmpty: boolean = true): boolean => {
  if (!value) return allowEmpty;
  return PHONE_REGEX.vietnam.test(value);
};

/**
 * Validates international phone number format (E.164)
 * @param value - Phone number string to validate
 * @param allowEmpty - Whether to allow empty values (default: true)
 * @returns boolean indicating if phone number is valid
 */
export const validateInternationalPhoneNumber = (value: string, allowEmpty: boolean = true): boolean => {
  if (!value) return allowEmpty;
  return PHONE_REGEX.international.test(value);
};

/**
 * Cleans phone number input by removing invalid characters
 * @param value - Raw input value
 * @returns cleaned string with only numbers and + symbol
 */
export const cleanPhoneNumber = (value: string): string => {
  return value.replace(/[^0-9+]/g, '');
};

/**
 * Formats Vietnamese phone number from 0xxx to +84xxx format
 * @param phoneNumber - Phone number to format
 * @returns formatted phone number for backend
 */
export const formatPhoneForBackend = (phoneNumber: string): string => {
  if (!phoneNumber) return phoneNumber;
  
  // If starts with 0, replace with +84
  if (phoneNumber.startsWith('0')) {
    return '+84' + phoneNumber.substring(1);
  }
  
  // If already starts with +84, return as is
  if (phoneNumber.startsWith('+84')) {
    return phoneNumber;
  }
  
  // Default: return as is
  return phoneNumber;
};

/**
 * Gets appropriate error message for invalid phone number
 * @param type - Type of validation ('vietnam' | 'international')
 * @returns error message string
 */
export const getPhoneValidationErrorMessage = (type: 'vietnam' | 'international' = 'vietnam'): string => {
  switch (type) {
    case 'vietnam':
      return 'Số điện thoại phải có 10 số.';
    case 'international':
      return 'Số điện thoại không hợp lệ.';
    default:
      return 'Số điện thoại không hợp lệ';
  }
};

// Calculate membership duration based on createdAt
export const calculateMembershipDuration = (createdAt: Date | string | null | undefined): string => {
  if (!createdAt) return 'Chưa xác định';
  
  const createdDate = new Date(createdAt);
  const currentDate = new Date();
  
  const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${diffYears} năm ${remainingMonths} tháng`;
    }
    return `${diffYears} năm`;
  } else if (diffMonths > 0) {
    return `${diffMonths} tháng`;
  } else {
    return `${diffDays} ngày`;
  }
};
