import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Geocode from 'react-geocode';
import { useAppDispatch } from '../app/redux/hooks';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { setValidationErrors } from '../common/redux/reducer/commonSlices/driverSlice';

export interface PaginationModel {
  page: number;
  pageSize: number;
  tour?: number;
}

const apiKey = String(import.meta.env.VITE_APP_GOOGLE_MAP_API_KEY);
Geocode.setApiKey(apiKey);

type LatLng = { lat: number; lng: number };

export const usePagination = (initialPageSize = 5, initialPageNo = 1) => {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageNo, setPageNo] = useState(initialPageNo);

  const pagination = (newPaginationModel: PaginationModel) => {
    const { pageSize: newPageSize, page: newPageNo, tour: tour } = newPaginationModel;
    setPageSize(newPageSize);
    setPageNo(newPageNo + 1);

    const data = {
      ...newPaginationModel,
      pageNo: newPageNo + 1,
      pageSize: newPageSize
    };
    return data;
  };

  return { pageSize, pageNo, setPageSize, setPageNo, pagination };
};

// function to calculate zoom from array of coordinates
export const calculateZoom = (paths: { lat: number; lng: number }[]) => {
  if (paths.length === 1 || paths.length === 0) return 12;

  const center = paths.reduce(
    (acc, point) => {
      acc.lat += point.lat;
      acc.lng += point.lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  center.lat /= paths.length;
  center.lng /= paths.length;

  // calculate the distance from the center to each vertex and find the maximum distance
  let maxDistance = 0;

  for (const point of paths) {
    const R = 6371; // earth's radius in km
    const lat1 = center.lat;
    const lon1 = center.lng;
    const lat2 = point.lat;
    const lon2 = point.lng;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // distance in km

    if (distance > maxDistance) maxDistance = distance;
  }
  let newRadius = (maxDistance + maxDistance) / 2;
  let scale = newRadius / 100;
  let zoom = parseInt((9 - Math.log(scale) / Math.log(2)).toFixed(0));
  return zoom - 1;
};

// function to calculate center from array of coordinates
export const calculateCenter = (
  paths: { lat: number; lng: number }[]
): { lat: number; lng: number } | null => {
  if (paths?.length === 0) return { lat: 13.0827, lng: 80.2707 };
  const { lat, lng } = paths?.reduce(
    (acc, path) => ({
      lat: acc?.lat + path?.lat,
      lng: acc?.lng + path?.lng
    }),
    { lat: 0, lng: 0 }
  );
  return { lat: lat / paths.length, lng: lng / paths.length };
};

// function for calculate distance and duration
export const calculateDistanceAndDuration = (
  points: LatLng[],
  averageSpeedKmH = 40
): { distance: number; duration: number } => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  let totalDistanceKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const { lat: lat1, lng: lon1 } = points[i];
    const { lat: lat2, lng: lon2 } = points[i + 1];
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistanceKm += R * c;
  }
  const totalDistanceMeters = totalDistanceKm * 1000;
  const durationSeconds = (totalDistanceKm / averageSpeedKmH) * 3600;
  return {
    distance: Math.round(totalDistanceMeters),
    duration: Math.round(durationSeconds)
  };
};

export const calculatePercentage = (start: number, current: number): number => {
  if (start === 0) return 100;
  const difference = start - current;
  const percentage = (difference / start) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
};

export const metersToKilometers = (meters: number): string => {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
};

export const secondsToHrMin = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  } else {
    return `${mins} min`;
  }
};

//function epoch to time
export const convertEpochToTime = (epoch: number) => {
  const date = new Date(epoch / 1000);
  let hours = date.getHours();

  const minutes = ('0' + date.getMinutes()).slice(-2);

  let ampm = 'AM';
  if (hours >= 12) {
    ampm = 'PM';
    hours %= 12;
  }
  if (hours === 0) {
    hours = 12;
  }

  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return formattedTime;
};

// functions to convert epoch to date and time
export function epochToDate(epoch: number): string {
  const date = new Date(epoch * 1000); // Convert seconds to milliseconds
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

// functions to convert epoch to date
export function epochToDateFormat(epoch: number): string {
  const date = new Date(epoch * 1000); // Convert seconds to milliseconds
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  const day = ('0' + date.getDate()).slice(-2);
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}

export function epochToDateFormatSg(epoch: number, timeZone: string = 'UTC'): string {
  return dayjs.unix(epoch).tz(timeZone).format('DD/MM/YYYY');
}

// epoch to time
export function epochToTimeFormat(epoch: number, timeZone: string = 'UTC'): string {
  return dayjs.unix(epoch).tz(timeZone).format('hh:mm A');
}

// function for today epoch Date with 12:00 AM
export function getTodayEpoch(timeZone: string = 'UTC'): number {
  return dayjs().tz(timeZone).startOf('day').unix();
}

// function for tomorrow epoch Date with 12:00 AM
export function getTomorrowEpoch(timeZone: string = 'UTC'): number {
  return dayjs().tz(timeZone).add(1, 'day').startOf('day').unix();
}

export function getEpochFromDateStart(
  dateStr: string,
  timeZone: string = 'UTC'
): number | null {
  const parsedDate = dayjs.tz(dateStr, 'DD-MMM-YY', timeZone);
  if (!parsedDate.isValid()) {
    return null;
  }
  return parsedDate.startOf('day').unix();
}

export const getCurrentDate = (timeZone: string = 'UTC'): string => {
  return dayjs().tz(timeZone).format('dddd, MMMM D, YYYY');
};

export const getEpochToDate = (epoch: number, timeZone: string = 'UTC'): string => {
  const timestamp = epoch < 1e12 ? epoch * 1000 : epoch;
  return dayjs(timestamp).tz(timeZone).format('dddd, MMMM D, YYYY');
};

// functions to convert epoch(milliseconds) to date
export function epochToDateFormatMilli(epoch: number): string {
  const date = new Date(epoch);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  const day = ('0' + date.getDate()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}

//function to convert date string to epoch
export const convertToEpoch2 = (dateString: Date | null): number | null => {
  if (dateString === null) return null;

  const date = dayjs(dateString);
  const epochTimeInSeconds = date.isValid()
    ? Math.floor(date.toDate().getTime() / 1000)
    : null;
  return epochTimeInSeconds;
};

// function to convert 'DD/MM/YYYY' to epoch
export const convertToEpoch3 = (dateString: string | null | Dayjs): number | null => {
  if (dateString === null) return null;
  const date = dayjs(dateString, 'DD/MM/YYYY');
  const epochTimeInSeconds = date.isValid()
    ? Math.floor(date.toDate().getTime() / 1000)
    : null;
  return epochTimeInSeconds;
};

export const convertToEpoch4 = (
  dateString: string | null | Dayjs,
  timeZone: string = 'UTC'
): number | null => {
  if (!dateString) return null;
  const date = dayjs(dateString, 'DD/MM/YYYY').tz(timeZone).startOf('day');
  return date.isValid() ? Math.floor(date.valueOf() / 1000) : null; // Convert from milliseconds to seconds
};

//function to convert date string to epoch
export const convertToEpoch = (dateString: Date | null) => {
  const date = dayjs(dateString);
  const epochTimeInSeconds = date.isValid()
    ? Math.floor(date.toDate().getTime() / 1000)
    : null;
  return epochTimeInSeconds;
};

// function to get Date Format from DD-MM-YYYY to DD/MM/YYYY:
export const convert3 = (str: string | undefined): string => {
  if (!str) return '';

  const splitDate: string[] = str.split('-');
  const d: number = parseInt(splitDate[0], 10);
  const m: number = parseInt(splitDate[1], 10);
  const y: number = parseInt(splitDate[2], 10);

  const dateString: string =
    (d <= 9 ? '0' + d : d) + '/' + (m <= 9 ? '0' + m : m) + '/' + y;

  return dateString;
};

// function epoch to DAY, DD/MM/YYY
export const convertEpochToFormattedDate = (epoch: number): string => {
  const date = new Date(epoch * 1000);
  const day = date.toLocaleString('en-US', { weekday: 'short' });
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return `${day}, ${formattedDate}`;
};

// function to get Date Format from epoch to DD/MM/YYYY HH:MM A
export const convertEpochtoDate = (value: number) => {
  const dateObject = new Date(value); // Multiply by 1000 to convert seconds to milliseconds

  const formattedDateString = dateObject.toUTCString();
  return formattedDateString;
};

// function to get epoch form Date string to epoch
export const convertDatetoEpoch = (value: string) => {
  return new Date(value).getTime();
};

dayjs.extend(utc);
dayjs.extend(timezone);

export const convertDatetoEpochSg = (value: string, timeZone: string) => {
  const singaporeEpoch = dayjs(value).tz(timeZone).startOf('day').unix();
  return singaporeEpoch;
};

export const convertToSingaporeEpoch = (dateString: string) => {
  const indiaTime = new Date(dateString);
  const singaporeDate = new Date(
    indiaTime.toLocaleString('en-US', { timeZone: 'Asia/Singapore' })
  );
  // Subtract 2 hours and 30 minutes (in milliseconds)
  singaporeDate.setMinutes(singaporeDate.getMinutes() - 150);
  const singaporeEpoch = Math.floor(singaporeDate.getTime() / 1000);
  return singaporeEpoch;
};

// function to get epoch from DD/MM/YYYY HH:MM AM
export const convertDateTimetoEpoch = (value: string) => {
  const dateParts = value?.split(/[\/: ]/);
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Months are zero-indexed in JavaScript
  const year = parseInt(dateParts[2], 10);
  const hour =
    dateParts[5] === 'PM' && dateParts[3] !== '12'
      ? parseInt(dateParts[3], 10) + 12
      : parseInt(dateParts[3], 10);
  const minutes = parseInt(dateParts[4], 10);
  const adjustedHour = hour === 12 && dateParts[5] === 'AM' ? 0 : hour;
  const date = new Date(year, month, day, adjustedHour, minutes);
  const epochTime = date.getTime();
  return epochTime;
};

// function to DD/MM/YYYY from DD/MM/YYYY HH:MM AM
export const formatDateTimeToDate = (timestamp: string) => {
  const [datePart] = timestamp.split(' ');
  const [day, month, year] = datePart.split('/');
  return `${day}/${month}/${year}`;
};

// utils/dateUtils.ts
export const convertEpochStringDate = (epoch: number): string => {
  if (!epoch) return 'N/A';

  const date = new Date(epoch * 1000); // epoch in seconds
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const convertSecondsToTime = (seconds: number) => {
  const date = new Date(seconds * 1000);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesFormatted} ${ampm}`;
};

export const convertEpochtoDateandTime = (value: number) => {
  const dateObject = new Date(value);
  const formattedDateString = dateObject.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true // 12-hour clock format
  });

  return formattedDateString;
};

// convert IST time format to HH:MM
export const formatISTtoTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// convert 17:15 , 17:45 to 30(Min) time difference
export const getTimeDifferenceInMinutes = (time1: string, time2: string) => {
  const time1Obj = dayjs(`2000-01-01 ${time1}`);
  const time2Obj = dayjs(`2000-01-01 ${time2}`);
  const diffInMilliseconds = time2Obj.diff(time1Obj);
  return diffInMilliseconds / (1000 * 60);
};

// convert time to time range with 30 min different
export const getTimeRange = (startTime: any) => {
  if (!startTime || typeof startTime !== 'string') {
    return '';
  }

  const [hours, minutes] = startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return '';
  }
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);
  const formatTime = (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
      2,
      '0'
    )}`;
  return `${formatTime(start)}-${formatTime(end)}`;
};

// convert 14:30 to 02:30PM
export const convertTo12HourFormat = (time: string) => {
  const [hours, minutes] = time?.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export const convertTimeToSeconds = (timeStr: string) => {
  // Split the time string into hours and minutes
  const [hours, minutes] = timeStr.split(':').map(Number);
  // Convert hours and minutes to seconds
  return hours * 3600 + minutes * 60;
};

//convert TN76AB1816 to TN-76-AB-1816
export const convertVehicleNo = (value: string) => {
  let result = '';
  for (let i = 0; i < value?.length; i++) {
    const char = value[i];
    if (i > 0) {
      if (
        (char.match(/[a-zA-Z]/) && value[i - 1].match(/[0-9]/)) ||
        (char.match(/[0-9]/) && value[i - 1].match(/[a-zA-Z]/))
      ) {
        result += '-';
      }
    }
    result += char;
  }
  return result;
};
export const convertEpoctoTimeZoneDate = (epoc: number, timezone: string) => {
  if (!epoc || !timezone) return '-';
  try {
    return dayjs.unix(epoc).tz(timezone).format('DD-MM-YYYY hh:mm A');
  } catch (error) {
    return '-';
  }
};

//function to convert epoch time stamp to DD/MM/YYYY HH:MM:SS
export const convertEpochToDateTime = (epoch: number, timezone: string): string => {
  const date = new Date(epoch * 1000);

  // Create options object for toLocaleString
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  // Format the date
  const formattedDate = date.toLocaleString('en-IN', options).replace(',', '');

  const formattedDateUpperCase = formattedDate.replace(/\b(?:am|pm)\b/gi, match =>
    match.toUpperCase()
  );

  return formattedDateUpperCase;
};

//capitalize first letter
export function capitalizeFirstLetter(string: string) {
  return string
    ?.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// function to convert lat/lng to address
export const findAddress = async (lat: any, lng: any) => {
  let response = await Geocode?.fromLatLng(lat, lng);
  let address = await response?.results[0]?.formatted_address;
  return address;
};

//function to convert datestring to DD/MM/YYYY HH:MM AM/PM format
export const formatDate = (dateString: any, timezone?: string) => {
  // Parse the input date string
  const date = new Date(dateString);

  let day: string, month: string, year: string, hours: number, minutes: number;

  if (timezone) {
    // Format with timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(date);

    day = parts.find(part => part.type === 'day')?.value || '01';
    month = parts.find(part => part.type === 'month')?.value || '01';
    year = parts.find(part => part.type === 'year')?.value || '1970';
    hours = parseInt(parts.find(part => part.type === 'hour')?.value || '0');
    minutes = parseInt(parts.find(part => part.type === 'minute')?.value || '0');
  } else {
    // Extract date components (default behavior)
    day = String(date.getDate()).padStart(2, '0');
    month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    year = String(date.getFullYear());

    // Extract time components
    hours = date.getHours();
    minutes = date.getMinutes();
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert to 12-hour format
  const formattedMinutes = String(minutes).padStart(2, '0');

  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

  // Combine date and time
  const formattedDateTime = `${formattedDate} ${formattedTime}`;

  return formattedDateTime;
};

//function to convert datestring to DD/MM/YYYY 00:00 AM format
export const formatDateTime0 = (dateString: any) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const year = String(date.getFullYear());
  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = `00:00 AM`;
  const formattedDateTime = `${formattedDate} ${formattedTime}`;
  return formattedDateTime;
};

export const formatDateSg = (dateString: any, timeZone: string) => {
  const date = dayjs(dateString).tz(timeZone).startOf('day');
  const formattedDate = date.format('DD/MM/YYYY');
  const formattedTime = '12:00 AM';
  return `${formattedDate} ${formattedTime}`;
};

export function convertToEpochWithTimezone(dateStr: string, timeZone: string): number {
  return dayjs.tz(dateStr, 'D-MMM-YY', timeZone).valueOf() / 1000;
}

//function to convert datestring to DD/MM/YYYY format
export const formatDateOnly = (dateString: any) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  const formattedDate = `${day}/${month}/${year}`;
  const formattedDateTime = `${formattedDate}`;

  return formattedDateTime;
};

export const convertEpochToDateString = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  // const formattedHours = ('0' + (date.getHours() % 12 || 12)).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  const formattedHours = date.getHours() % 12 || 12;

  return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};
export const convertEpochToDateandTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  const formattedHours = date.getHours() % 12 || 12;

  return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

export const convertEpochToDateObject = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const ampm = date.getHours() >= 12 ? 'pm' : 'am';
  const formattedHours = date.getHours() % 12 || 12;

  const dateString = `${day}/${month}/${year}`;
  const timeString = `${formattedHours}:${minutes} ${ampm}`;

  return [{ date: dateString, time: timeString }];
};

export const railwayFormat = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const formattedHours = String(date.getHours()).padStart(2, '0'); // Convert to 12-hour format

  return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds}`;
};

export const EpochToDate = (epoch: number, timezone: string): string => {
  const date = new Date(epoch * 1000);

  // Create options object for toLocaleString
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  // Format the date with timezone
  const formattedDate = date.toLocaleString('en-IN', options);

  return formattedDate;
};

export const isValidPolygon = (paths: any): boolean => {
  if (!paths || paths.length < 4) return false;

  const firstPoint = paths[0];
  const lastPoint = paths[paths.length - 1];

  if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) return false;

  return true;
};

export const tripOrOrderStatus = (type: string) => {
  switch (type) {
    case 'IN_TRANSIT':
      return 'In Transit';

    case 'NOT_DELIVERED':
      return 'Not Delivered';

    case 'PENDING':
      return 'Delivery Pending';

    case 'CANCELLED':
      return 'Cancelled';

    case 'RESCHEDULED':
      return 'Rescheduled';

    case 'ASSIGNED':
      return 'Assigned';

    case 'STOP_COMPLETE':
      return 'Delivery Complete';

    case 'DIRECT_SALES':
      return 'Direct Sales';

    case 'ORDER_DELIVERY':
      return 'Order Delivery';

    case 'COMPLETED':
      return 'Completed';

    default:
      return 'N/A';
  }
};

//function to get current location
export const currentLocation = async () => {
  return await new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(res, rej);
  });
};

// function for sec to HH:MM
export const convertSecondsToHHMM = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  // Pad hours and minutes with leading zero if necessary
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
};

export const convertStringToEpochWithSS = (dateStr: string) => {
  const dateParts = dateStr?.split('-');
  const day = parseInt(dateParts[0], 10); // Extract day
  const month = new Date(`${dateParts[1]} 1, 2000`).getMonth(); // Get month index (0-11)
  const year = 2000 + parseInt(dateParts[2], 10); // Convert '26' to '2026'

  // Convert to Date object in local time
  const date = new Date(year, month, day, 0, 0, 0);

  return date.getTime(); // Returns 13-digit epoch timestamp
};

//function to convert toIST to HH:MM
export const formatISTtoHHMM = (dateString: string) => {
  const formattedTime = new Date(dateString);
  const hours = formattedTime.getHours().toString().padStart(2, '0');
  const minutes = formattedTime.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

//function to convert IST time into given timezone (hh:mm AM/PM)
export function convertISTToTimeZone(time: string, timeZone: string): string {
  const date = new Date(time);

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timeZone
  });
}

// function for debounce
export const debounce = (func: (...args: any[]) => void, delay: number = 500) => {
  let timeout: any;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// function to get AbortController

export const useAbort = () => {
  const abortController: any = useRef(null);

  const createAbort = () => {
    if (abortController?.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    return {
      abortCall: abortController.current
    };
  };

  return createAbort;
};

export const convertEpochToStartDateString = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const formattedHours = ('0' + (date.getHours() % 12 || 12)).slice(-2);
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
};

//function to convert HH:MM to hh:mm AM/PM
export const convertTimeFormat = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

//function to format filename
export const fileNameFormat = (name: string) => {
  let fileType = ['_license_', '_medicalCertificate_', '_insurance_'];
  let fileName = name;

  fileType.forEach(item => {
    if (name?.includes(item)) {
      fileName = name.split(item)[1];
    }
  });
  return fileName?.replace(/[ &\/\\#,+_$~%'":*?<>{}-]/g, '');
};

//function to convert 24HR to 12HR format
export const twelveHRformat = (date: string) => {
  let [hours, minutes] = date.split(':')?.map(Number);

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || hours;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`;
};

export function convertSecondsToTimes(totalSeconds: number): any {
  let hours24 = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let period: 'AM' | 'PM' = 'AM';
  let hours = hours24;

  if (hours24 === 0) {
    hours = 12;
    period = 'AM';
  } else if (hours24 === 12) {
    hours = 12;
    period = 'PM';
  } else if (hours24 > 12) {
    hours = hours24 - 12;
    period = 'PM';
  } else {
    period = 'AM';
  }

  const updatedTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`;

  return {
    hours,
    minutes,
    seconds,
    period,
    updatedTime
  };
}

export function useResponsiveWidth() {
  const [responsiveWidth, setResponsiveWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setResponsiveWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return responsiveWidth;
}

// utils/validationUtils.ts

export const isValidField = (fieldName: any, value: any): boolean => {
  if (!value) return false;

  switch (fieldName) {
    case 'username': {
      const usernameRegex = /^[A-Za-z0-9]+(\s[A-Za-z0-9]+)*$/;
      const hasAlphabet = /[A-Za-z]/.test(value);
      const isLengthValid = value.length >= 3 && value.length <= 20;
      return usernameRegex.test(value) && hasAlphabet && isLengthValid;
    }

    case 'email': {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      return emailRegex.test(value);
    }

    case 'contactnumber': {
      const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
      return phoneRegex.test(value);
    }

    default:
      return true;
  }
};
