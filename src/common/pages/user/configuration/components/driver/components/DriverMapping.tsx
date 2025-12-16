import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  Drawer,
  Grid,
  IconButton,
  Switch,
  Typography
} from '@mui/material';
import CustomButton from '../../../../../../components/buttons/CustomButton';
import CustomTextField from '../../../../../../components/customized/customtextfield/CustomTextField';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../../../../../app/redux/hooks';
import {
  VehicleListType,
  addDriver,
  assignVehicle,
  clearMailError,
  driverValidation,
  getDriver,
  getUnmapVehicle,
  mapDriver,
  primaryVehicle,
  secondaryVehicle,
  setValidationErrors,
  updateDriver
} from '../../../../../../../common/redux/reducer/commonSlices/driverSlice';
import { useCallback, useEffect, useState } from 'react';
import CustomSelect from '../../../../../../components/customized/customselect/CustomSelect';
import {
  capitalizeFirstLetter,
  convertToEpoch2,
  debounce,
  formatISTtoHHMM,
  isValidField,
  useAbort
} from '../../../../../../../utils/commonFunctions';
import dayjs, { Dayjs } from 'dayjs';
import CustomDateCalendar from '../../../../../../components/customized/customcalendar/CustomCalendar';
import CustomTimePicker from '../../../../../../components/customized/customtimepicker/CustomTimePicker';
import CustomFileUpload from '../../../../../../components/customized/fileupload/CustomFileUpload';
import CustomDaySelection from '../../../../../../components/customdayselection/CustomDaySelection';
import { AddCircleOutline } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { updateToast } from '../../../../../../../common/redux/reducer/commonSlices/toastSlice';
import './DriverMapping.scss';
import CustomMultiSelect from '../../../../../../components/customized/custommultiselect/CustomMultiSelect';
import PhoneNoTextField from '../../../../../../components/customized/customtextfield/PhoneNoTextField';

function DriverMapping({
  setOpen,
  open,
  selected,
  isMapping,
  textValue,
  pageSize,
  pageNo,
  setTextValue,
  filterPayload,
  setPageNo,
  setPageSize,
  children
}: any) {
  interface TextField {
    id?: string | undefined;
    label?: string | undefined;
    title?: string | undefined;
    field?:
      | 'firstName'
      | 'lastName'
      | 'contactEmail'
      | 'contactPhone'
      | 'licenseExpire'
      | 'licenseNumber'
      | 'licenseType'
      | 'insuranceExpire'
      | 'medicalExpire';
    placeholder?: string;
    inputProps?: {
      maxLength?: number;
      style?: React.CSSProperties;
    };
  }

  interface MappingTextField {
    id: string;
    label: string;
    field: 'driverid';
    placeholder: string;
    inputProps?: {
      maxLength?: number;
      style?: React.CSSProperties;
      readOnly?: boolean;
    };
  }

  interface MappingSelectField {
    id: string;
    label: string;
    field: 'vehiclenumber';
    placeholder: string;
  }

  interface MappingMultiSelectField {
    id: string;
    label: string;
    field: 'secondaryVehicle';
    placeholder: string;
  }
  const minDate = dayjs().add(1, 'day');

  const daysOfWeek = [
    { id: 'sunday', label: 'Sun' },
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' }
  ];

  const textfield: TextField[] = [
    {
      id: '1',
      label: 'First Name',
      field: 'firstName',
      placeholder: 'First name',
      inputProps: { maxLength: 40 }
    },
    {
      id: '2',
      label: 'Last Name',
      field: 'lastName',
      placeholder: 'Last name',
      inputProps: { maxLength: 40 }
    },
    {
      id: '3',
      label: 'Email',
      field: 'contactEmail',
      placeholder: 'Email',
      inputProps: { maxLength: 40 }
    },
    {
      id: '4',
      label: 'contact Number',
      field: 'contactPhone',
      placeholder: 'contact number',
      inputProps: { maxLength: 10 }
    },
    {
      id: '5',
      label: 'License Number',
      field: 'licenseNumber',
      placeholder: 'License number',
      inputProps: { maxLength: 15 }
    },
    {
      id: '6',
      label: 'License Type',
      field: 'licenseType',
      placeholder: 'License type'
    },
    {
      id: '7',
      label: 'License',
      title: 'License Document'
    },
    {
      id: '8',
      label: 'Insurance',
      title: 'Insurance Document'
    },
    {
      id: '9',
      label: 'Medical',
      title: 'Medical Certificate'
    },
    {
      id: '10',
      label: 'License Expiry Date',
      field: 'licenseExpire',
      placeholder: 'License expiry'
    },
    {
      id: '11',
      label: 'Insurance Expiry Date',
      field: 'insuranceExpire',
      placeholder: 'Insurance expiry'
    },
    {
      id: '12',
      label: 'Medical Expiry Date',
      field: 'medicalExpire',
      placeholder: 'Medical expiry'
    }
  ];

  const mappingTextField: MappingTextField[] = [
    {
      id: '1',
      label: 'Driver Name',
      field: 'driverid',
      placeholder: 'Driver name',
      inputProps: { readOnly: true }
    }
  ];

  const mappingSelectField: MappingSelectField[] = [
    {
      id: '1',
      label: 'Primary Vehicle',
      field: 'vehiclenumber',
      placeholder: 'Vehicle number'
    }
  ];

  const mappingMultiSelectField: MappingMultiSelectField[] = [
    {
      id: '1',
      label: 'Secondary Vehicle',
      field: 'secondaryVehicle',
      placeholder: 'Secondary Vehicle'
    }
  ];

  const mailError = useAppSelector(state => state.driverValidationDetails.data);
  // const validationErrors = useAppSelector(
  //   state => state.driverValidationDetails.validationErrors
  // )

  const userNameValidation = useAppSelector(
    state => state.driverValidationDetails.userName
  );

  const contactEmails = useAppSelector(
    state => state.driverValidationDetails.contactEmail
  );
  const contactPhone = useAppSelector(
    state => state.driverValidationDetails.contactPhone
  );
  const licenseNumber = useAppSelector(
    state => state.driverValidationDetails.licenseNumber
  );

  const { data } = useAppSelector(state => state.auth);

  const { category } = useAppSelector(state => state.RoleModuleAccess);
  let roletype = data?.role;

  const APadmin = roletype === 'ROLE_AUTOPLANNER_ADMIN';
  const APoperator = roletype === 'ROLE_OPERATOR';
  const isAutoplanner =
    roletype === 'ROLE_AUTOPLANNER_ADMIN' ||
    roletype === 'ROLE_OPERATOR_ADMIN' ||
    roletype === 'ROLE_OPERATOR' ||
    roletype === 'ROLE_AGENT' ||
    category === 'OPERATION_USER';
  const deliveryRole = roletype === 'ROLE_DT_ADMIN';

  // schema for driver form validation
  const sameTimeschema: any = (username: any) =>
    yup.object().shape({
      userName: yup
        .string()
        .when(['password', 'confirmPassword'], ([password, confirmPassword], schema) => {
          return schema.test(
            'conditional-userName',
            'Invalid Username',
            function (value: any) {
              const { path, createError } = this;
              const hasPassword = !!password;
              const hasConfirmPassword = !!confirmPassword;
              const isRequired = hasPassword || hasConfirmPassword;

              if (!/^[A-Za-z0-9]+(\s[A-Za-z0-9]+)*$/.test(value)) {
                return createError({
                  path,
                  message: 'Username can only contain letters and numbers'
                });
              }

              if (!/[A-Za-z]/.test(value)) {
                return createError({
                  path,
                  message: 'Username must contain at least one alphabet'
                });
              }

              if (value?.length < 3) {
                return createError({
                  path,
                  message: 'Username must be at least 3 characters long'
                });
              }

              if (value?.length > 20) {
                return createError({
                  path,
                  message: 'Username cannot exceed 20 characters'
                });
              }

              if (validationErrors?.userName) {
                return createError({ path, message: validationErrors.userName });
              }
              if (isRequired && !value) {
                return createError({ path, message: 'Enter the Username' });
              }

              if (!value) return true;

              return true;
            }
          );
        }),

      password: username
        ? yup
            .string()
            .required('Enter password')
            .min(8, 'Password must be at least 8 characters')
            .max(16, 'Password cannot exceed 16 characters')
            .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .matches(/[0-9]/, 'Password must contain at least one number')
            .matches(
              /[@$!%*?&#^()_\-+=]/,
              'Password must contain at least one special character'
            )
        : yup.string().notRequired(),

      confirmPassword: username
        ? yup
            .string()
            .required('Enter confirm password')
            .oneOf([yup.ref('password')], 'Passwords must match')
        : yup.string().notRequired(),
      firstName: yup
        .string()
        .required('Enter first name')
        .trim()
        .matches(/^[A-Za-z]+(\s*[A-Za-z]+)*$/, 'First name contains only alphabets')
        .min(3, 'Too short!'),
      lastName: yup
        .string()
        .trim()
        .notRequired()
        .test('last-name', 'Last name contains only alphabets', function (value) {
          if (!value) return true;
          return /^[A-Za-z]+(\s*[A-Za-z]+)*$/.test(value);
        }),
      contactEmail: yup.string().when('$validationErrors', {
        is: (val: string | null | undefined) => true,
        then: schema =>
          schema
            .notRequired()
            .trim()
            .test('basic-email', 'Please enter a valid email format', value => {
              if (!value) return true;
              const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
              return emailRegex.test(value);
            })
            .test('mail-error', 'Enter valid mail', function (value: any) {
              const { validationErrors } = this.options.context || {};
              if (validationErrors?.contactEmail && value) {
                return this.createError({
                  message: validationErrors?.contactEmail
                });
              }
              return true;
            }),
        otherwise: schema =>
          schema.notRequired().trim().email('Please enter a valid email')
      }),

      contactPhone: yup
        .string()
        .trim()
        .required('Enter contact number')
        .test('basic-contact', 'Invalid contact number', value => {
          if (!value) return true;
          const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
          return phoneRegex.test(value);
        })
        .test('phone-error', 'Enter valid contact number', function (value: any) {
          if (validationErrors?.contactPhone && value) {
            return this.createError({ message: validationErrors?.contactPhone });
          } else {
            return true;
          }
        }),

      licenseNumber: yup
        .string()
        .trim()
        .notRequired()
        .test('license-number', 'Enter valid license number', function (value: any) {
          if (validationErrors?.licenseNumber && value) {
            return this.createError({ message: validationErrors?.licenseNumber });
          } else {
            return true;
          }
        }),
      licenseType: yup.string().trim().notRequired(),
      licenseExpire: yup
        .string()
        .trim()
        .when('licenseFiles', (licenseFiles: any, schema: any) => {
          return licenseFiles[0]
            ? schema
                ?.required('Select license expiry date')
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue.licenseExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value && textValue.licenseExpire
                      ? expireDate >= previousExpire
                      : value
                      ? expireDate > today
                      : true;
                  }
                )
            : schema
                ?.notRequired()
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue.licenseExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value && textValue.licenseExpire
                      ? expireDate >= previousExpire
                      : value
                      ? expireDate > today
                      : true;
                  }
                );
        }),
      insuranceExpire: yup
        .string()
        .trim()
        .when('insuranceFiles', (insuranceFiles: any, schema: any) => {
          return insuranceFiles[0]
            ? schema
                ?.required('Select insurance expiry date')
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue?.insuranceExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value && textValue.insuranceExpire
                      ? expireDate >= previousExpire
                      : value
                      ? expireDate > today
                      : true;
                  }
                )
            : schema
                ?.notRequired()
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue?.insuranceExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value && textValue.insuranceExpire
                      ? expireDate >= previousExpire
                      : value
                      ? expireDate > today
                      : true;
                  }
                );
        }),
      medicalExpire: yup
        .string()
        .trim()
        .when('medicalFiles', (medicalFiles: any, schema: any) => {
          return medicalFiles[0]
            ? schema
                .required('Select medical expiry date')
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue.medicalExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value && textValue.medicalExpire
                      ? expireDate >= previousExpire
                      : value
                      ? expireDate > today
                      : true;
                  }
                )
            : schema
                .notRequired()
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue.medicalExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value && textValue.medicalExpire
                      ? expireDate >= previousExpire
                      : value
                      ? expireDate > today
                      : true;
                  }
                );
        }),
      license: yup.mixed().when('licenseFiles', (licenseFiles: any, schema: any) => {
        return licenseFiles[0]
          ? schema
              ?.notRequired()
              .test('is-large-file', 'File size should not exceed 4MB', (value: any) => {
                return value?.every((item: any) =>
                  item?.size ? item?.size <= 4000000 : true
                );
              })
              .test(
                'maximum-two-files',
                `Can't upload more than two files`,
                (value: any) => {
                  return value?.length <= 2;
                }
              )
          : schema.notRequired();
      }),

      medical: yup.mixed().when('medicalFiles', (medicalFiles: any, schema: any) => {
        return medicalFiles[0]
          ? schema
              ?.notRequired()
              .test('is-large-file', 'File size should not exceed 4MB', (value: any) => {
                return value?.every((item: any) =>
                  item?.size ? item?.size <= 4000000 : true
                );
              })
              .test(
                'maximum-two-files',
                `Can't upload more than two files`,
                (value: any) => {
                  return value?.length <= 2;
                }
              )
          : schema.notRequired();
      }),
      insurance: yup
        .mixed()
        .when('insuranceFiles', (insuranceFiles: any, schema: any) => {
          return insuranceFiles[0]
            ? schema
                .notRequired()
                .test(
                  'is-large-file',
                  'File size should not exceed 4MB',
                  (value: any) => {
                    return value?.every((item: any) =>
                      item?.size ? item?.size <= 4000000 : true
                    );
                  }
                )
                .test(
                  'maximum-two-file',
                  `Can't upload more than two files`,
                  (value: any) => {
                    return value?.length <= 2;
                  }
                )
            : schema.notRequired();
        }),
      days: yup.boolean().oneOf([true], 'Select at least one day').default(false),

      optional: yup.boolean(),
      licenseFiles: yup.boolean(),
      medicalFiles: yup.boolean(),
      insuranceFiles: yup.boolean(),
      availableFrom: yup
        .date()
        .required('Select from time')
        .test('is-valid-time', 'Invalid time format', value => {
          return true || null;
        }),
      availableTo: yup
        .date()
        .required('Select to time')
        .test(
          'is-after-picktime1',
          'Time difference should be one hour',
          function (value) {
            const { availableFrom } = this.parent;
            let fromHours = new Date(availableFrom);
            fromHours.setMinutes(fromHours.getMinutes() + 60);

            if (!availableFrom || !value) {
              return true || null;
            }
            return value >= fromHours;
          }
        ),
      time: yup
        .array()
        .of(
          yup.object().shape({
            breakTimeFrom: yup
              .date()
              .notRequired()
              .when('$minPickTime', {
                is: (val: string | null | undefined) => {
                  return true;
                },
                then: schema =>
                  schema
                    .notRequired()
                    .test('from-error', 'Invalid From Time', function (value: any) {
                      const isValid =
                        (dayjs(value).isAfter(
                          minPickTime
                            ?.subtract(1, 'hour')
                            .set('second', 0)
                            .set('millisecond', 0)
                        ) ||
                          dayjs(value).isSame(
                            minPickTime
                              ?.subtract(1, 'hour')
                              .set('second', 0)
                              .set('millisecond', 0)
                          )) &&
                        dayjs(value).isBefore(
                          maxPickTime
                            ?.subtract(1, 'hour')
                            .set('second', 0)
                            .set('millisecond', 0)
                        );
                      if (value) return isValid;
                      else return true;
                    }),
                otherwise: schema => schema.notRequired()
              }),
            breakTimeTo: yup
              .date()
              .notRequired()
              .test('to-time', 'Select To', (value: any, context: any) => {
                const { breakTimeFrom } = context.parent;
                return breakTimeFrom && !value ? false : true;
              })
              .test(
                'is-after-fromtime',
                'Invalid To Time',
                (value: any, context: any) => {
                  const { breakTimeFrom } = context.parent;
                  // if (
                  //   new Date(breakTimeFrom)?.getTime() === new Date(value)?.getTime() &&
                  //   value
                  // ) {
                  //   return false;
                  // }
                  let fromHours = new Date(breakTimeFrom);
                  fromHours.setMinutes(breakTimeFrom?.getMinutes() + 30);

                  return breakTimeFrom && value ? value >= fromHours : true;
                }
              )
              .default(null)
              .when('$maxPickTime', {
                is: (val: string | null | undefined) => {
                  return true;
                },
                then: schema =>
                  schema
                    .notRequired()
                    .test('from-error', 'Invalid To Time', function (value: any) {
                      const { breakTimeFrom } = this.parent;
                      const isValid =
                        (dayjs(value).isBefore(
                          maxPickTime
                            ?.subtract(1, 'hour')
                            .set('second', 0)
                            .set('millisecond', 0)
                        ) ||
                          dayjs(value).isSame(
                            maxPickTime
                              ?.subtract(1, 'hour')
                              .set('second', 0)
                              .set('millisecond', 0)
                          )) &&
                        dayjs(value).isAfter(breakTimeFrom);
                      if (value) return isValid;
                      else return true;
                    }),
                otherwise: schema => schema.notRequired()
              })
          })
        )
        .test('unique-interval', 'Select valid break interval', function (value) {
          if (!Array.isArray(value)) return true;

          const intervals = value
            .filter(interval => interval?.breakTimeFrom && interval?.breakTimeTo)
            .map(interval => ({
              from: interval.breakTimeFrom || 0,
              to: interval.breakTimeTo || 0
            }));

          for (let i = 0; i < intervals.length; i++) {
            for (let j = i + 1; j < intervals.length; j++) {
              const a = intervals[i];
              const b = intervals[j];
              const isOverlapping = a?.from < b.to && b?.from < a.to;

              if (isOverlapping) {
                return false;
              }
            }
          }

          return true;
        }),
      isUpdate: yup.boolean().default(false)
    });

  // schema for driver form validation
  const individualTimeschema: any = (username: any) =>
    yup.object().shape({
      userName: yup
        .string()
        .when(['password', 'confirmPassword'], ([password, confirmPassword], schema) => {
          return schema.test(
            'conditional-userName',
            'Invalid Username',
            function (value) {
              const { path, createError } = this;
              const hasPassword = !!password;
              const hasConfirmPassword = !!confirmPassword;
              const isRequired = hasPassword || hasConfirmPassword;

              if (isRequired && !value) {
                return createError({ path, message: 'Enter the Username' });
              }

              if (!value) return true;

              if (!/^[A-Za-z0-9]+(\s[A-Za-z0-9]+)*$/.test(value)) {
                return createError({
                  path,
                  message: 'Username can only contain letters and numbers'
                });
              }

              if (!/[A-Za-z]/.test(value)) {
                return createError({
                  path,
                  message: 'Username must contain at least one alphabet'
                });
              }

              if (value.length < 3) {
                return createError({
                  path,
                  message: 'Username must be at least 3 characters long'
                });
              }

              if (value.length > 20) {
                return createError({
                  path,
                  message: 'Username cannot exceed 20 characters'
                });
              }

              if (validationErrors?.userName) {
                return createError({ path, message: validationErrors.userName });
              }

              return true;
            }
          );
        }),

      password: username
        ? yup
            .string()
            .required('Enter password')
            .min(8, 'Password must be at least 8 characters')
            .max(16, 'Password cannot exceed 16 characters')
            .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .matches(/[0-9]/, 'Password must contain at least one number')
            .matches(
              /[@$!%*?&#^()_\-+=]/,
              'Password must contain at least one special character'
            )
        : yup.string().notRequired(),

      confirmPassword: username
        ? yup
            .string()
            .required('Enter confirm password')
            .oneOf([yup.ref('password')], 'Passwords must match')
        : yup.string().notRequired(),

      firstName: yup
        .string()
        .trim()
        .required('Enter first name')
        .matches(/^[A-Za-z-]+(\s*[A-Za-z-]+)*$/, 'First name contains only alphabets')
        .min(3, 'Too short!'),
      lastName: yup
        .string()
        .trim()
        .notRequired()
        .test('last-name', 'Last name contains only alphabets', function (value) {
          if (!value) return true;
          return /^[A-Za-z]+(\s*[A-Za-z]+)*$/.test(value);
        }),
      contactEmail: yup.string().when('$validationErrors', {
        is: (val: string | null | undefined) => {
          return true;
        },
        then: schema =>
          schema
            .notRequired()
            .test('mail-error', 'ERROR IS REQUIRED', function (value: any) {
              if (validationErrors?.contactEmail && value) {
                return this.createError({ message: validationErrors?.contactEmail });
              } else {
                return true;
              }
            }),
        otherwise: schema =>
          schema.notRequired().trim().email('Please enter a valid email')
      }),

      contactPhone: yup
        .string()
        .trim()
        .test('is-number', 'Enter contact number', function (value: any) {
          return value;
        })
        .test('phone-error', 'Enter valid contact number', function (value: any) {
          if (validationErrors?.contactPhone && value) {
            // return this.createError({ message: validationErrors?.contactPhone });+
          } else if (value) {
            return value;
          } else {
            return true;
          }
        }),

      licenseNumber: yup
        .string()
        .trim()
        .nullable()
        .notRequired()
        .test('license-number', 'Enter valid license number', function (value: any) {
          if (validationErrors?.licenseNumber && value) {
            return this.createError({ message: validationErrors?.licenseNumber });
          } else {
            return true;
          }
        }),
      licenseType: yup.string().notRequired().trim(),
      multipleTimeDays: yup.boolean().default(false),

      licenseExpire: yup
        .string()
        .trim()
        .when('licenseFiles', (licenseFiles: any, schema: any) => {
          return licenseFiles[0]
            ? schema
                ?.notRequired()
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue.licenseExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value
                      ? expireDate >= previousExpire
                      : true;
                  }
                )
            : schema
                ?.notRequired()
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue.licenseExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value
                      ? expireDate >= previousExpire
                      : true;
                  }
                );
        }),

      insuranceExpire: yup
        .string()
        .trim()
        .when('insuranceFiles', (insuranceFiles: any, schema: any) => {
          return insuranceFiles[0]
            ? schema
                .notRequired('Select insurance expiry date')
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue?.insuranceExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value
                      ? expireDate >= previousExpire
                      : true;
                  }
                )
            : schema
                ?.notRequired()
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue?.insuranceExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value
                      ? expireDate >= previousExpire
                      : true;
                  }
                );
        }),

      medicalExpire: yup
        .string()
        .trim()
        .when('medicalFiles', (medicalFiles: any, schema: any) => {
          return medicalFiles[0]
            ? schema
                .notRequired('Select medical expiry date')
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const isUpdate = context?.parent?.isUpdate;
                    const previousExpire = new Date(textValue.medicalExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value
                      ? expireDate >= previousExpire
                      : true;
                  }
                )
            : schema
                ?.notRequired()
                .test(
                  'is-future-date',
                  'Select future date',
                  (value: any, context: any) => {
                    const isUpdate = context?.parent?.isUpdate;
                    const today = new Date();
                    const expireDate = new Date(value * 1000);
                    const previousExpire = new Date(textValue.medicalExpire * 1000);
                    return value && !isUpdate
                      ? expireDate > today
                      : value
                      ? expireDate >= previousExpire
                      : true;
                  }
                );
        }),

      license: yup.mixed().when('licenseFiles', (licenseFiles: any, schema: any) => {
        return licenseFiles[0]
          ? schema
              ?.notRequired()
              .test('is-large-file', 'File size should not exceed 4MB', (value: any) => {
                return value?.every((item: any) =>
                  item?.size ? item?.size <= 4000000 : true
                );
              })
              .test(
                'maximum-two-files',
                `Can't upload more than two files`,
                (value: any) => {
                  return value?.length <= 2;
                }
              )
          : schema.notRequired();
      }),

      medical: yup.mixed().when('medicalFiles', (medicalFiles: any, schema: any) => {
        return medicalFiles[0]
          ? schema
              ?.notRequired()
              .test('is-large-file', 'File size should not exceed 4MB', (value: any) => {
                return value?.every((item: any) =>
                  item?.size ? item?.size <= 4000000 : true
                );
              })
              .test(
                'maximum-two-file',
                `Can't upload more than two files`,
                (value: any) => {
                  return value?.length <= 2;
                }
              )
          : schema.notRequired();
      }),

      insurance: yup
        .mixed()
        .when('insuranceFiles', (insuranceFiles: any, schema: any) => {
          return insuranceFiles[0]
            ? schema
                .notRequired()
                .test(
                  'is-large-file',
                  'File size should not exceed 4MB',
                  (value: any) => {
                    return value?.every((item: any) =>
                      item?.size ? item?.size <= 4000000 : true
                    );
                  }
                )
                .test(
                  'maximum-two-file',
                  `Can't upload more than two files`,
                  (value: any) => {
                    return value?.length <= 2;
                  }
                )
            : schema.notRequired();
        }),

      availableDays: yup.array().of(
        yup.object().shape({
          day: yup.boolean(),
          fromTime: yup.date().when('day', (day: any, schema: any) => {
            return day[0] ? schema.required('Select From') : schema.notRequired();
          }),
          toTime: yup.date().when('day', (day: any, schema: any) => {
            return day[0]
              ? schema
                  .required('Select To')

                  .test(
                    'is-after-fromtime',
                    'Invalid To Time',
                    (value: any, context: any) => {
                      const { fromTime } = context.parent;

                      if (!fromTime || !value) {
                        return false;
                      }

                      if (new Date(fromTime).getTime() === new Date(value).getTime()) {
                        return false;
                      }

                      let fromHours = new Date(fromTime);
                      fromHours.setMinutes(fromTime.getMinutes() + 60);

                      return value >= fromHours;
                    }
                  )
              : schema.notRequired();
          }),
          breakIntervals: yup
            .array()
            .of(
              yup.object().shape({
                breakTimeFrom: yup
                  .date()
                  .nullable()
                  .notRequired()
                  .test('not-before-fromTime', 'Invalid From Time', function (value) {
                    const parent = this.from?.[1]?.value;
                    const fromTime = parent?.fromTime;
                    const toTime = parent?.toTime;
                    if (!value || !fromTime) return true;
                    const isValid =
                      (dayjs(value).isAfter(fromTime) || dayjs(value).isSame(fromTime)) &&
                      dayjs(value).isBefore(toTime);
                    if (value) return isValid;
                    else return true;
                  }),
                breakTimeTo: yup
                  .date()
                  .notRequired()
                  .nullable()
                  .test(
                    'is-after-fromtime',
                    'To must be after From',
                    function (value, context) {
                      const { breakTimeFrom } = context.parent;
                      return value && breakTimeFrom
                        ? new Date(value).getTime() > new Date(breakTimeFrom).getTime()
                        : true;
                    }
                  )
                  .test('not-before-toTime', 'Invalid To Time', function (value) {
                    const parent = this.from?.[1]?.value;

                    const toTime = parent?.toTime;
                    if (!value || !toTime) return true;
                    const isValid =
                      dayjs(value).isBefore(toTime) || dayjs(value).isSame(toTime);
                    if (value) return isValid;
                    else return true;
                  })
                  .test('required-if-from-set', 'Enter To Time', function (value) {
                    const { breakTimeFrom } = this.parent;
                    return breakTimeFrom ? !!value : true;
                  })
              })
            )
            .test('unique-interval', 'Select valid break interval', function (value) {
              if (!Array.isArray(value)) return true;

              const intervals = value
                .filter(interval => interval?.breakTimeFrom && interval?.breakTimeTo)
                .map(interval => ({
                  from: interval.breakTimeFrom || 0,
                  to: interval.breakTimeTo || 0
                }));

              for (let i = 0; i < intervals.length; i++) {
                for (let j = i + 1; j < intervals.length; j++) {
                  const a = intervals[i];
                  const b = intervals[j];
                  const isOverlapping = a?.from < b.to && b?.from < a.to;

                  if (isOverlapping) {
                    return false;
                  }
                }
              }

              return true;
            })
        })
      ),
      optional: yup.boolean(),
      licenseFiles: yup.boolean(),
      medicalFiles: yup.boolean(),
      insuranceFiles: yup.boolean(),
      isUpdate: yup.boolean().default(false)
    });

  const [validationErrors, setValidationErrorsMake] = useState<any>({
    userName: null,
    contactEmail: null,
    contactPhone: null,
    licenseNumber: null
  });

  const [licenseFile, setLicenseFile] = useState<any>([]);
  const [minPickTime, setMinPickTime] = useState<Dayjs | undefined>(undefined);
  const [maxPickTime, setMaxPickTime] = useState<Dayjs | undefined>(undefined);
  const [insuranceFiles, setInsuranceFile] = useState<any[]>([]);
  const [medicalFile, setMedicalFile] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    daysOfWeek.map(day => day.id)
  );
  const [validationField, setValidationField] = useState('');
  const [validationFields, setValidationFields] = useState<any>({
    contactEmail: { status: false },
    contactPhone: { status: false },
    licenseNumber: { status: false }
  });
  const [fromTime, setFromTime] = useState<string>('');
  const [minPickTimes, setMinPickTimes] = useState<any>([]);
  const [maxPickTimes, setMaxPickTimes] = useState<any>([]);
  const [toTime, setToTime] = useState<string>('');
  const [secondVehicle, setSecondVehicle] = useState<any>();
  const [firstVehicle, setFirstVehicle] = useState<any>();
  const [callApi, setCallApi] = useState<any>(true);
  const [secondaryCallApi, setSecondaryCallApi] = useState<any>(false);

  const [deletedFiles, setDeletedFiles] = useState({
    licenseFilesToDelete: [],
    medicalFilesToDelete: [],
    insuranceFilesToDelete: []
  });

  const [error, setError] = useState(false);
  const [username, setUsername] = useState<boolean | string>('');

  const [isSameTimeVisible, setIsSameTimeVisible] = useState<boolean>();
  const [date, setDate] = useState<any>({
    licenseExpire: null,
    insuranceExpire: null,
    medicalExpire: null
  });

  const createAbort = useAbort();

  // schema for driver mapping form validation
  const mappingSchema = yup.object().shape({
    driverid: yup.string().required('Enter the Driver ID'),
    vehiclenumber: yup.string().notRequired(),
    secondaryVehicle: yup.string().notRequired()
  });

  // form state
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    reset,
    trigger,
    setError: setErrors,
    resetField,
    watch,
    formState: { errors }
  } = useForm<any>({
    resolver: yupResolver(
      isSameTimeVisible ? sameTimeschema(username) : individualTimeschema(username)
    ),
    defaultValues: {
      time: [],
      firstName: '',
      lastName: '',
      contactEmail: '',
      contactPhone: '',
      licenseExpire: '',
      availableDays: [
        {
          day: false,
          value: 'sunday',
          label: 'Sunday',
          fromTime: null,
          toTime: null,
          breakIntervals: []
        },
        {
          day: false,
          value: 'monday',
          label: 'Monday',
          fromTime: null,
          toTime: null,
          breakIntervals: []
        },
        {
          day: false,
          value: 'tuesday',
          label: 'Tuesday',
          fromTime: null,
          toTime: null,
          breakIntervals: []
        },
        {
          day: false,
          value: 'wednesday',
          label: 'Wednesday',
          fromTime: null,
          toTime: null,
          breakIntervals: []
        },
        {
          day: false,
          value: 'thursday',
          label: 'Thursday',
          fromTime: null,
          toTime: null,
          breakIntervals: []
        },
        {
          day: false,
          value: 'friday',
          label: 'Friday',
          fromTime: null,
          toTime: null,
          breakIntervals: []
        },
        {
          day: false,
          value: 'saturday',
          label: 'Saturday',
          fromTime: null,
          toTime: null,
          breakIntervals: []
        }
      ]
    },
    context: { validationErrors, minPickTime, maxPickTime }
  });

  const { append, fields, update } = useFieldArray({
    control,
    name: 'availableDays'
  });

  const {
    control: mappingControl,
    handleSubmit: handleMappingSubmit,
    getValues: mappingGetValue,
    setValue: mappingSetValue,
    reset: mappingReset,
    trigger: mappingTrigger,
    formState: { errors: err }
  } = useForm({
    resolver: yupResolver(mappingSchema)
  });
  // dispatch
  const dispatch = useAppDispatch();

  const { vehicleList } = useAppSelector(
    (state: { unmapVehicle: VehicleListType }) => state.unmapVehicle
  );

  const { isLoading, type } = useAppSelector(state => state.driver);
  const { data: primaryVehicleData, isLoading: primaryLoading } = useAppSelector(
    state => state.primaryVehicle
  );
  const { data: secondaryVehicleData, isLoading: secondaryLoading } = useAppSelector(
    state => state.secondaryVehicle
  );
  const { isLoading: assignLoading, type: assignType } = useAppSelector(
    state => state.assignVehicle
  );

  const unmappedVehicleList = vehicleList.map((vehicle: string) => ({
    id: vehicle,
    label: vehicle.toUpperCase()
  }));

  const {
    fields: breakFields,
    append: addBreak,
    update: updateBreak,
    remove: removeBreak
  } = useFieldArray<any>({
    control,
    name: 'time'
  });

  // Handler for Switch change
  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setIsSameTimeVisible(checked);
    if (
      !textValue ? !checked : textValue && textValue.isMultipleHours === false && !checked
    ) {
      setSelectedDays(daysOfWeek.map(day => day.id));
      trigger(`availableTo`);
      trigger(`availableFrom`);
      trigger(`multipleTimeDays`);
      setMinPickTimes([]);
      setMaxPickTimes([]);
      let availableFrom = dayjs()
        .set('hour', parseFloat('07'))
        .set('minute', parseFloat('30'));
      setValue('availableFrom', availableFrom);
      setValue('days', true);
      setFromTime('07:30');
      setToTime('20:30');
      let availableTo = dayjs()
        .set('hour', parseFloat('20'))
        .set('minute', parseFloat('30'));
      setValue('availableTo', availableTo);
      setMinPickTime(
        dayjs()
          .set('hour', parseFloat('07'))
          .set('minute', parseFloat('30') + 60)
      );
      setMaxPickTime(
        dayjs()
          .set('hour', parseFloat('20'))
          .set('minute', parseFloat('30') + 60)
      );
      removeBreak();
      // setSelectedDays([]);
      resetField(`availableDays`);
      resetField('multipleTimeDays');
      setValue('multipleTimeDays', false);
      clearErrors('multipleTimeDays');
    }
    if (textValue?.isMultipleHours ? textValue?.isMultipleHours && checked : checked) {
      resetField(`availableDays`);
      let availableFrom = dayjs()
        .set('hour', parseFloat('07'))
        .set('minute', parseFloat('30'));
      setValue('availableFrom', availableFrom);
      setValue('days', true);
      setFromTime('07:30');
      setToTime('20:30');
      let availableTo = dayjs()
        .set('hour', parseFloat('20'))
        .set('minute', parseFloat('30'));
      setValue('availableTo', availableTo);
      setMinPickTime(
        dayjs()
          .set('hour', parseFloat('07'))
          .set('minute', parseFloat('30') + 60)
      );
      setMaxPickTime(
        dayjs()
          .set('hour', parseFloat('20'))
          .set('minute', parseFloat('30') + 60)
      );
      // setValue('days', false);
      // clearErrors('days');
      // setSelectedDays([]);
    }
  };

  //function to close the dialog
  const onClose = () => {
    setOpen(false);
  };

  const handleSelectDay = (index: number, day: any) => {
    if (isSameTimeVisible) {
      if (selectedDays.includes(day.value)) {
        setSelectedDays(selectedDays.filter(dayId => dayId !== day.value));
        const multipleDay = selectedDays.filter(dayId => dayId !== day.value);
      } else {
        setSelectedDays([...selectedDays, day.value]);
      }
    } else {
      update(index, {
        day: !day.day,
        label: getValues(`availableDays.${index}.label`),
        value: getValues(`availableDays.${index}.value`),
        fromTime: getValues(`availableDays.${index}.fromTime`),
        toTime: getValues(`availableDays.${index}.toTime`)
      });
      if (day.day) {
        resetField(`availableDays.${index}.fromTime`);
        resetField(`availableDays.${index}.toTime`);
      }
    }
  };

  //function for file upload
  const handleFileUpload = (label: string) => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.multiple = true;
    inputElement.accept = 'application/pdf, .jpg,.jpeg,.png';
    inputElement.name = 'license';
    inputElement.onchange = async (event: any) => {
      let validFileFormat = ['jpg', 'jpeg', 'png', 'pdf'];
      let fileFormat = validFileFormat?.includes(
        event.target.files[0]?.name?.split('.')[1]
      );
      if (!fileFormat) {
        dispatch(
          updateToast({
            show: true,
            message: 'Invalid file Format',
            severity: 'error'
          })
        );
      } else {
        if (label === 'License') {
          let newlicenseFile: any = [];
          if (
            event.target.files[0]?.name === licenseFile[0]?.name ||
            licenseFile[0]?.name?.includes(event.target.files[0]?.name)
          ) {
            const sameFiles = event.target.files[0].name?.split('.');

            newlicenseFile = [
              new File([event.target.files[0]], `${sameFiles[0]}(1).${sameFiles[1]}`, {
                type: event?.target.files[0].type,
                lastModified: event.target.files[0].lastModified
              })
            ];
          } else {
            newlicenseFile = [...event.target.files];
          }

          setLicenseFile([...licenseFile, ...newlicenseFile]);
          setValue('license', [...licenseFile, ...newlicenseFile]);
          setValue('licenseFiles', true);
          trigger('license');
          trigger('licenseExpire');
        }

        if (label === 'Medical') {
          let newMedicalFile: any = [];
          if (event?.target?.files[0]?.name === medicalFile[0]?.name) {
            const sameFiles = event?.target?.files[0]?.name.split('.');
            newMedicalFile = [
              new File([event.target.files[0]], `${sameFiles[0]}(1).${sameFiles[1]}`, {
                type: event?.target.files[0].type,
                lastModified: event.target.files[0].lastModified
              })
            ];
          } else {
            newMedicalFile = [...event.target.files];
          }
          setMedicalFile([...medicalFile, ...newMedicalFile]);
          setValue('medical', [...medicalFile, ...newMedicalFile]);
          setValue('medicalFiles', true);
          trigger('medical');
          trigger('medicalExpire');
        }
        if (label === 'Insurance') {
          let newInsuranceFile: any = [];
          let count = 0;
          if (event?.target?.files[0]?.name === insuranceFiles[0]?.name) {
            const sameFiles = event?.target?.files[0]?.name.split('.');
            newInsuranceFile = [
              new File([event.target.files[0]], `${sameFiles[0]}(1).${sameFiles[1]}`, {
                type: event.target.files[0].type,
                lastModified: event.target.files[0].lastModified
              })
            ];
            count++;
          } else {
            newInsuranceFile = [...event.target.files];
          }
          setInsuranceFile([...insuranceFiles, ...newInsuranceFile]);
          setValue('insuranceFiles', true);
          setValue('insurance', [...insuranceFiles, ...newInsuranceFile]);
          trigger('insurance');
          trigger('insuranceExpire');
        }
      }
    };
    inputElement.click();
  };

  //function for dlete files
  const handleDelete = (item: any, label: string) => {
    if (label === 'License') {
      const newFiles = licenseFile?.filter((value: any) => value.name !== item.name);

      if (newFiles.length === 0) {
        setValue('licenseFiles', false);
        trigger('license');
        trigger('licenseExpire');
      } else {
        setValue('licenseFiles', true);
        setValue('license', newFiles);
        trigger('license');
      }
      setLicenseFile(newFiles);

      if (textValue) {
        let deletedLicense = licenseFile
          ?.filter((value: any) => value.name === item.name)
          ?.map((files: any, index: number) => files?.name);
        setDeletedFiles((prev: any) => {
          return {
            ...prev,
            licenseFilesToDelete: [
              ...deletedFiles.licenseFilesToDelete,
              ...deletedLicense
            ]
          };
        });
      }
    } else if (label === 'Medical') {
      const newFiles = medicalFile?.filter((value: any) => value?.name !== item?.name);
      if (newFiles.length === 0) {
        setValue('medicalFiles', false);
        trigger('medical');
        trigger('medicalExpire');
      } else {
        setValue('medicalFiles', true);
        setValue('medical', newFiles);
        trigger('medical');
      }
      setMedicalFile(newFiles);
      if (textValue) {
        let deletedMedical = medicalFile
          ?.filter((value: any) => value?.name === item?.name)
          .map((files: any) => files?.name);
        setDeletedFiles((prev: any) => {
          return {
            ...prev,
            medicalFilesToDelete: [
              ...deletedFiles.medicalFilesToDelete,
              ...deletedMedical
            ]
          };
        });
      }
    } else if (label === 'Insurance') {
      const newFiles = insuranceFiles?.filter((value: any) => value?.name !== item?.name);
      setInsuranceFile(newFiles);
      if (newFiles.length === 0) {
        setValue('insuranceFiles', false);
        trigger('insurance');
        trigger('insuranceExpire');
      } else {
        setValue('insuranceFiles', true);
        setValue('insurance', newFiles);
        trigger('insurance');
      }

      if (textValue) {
        let deletedInsurance = insuranceFiles
          ?.filter(value => value.name === item.name)
          .map((file: any) => file.name);

        setDeletedFiles((prev: any) => {
          return {
            ...prev,
            insuranceFilesToDelete: [
              ...deletedFiles.insuranceFilesToDelete,
              ...deletedInsurance
            ]
          };
        });
      }
    }
  };

  // onSubmit for driver
  const onSubmit = async (params: any) => {
    const formattedBreakWindows = params.availableDays
      ?.filter((value: any) => value.day)
      .map((day: any) => ({
        day: day?.label?.toLowerCase(),
        fromHours: formatISTtoHHMM(day?.fromTime),
        toHours: formatISTtoHHMM(day?.toTime),
        driverBreakWindowList: day?.breakIntervals?.map((breakItem: any) => ({
          breakFrom: breakItem.breakTimeFrom
            ? dayjs(breakItem.breakTimeFrom).format('HH:mm')
            : null,
          breakTo: breakItem.breakTimeTo
            ? dayjs(breakItem.breakTimeTo).format('HH:mm')
            : null
        }))
      }));

    const breakTimeCommon = params.time
      ?.filter(
        (times: any) => Boolean(times?.breakTimeFrom) && Boolean(times?.breakTimeTo)
      )
      ?.map((timeValue: any) => ({
        breakFrom: dayjs(timeValue.breakTimeFrom).format('HH:mm'),
        breakTo: dayjs(timeValue.breakTimeTo).format('HH:mm')
      }));
    const { availableDays, ...payload } = params;

    const defaultSchedule = [
      { day: 'sunday', fromHours: '07:30', toHours: '20:30', driverBreakWindowList: [] },
      { day: 'monday', fromHours: '07:30', toHours: '20:30', driverBreakWindowList: [] },
      { day: 'tuesday', fromHours: '07:30', toHours: '20:30', driverBreakWindowList: [] },
      {
        day: 'wednesday',
        fromHours: '07:30',
        toHours: '20:30',
        driverBreakWindowList: []
      },
      {
        day: 'thursday',
        fromHours: '07:30',
        toHours: '20:30',
        driverBreakWindowList: []
      },
      { day: 'friday', fromHours: '07:30', toHours: '20:30', driverBreakWindowList: [] },
      { day: 'saturday', fromHours: '07:30', toHours: '20:30', driverBreakWindowList: [] }
    ];

    const driverAvailability =
      selectedDays.length > 0
        ? !isSameTimeVisible
          ? formattedBreakWindows.length > 0
            ? formattedBreakWindows
            : defaultSchedule
          : selectedDays.map((value: any) => ({
              day: value?.toLowerCase(),
              fromHours: fromTime,
              toHours: toTime,
              driverBreakWindowList: breakTimeCommon
            }))
        : defaultSchedule;

    const credentialsReq = {
      userName: params.userName,
      password: params.password,
      confirmPassword: params.confirmPassword
    };

    const role =
      APadmin || APoperator
        ? 'ROLE_AUTOPLANNERDRIVER'
        : deliveryRole
        ? 'ROLE_DT_DRIVER'
        : 'ROLE_YAANTRAC_DRIVER';

    const payloads: any = {
      firstName: params.firstName,
      lastName: params.lastName ? params.lastName : null,
      licenseNumber: params.licenseNumber ? params.licenseNumber : null,
      contactEmail: params.contactEmail ? params.contactEmail : null,
      licenseType: params.licenseType,
      contactPhone: params.contactPhone,
      licenseExpire: params.licenseExpire,
      medicalExpire: params.medicalExpire,
      insuranceExpire: params.insuranceExpire,
      isMultipleHours: !isSameTimeVisible,
      ...(params.userName ? { credentialsReq } : {}),
      driverAvailability,
      role
    };

    if (textValue?.hasLogin) {
      payloads.hasLogin = textValue?.hasLogin;
    }

    const deleteFiles = {
      licenseFilesToDelete: deletedFiles.licenseFilesToDelete,
      medicalFilesToDelete: deletedFiles.medicalFilesToDelete,
      insuranceFilesDelete: deletedFiles.insuranceFilesToDelete
    };
    if (selected) {
      const payload: any = new FormData();
      payload.append(
        'addNewDriverRequest',
        new Blob([JSON.stringify(payloads)], { type: 'application/json' })
      );
      if (
        deleteFiles.insuranceFilesDelete?.length > 0 ||
        deleteFiles?.licenseFilesToDelete?.length > 0 ||
        deleteFiles?.medicalFilesToDelete?.length > 0
      ) {
        payload.append(
          'filesToDelete',
          new Blob([JSON.stringify(deleteFiles)], { type: 'application/json' })
        );
      }

      licenseFile.forEach((item: any, index: number) => {
        if (item?.size) payload.append('drivingLicense', licenseFile[index]);
      });
      insuranceFiles.forEach((item: any, index: number) => {
        if (item?.size) payload.append('driverInsurance', insuranceFiles[index]);
      });

      medicalFile.forEach((item: any, index: number) => {
        if (item?.size)
          payload.append('medicalCertificate', medicalFile ? medicalFile[index] : null);
      });
      // if (payload) {
      //   await dispatch(
      //     updateDriver({
      //       updatePayload: payload,
      //       driverID: textValue.driverID,
      //       signal: signal
      //     })
      //   );
      // }

      const action1 = await dispatch(
        updateDriver({
          updatePayload: payload,
          driverID: textValue.driverID
        })
      );
      if (action1.type === updateDriver.fulfilled.type) {
        setOpen(false);
        await dispatch(
          getDriver({ ...filterPayload, pageNo: pageNo, pageSize: pageSize })
        );
        setPageNo(pageNo);
        setPageSize(pageSize);
      }
    } else if (!selected) {
      const payload: any = new FormData();
      payload.append(
        'addNewDriverRequest',
        new Blob([JSON.stringify(payloads)], { type: 'application/json' })
      );
      licenseFile.forEach((item: any, index: number) => {
        payload.append('drivingLicense', licenseFile[index]);
      });
      insuranceFiles.forEach((item: any, index: number) => {
        payload.append('driverInsurance', insuranceFiles[index]);
      });
      medicalFile.forEach((item: any, index: number) => {
        payload.append('medicalCertificate', medicalFile[index]);
      });

      const addDriverPayload = {
        payload: payload
      };

      const action2 = await dispatch(addDriver(addDriverPayload));
      if (action2.type === addDriver.fulfilled.type) {
        setOpen(false);
        await dispatch(getDriver({ pageNo: pageNo, pageSize: pageSize }));

        setValue('contactEmail', '');
        setValue('contactPhone', '');
        setValue('firstName', '');
        setValue('lastName', '');
        setValue('licenseNumber', '');
        setValue('licenseType', '');
        setValue('insuranceExpire', '');
        setValue('medicalExpire', '');
        setPageNo(pageNo);
        setPageSize(pageSize);
      }
    }
  };

  //function for selecting driver avalialbity days
  const toggleDay = (day: string) => {
    setSelectedDays((prevDays: any) => {
      const activeDays = prevDays?.includes(day)
        ? prevDays.filter((item: string) => item !== day)
        : [...prevDays, day];
      if (activeDays.length > 0) {
        setValue('days', true);
        clearErrors('days');
      } else {
        setValue('days', false);
        trigger('days');
      }
      return activeDays;
    });
  };

  //function for driver working hours
  const handleMinTime = (event: string, type: string) => {
    const time = formatISTtoHHMM(event);
    type === 'from' ? setFromTime(time) : setToTime(time);
    if (type === 'from') {
      trigger('availableFrom');
      trigger(`availableDays`);
      setMinPickTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 60)
      );
    } else if (type === 'to') {
      setMaxPickTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 60)
      );
      trigger('availableTo');
      trigger(`availableDays`);
    }
  };

  const handleMinTimeBreak = (event: string, type: string) => {
    const time = formatISTtoHHMM(event);

    if (type === 'from') {
      trigger('availableFrom');
      setMinPickTime(
        dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 60)
      );
    } else if (type === 'to') {
      trigger('availableTo');
    }
  };

  //function for handling multiple from Time
  const handleFromTime = (index: number, date: any, day: any) => {
    const fromTime = date?.$d;

    if (fromTime) {
      setMinPickTimes((prev: any) => {
        const time = formatISTtoHHMM(fromTime);
        let newTime = [...prev];
        newTime[index] = dayjs()
          .set('hour', parseFloat(time.split(':')[0]))
          .set('minute', parseFloat(time.split(':')[1]) + 60);
        return newTime;
      });

      update(index, {
        ...day,
        fromTime: fromTime
      });

      setValue(
        `availableDays.${index}`,
        {
          day: getValues(`availableDays.${index}.day`),
          label: getValues(`availableDays.${index}.label`),
          value: getValues(`availableDays.${index}.value`),
          fromTime: fromTime,
          toTime: getValues(`availableDays.${index}.toTime`)
        }
        // { shouldValidate: true }
      );
    } else {
      resetField(`availableDays.${index}.fromTime`);
      resetField(`availableDays.${index}.toTime`);
      setValue('multipleTimeDays', false);
      trigger('multipleTimeDays');
      trigger(`availableDays.${index}`);
    }

    // update(index, {
    //   day: getValues(`availableDays.${index}.day`),
    //   label: getValues(`availableDays.${index}.label`),
    //   value: getValues(`availableDays.${index}.value`),
    //   fromTime: fromTime,
    //   toTime: getValues(`availableDays.${index}.toTime`)
    // });
    trigger(`availableDays.${index}.fromTime`);
  };
  const handleToTime = (index: number, date: any, day: any) => {
    const toTime = date?.$d;
    // update(index, {
    //   day: getValues(`availableDays.${index}.day`),
    //   label: getValues(`availableDays.${index}.label`),
    //   value: getValues(`availableDays.${index}.value`),
    //   fromTime: getValues(`availableDays.${index}.fromTime`),
    //   toTime: toTime
    // });
    setMaxPickTimes((prev: any) => {
      const time = formatISTtoHHMM(toTime);
      let newTime = [...prev];
      newTime[index] = dayjs()
        .set('hour', parseFloat(time.split(':')[0]))
        .set('minute', parseFloat(time.split(':')[1]) + 60);
      return newTime;
    });

    update(index, {
      ...day,
      toTime: toTime
    });
    setValue(
      `availableDays.${index}`,
      {
        day: getValues(`availableDays.${index}.day`),
        label: getValues(`availableDays.${index}.label`),
        value: getValues(`availableDays.${index}.value`),
        fromTime: getValues(`availableDays.${index}.fromTime`),
        toTime: toTime
      }
      // { shouldValidate: true }
    );
    if (toTime) setValue('multipleTimeDays', true);
    else setValue('multipleTimeDays', false);
    trigger('multipleTimeDays');
    trigger(`availableDays.${index}.toTime`);
  };

  useEffect(() => {
    if (selected) {
      clearErrors();
      setValue('isUpdate', true);
      setValue('contactEmail', textValue.contactEmail);
      setValue('optional', true);
      setValue('contactPhone', textValue.contactPhone);
      setValue('firstName', textValue.firstName);
      setValue('lastName', textValue.lastName);
      setValue('licenseNumber', textValue.licenseNumber);
      if (!textValue.isMultipleHours) {
        const updateDays =
          textValue.driverAvailability?.map((item: any) => item.day) ?? [];
        setIsSameTimeVisible(true);
        setSelectedDays(updateDays);

        // textValue.driverAvailability.forEach((availability: any) => {});
      } else {
        setIsSameTimeVisible(false);
        fields.forEach((field: any, index: number) => {
          const breakIntervals = textValue.driverAvailability[
            index
          ]?.driverBreakWindowList?.map((item: any) => ({
            breakTimeFrom: dayjs()
              .set('hour', parseFloat(item?.breakFrom.split(':')[0]))
              .set('minute', parseFloat(item?.breakFrom.split(':')[1])),
            previousFrom: dayjs()
              .set('hour', parseFloat(item?.breakFrom.split(':')[0]))
              .set('minute', parseFloat(item?.breakFrom.split(':')[1])),
            breakTimeTo: dayjs()
              .set('hour', parseFloat(item?.breakTo.split(':')[0]))
              .set('minute', parseFloat(item?.breakTo.split(':')[1])),
            previousTo: dayjs()
              .set('hour', parseFloat(item?.breakTo.split(':')[0]))
              .set('minute', parseFloat(item?.breakTo.split(':')[1]))
          }));
          textValue.driverAvailability?.forEach((item: any, driverindex: number) => {
            if (field.value === item.day) {
              update(index, {
                day: true,
                label: capitalizeFirstLetter(item?.day),
                value: item?.day,
                fromTime: dayjs()
                  .set('hour', parseFloat(item?.fromHours.split(':')[0]))
                  .set('minute', parseFloat(item?.fromHours.split(':')[1])),
                toTime: dayjs()
                  .set('hour', parseFloat(item?.toHours.split(':')[0]))
                  .set('minute', parseFloat(item?.toHours.split(':')[1])),
                breakIntervals: breakIntervals
              });
              setValue('multipleTimeDays', true);
            }
          });
        });
      }
      if (textValue?.driverAvailability && !textValue?.isMultipleHours) {
        textValue.driverAvailability.forEach((availability: any) => {
          availability.driverBreakWindowList.forEach(
            (breakTime: any, breakIndex: any) => {
              updateBreak(breakIndex, {
                breakTimeFrom: dayjs()
                  .set('hour', parseFloat(breakTime.breakFrom.split(':')[0]))
                  .set('minute', parseFloat(breakTime.breakFrom.split(':')[1])),
                breakTimeTo: dayjs()
                  .set('hour', parseFloat(breakTime.breakTo.split(':')[0]))
                  .set('minute', parseFloat(breakTime.breakTo.split(':')[1]))
              });
            }
          );
          let availableFrom = dayjs()
            .set('hour', parseFloat(availability.fromHours.split(':')[0]))
            .set('minute', parseFloat(availability.fromHours.split(':')[1]));
          setValue('availableFrom', availableFrom);
          setFromTime(availability.fromHours);

          let availableTo = dayjs()
            .set('hour', parseFloat(availability.toHours.split(':')[0]))
            .set('minute', parseFloat(availability.toHours.split(':')[1]));
          setValue('availableTo', availableTo);
          setToTime(availability.toHours);

          setMinPickTime(
            dayjs()
              .set('hour', parseFloat(availability.fromHours.split(':')[0]))
              .set('minute', parseFloat(availability.fromHours.split(':')[1]) + 60)
          );
          setMaxPickTime(
            dayjs()
              .set('hour', parseFloat(availability.toHours.split(':')[0]))
              .set('minute', parseFloat(availability.toHours.split(':')[1]) + 60)
          );
        });
      }

      setDate((prev: any) => ({
        ...prev,
        licenseExpire: textValue?.licenseExpire
          ? dayjs(textValue?.licenseExpire * 1000)
          : null,
        insuranceExpire: textValue?.insuranceExpire
          ? dayjs(textValue?.insuranceExpire * 1000)
          : null,
        medicalExpire: textValue?.medicalExpire
          ? dayjs(textValue?.medicalExpire * 1000)
          : null
      }));

      setValue(
        'days',
        textValue?.driverAvailability?.map((item: any) => item.day)?.length > 0
          ? true
          : false
      );
      setValue(
        'licenseExpire',
        textValue?.licenseExpire !== null && textValue?.licenseExpire !== undefined
          ? textValue?.licenseExpire
          : undefined
      );
      setValue(
        'insuranceExpire',
        textValue?.insuranceExpire !== null && textValue?.insuranceExpire !== undefined
          ? textValue?.insuranceExpire
          : textValue?.insuranceExpire
      );

      setValue(
        'medicalExpire',
        textValue?.medicalExpire !== null && textValue?.medicalExpire !== undefined
          ? textValue?.medicalExpire
          : textValue?.medicalExpire
      );
      setValue('licenseType', textValue.licenseType);
      if (textValue?.driverLicenseFileName?.length > 0) {
        let licenseFile = textValue?.driverLicenseFileName?.map(
          (item: string, index: number) => ({
            name: item,
            type:
              item.split('.')[1] === 'png' ||
              item.split('.')[1] === 'jpg' ||
              item.split('.')[1] === 'jpeg'
                ? `image/${item.split('.')[0]}`
                : ''
          })
        );
        setLicenseFile(licenseFile);
        setValue('license', licenseFile);
      }

      if (textValue?.driverMedicalFileName?.length > 0) {
        let medicalFile = textValue?.driverMedicalFileName?.map(
          (item: string, index: number) => ({
            name: item,
            type:
              item.split('.')[1] === 'png' ||
              item.split('.')[1] === 'jpg' ||
              item.split('.')[1] === 'jpeg'
                ? `image/${item.split('.')[0]}`
                : ''
          })
        );
        setMedicalFile(medicalFile);
        setValue('medical', medicalFile);
      }

      if (textValue?.driverInsuranceFileName?.length > 0) {
        let insuranceFile = textValue?.driverInsuranceFileName?.map(
          (item: string, index: number) => ({
            name: item,
            type:
              item.split('.')[1] === 'png' ||
              item.split('.')[1] === 'jpg' ||
              item.split('.')[1] === 'jpeg'
                ? `image/${item.split('.')[0]}`
                : ''
          })
        );
        setInsuranceFile(insuranceFile);
        setValue('insurance', insuranceFile);
      }
    } else if (!selected) {
      setValue('contactEmail', '');
      setValue('contactPhone', '');
      setValue('firstName', '');
      setValue('lastName', '');
      setValue('licenseNumber', '');
      setValue('licenseType', '');
      setValue('insuranceExpire', '');
      setValue('optional', false);
      setValue('medicalExpire', '');
    }
    if (isMapping) {
      const primaryNumber = textValue?.vehicleInfoList?.find(
        (item: any) => item.isPrimary === 1
      );
      const secondaryNumber = textValue?.vehicleInfoList?.find(
        (item: any) => item.isPrimary === 0
      );
      const updatedData = secondaryVehicleData
        .filter((item: any) => item !== primaryNumber?.vehicleNumber)
        ?.map((item: any) => ({
          id: item,
          label: item?.toUpperCase()
        }));
      setSecondVehicle(updatedData);
      mappingSetValue('driverid', textValue.firstName);
      mappingSetValue('vehiclenumber', primaryNumber?.vehicleNumber);
      mappingSetValue('secondaryVehicle', secondaryNumber?.vehicleNumber);
      if (textValue?.vehicleInfoList?.length > 0) {
        setCallApi(true);
      }
    }
  }, [isMapping, selected, textValue, secondaryVehicleData]);

  useEffect(() => {
    if (!selected) {
      setIsSameTimeVisible(true);
    }
  }, [selected]);

  // useEffect(() => {
  //   if (getValues('availableDays') && !isSameTimeVisible) {
  //     let multipleDays = getValues('availableDays')?.some((item: any) => {
  //       if (item?.day === true && item?.fromTime && item?.toTime) return true;
  //       else return false;
  //     });
  //     if (multipleDays) {
  //       setValue('multipleTimeDays', true);
  //  //       clearErrors('multipleTimeDays');
  //     }
  //   }
  // }, [fields]);

  // useEffect(() => {
  //   if (errors?.contactEmail) {
  //     trigger('contactEmail');
  //   }
  // }, [errors.contactEmail]);

  useEffect(() => {
    // Dispatch action to fetch unmap vehicles
    // if (isMapping) {
    //   dispatch(getUnmapVehicle(createAbort().abortCall.signal));
    // }
    // setValue('medicalFiles', false);
    // setValue('insuranceFiles', false);
    return () => {
      dispatch(
        setValidationErrors({
          fieldName: 'contactEmail',
          error: '',
          status: true
        })
      );
      dispatch(
        setValidationErrors({
          fieldName: 'userName',
          error: '',
          status: true
        })
      );
      dispatch(
        setValidationErrors({
          fieldName: 'contactPhone',
          error: '',
          status: true
        })
      );
      dispatch(
        setValidationErrors({
          fieldName: 'licenseNumber',
          error: '',
          status: true
        })
      );
    };
  }, []);

  useEffect(() => {
    trigger('userName');
  }, [validationErrors.userName]);

  useEffect(() => {
    trigger('contactEmail');
  }, [validationErrors.contactEmail]);

  useEffect(() => {
    if (error) trigger('contactPhone');
  }, [validationErrors?.contactPhone, error]);

  useEffect(() => {
    trigger('licenseNumber');
  }, [validationErrors?.licenseNumber]);

  // onSubmit for Mapping driver
  const mappingOnSubmit = async (params: any) => {
    const isVehicle = textValue?.vehicleInfoList?.length > 0;
    const secondaryVehicle: any = mappingGetValue('secondaryVehicle');
    if (
      isMapping &&
      (callApi ||
        secondaryVehicle?.length > 0 ||
        (!callApi && !secondaryCallApi && isVehicle))
    ) {
      // const action3 = await dispatch(
      //   mapDriver({
      //     driverId: textValue.driverID,
      //     primaryVehicle: params.vehiclenumber,
      //     secondaryVehicles: params?.map((item: any) => item?.id)
      //   })
      // );
      const action3 = await dispatch(
        assignVehicle({
          driverId: textValue.driverID,
          primaryVehicle: params.vehiclenumber ?? null,
          secondaryVehicles: [params?.secondaryVehicle ?? '']
        })
      );
      if (action3.type === assignVehicle.fulfilled.type) {
        setOpen(false);
        // await dispatch(getUnmapVehicle(createAbort().abortCall.signal));
        setPageNo(pageNo);
        setPageSize(pageSize);
        await dispatch(
          getDriver({
            ...filterPayload,
            pageNo: pageNo,
            pageSize: pageSize,
            signal: createAbort().abortCall.signal
          })
        );
        createAbort().abortCall.abort();
      }
    }
  };
  useEffect(() => {
    if (textValue.contactEmail && !isMapping) {
      dispatch(
        driverValidation({
          category: 'contactEmail',
          value: textValue.contactEmail ? textValue.contactEmail : null,
          operation: textValue ? 'update' : 'add',
          driverID: textValue?.driverID
        })
      );
    }
  }, [textValue]);
  let value: { old: any; new: any } = { old: null, new: null };

  const handleFilterChange = useCallback(
    debounce(async (event: string, field) => {
      let eventFilter = field === 'contactPhone' ? 'mobileNumber' : field;
      setValidationField(field);
      setValidationFields((prev: any) => ({
        ...prev,
        [field]: { status: true }
      }));
      if (
        ['contactPhone', 'contactEmail', 'userName', 'licenseNumber']?.includes(field) &&
        event
      ) {
        const response = await dispatch(
          driverValidation({
            category: eventFilter,
            value: event ? event : null,
            operation: textValue ? 'update' : 'add',
            driverID: textValue?.driverID
          })
        );

        if (field === 'contactPhone' && response?.payload?.status !== 200) setError(true);
        await dispatch(
          setValidationErrors({
            fieldName: field,
            error: response?.payload?.status !== 200 ? response.payload : '',
            status: false
          })
        );
        setValidationFields((prev: any) => ({
          ...prev,
          [field]: { status: false }
        }));
        trigger(field);
      }
    }),
    [validationErrors]
  );

  const licenseType = [
    { id: 'MCWG', label: 'MCWG (Motorcycle with Gear)' },
    { id: 'MCWOG', label: 'MCWOG (Motorcycle without Gear)' },
    { id: 'LMV', label: 'LMV (Light Motor Vehicle)' },
    { id: 'LMV-TT', label: 'LMV-TT (Light Motor Vehicle Transport Taxis)' },
    { id: 'MGV', label: 'MGV (Medium Goods Vehicle)' },
    { id: 'MPV', label: 'MPV (Medium Passenger Vehicle)' },
    { id: 'HGV', label: 'HGV (Heavy Goods Vehicle)' },
    { id: 'HMV', label: 'HMV (Heavy Motor Vehicle)' }
  ];

  useEffect(() => {
    if (!textValue) {
      let availableFrom = dayjs()
        .set('hour', parseFloat('07'))
        .set('minute', parseFloat('30'));
      setValue('availableFrom', availableFrom);
      setValue('days', true);
      setMinPickTime(
        dayjs()
          .set('hour', parseFloat('07'))
          .set('minute', parseFloat('30') + 60)
      );
      setMaxPickTime(
        dayjs()
          .set('hour', parseFloat('20'))
          .set('minute', parseFloat('30') + 60)
      );
      setFromTime('07:30');
      let availableTo = dayjs()
        .set('hour', parseFloat('20'))
        .set('minute', parseFloat('30'));
      setValue('availableTo', availableTo);
      setToTime('20:30');
    }

    return () => {
      dispatch(clearMailError());
    };
  }, []);

  useEffect(() => {
    setValidationErrorsMake({
      userName: userNameValidation?.error,
      contactEmail: contactEmails.error,
      contactPhone: contactPhone.error,
      licenseNumber: licenseNumber.error
    });
  }, [userNameValidation, contactEmails, contactPhone, licenseNumber]);

  useEffect(() => {
    if (isMapping) {
      dispatch(primaryVehicle(textValue.driverID));
      dispatch(secondaryVehicle(textValue.driverID));
    }
  }, [isMapping]);

  useEffect(() => {
    if (primaryVehicleData?.length > 0) {
      let primaryVehiclesOption = primaryVehicleData?.map((item: any) => ({
        id: item,
        label: item?.toUpperCase()
      }));
      setFirstVehicle(primaryVehiclesOption);
    } else {
      setFirstVehicle([]);
    }
  }, [primaryVehicleData, textValue]);

  return (
    <>
      <Box p={2}>
        {!isMapping ? (
          <Dialog
            open={open}
            fullWidth
            maxWidth={'lg'}
            BackdropProps={{
              invisible: true
            }}
            sx={{ zIndex: 1 }}
          >
            <DialogContent className='adddriver-container'>
              <Box className='add-driver-header'>
                <Typography fontWeight={700} color={'#26134b'}>
                  {selected ? 'Update Driver' : 'Add Driver'}
                </Typography>
                <Box
                  className='driver-close'
                  onClick={onClose}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                    }
                  }}
                >
                  <Icon icon='ic:round-close' className='driver-close-icon' />
                </Box>
              </Box>
              <Box
                component='form'
                className='add-driver-component'
                onSubmit={handleSubmit(onSubmit)}
              >
                {/* {!textValue.hasLogin && (
                  <Box className='add-driver-credentials'>
                    <Typography className='credentials-head'>
                      Driver credential
                    </Typography>
                    <Grid container spacing={2} marginLeft={'-15px'}>
                      <Grid item xs={12} sm={6} md={4} lg={4}>
                        <CustomTextField
                          control={control}
                          name='userName'
                          placeholder='Username'
                          id='userName'
                          label='Username'
                          isOptional={true}
                          maxlength={30}
                          loading={
                            validationFields?.userName?.status &&
                            validationField === 'userName'
                          }
                          onChangeCallback={(e: any) => {
                            if (isValidField('username', e)) {
                              setUsername(e);
                              handleFilterChange(e, 'userName');
                            } else {
                              setUsername(false);
                              setValue('userName', '');
                            }
                            trigger('userName');
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={4}>
                        <CustomTextField
                          label='Password'
                          id='password'
                          type='password'
                          placeholder='Password'
                          control={control}
                          name='password'
                          maxlength={16}
                          isOptional={!username}
                          onChangeCallback={(e: any) => {
                            setValue('password', e);
                            trigger('password');
                            if (getValues('confirmPassword')) {
                              trigger('confirmPassword');
                            }
                          }}
                          icon={
                            <Icon
                              icon='teenyicons:lock-outline'
                              width='15'
                              height='15'
                              style={{ color: 'black' }}
                            />
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={4}>
                        <CustomTextField
                          label='Confirm Password'
                          id='confirmPassword'
                          isOptional={!username}
                          placeholder='Confirm Password'
                          control={control}
                          type='password'
                          maxlength={16}
                          name='confirmPassword'
                          icon={
                            <Icon
                              icon='teenyicons:lock-outline'
                              width='15'
                              height='15'
                              style={{ color: 'black' }}
                            />
                          }
                          onChangeCallback={(e: any) => {
                            setValue('confirmPassword', e);
                            if (getValues('password') && getValues('confirmPassword')) {
                              trigger('confirmPassword');
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )} */}
                <Grid container spacing={2} marginLeft={'-15px'}>
                  {textfield.map((items: any) => (
                    <Grid key={items?.id} item xs={12} sm={6} md={4} lg={4}>
                      {items?.id === '10' || items.id === '11' || items?.id === '12' ? (
                        <CustomDateCalendar
                          id={items.id}
                          name={items.field}
                          control={control}
                          disableFuture={false}
                          disablePast={true}
                          minDate={minDate}
                          isOptional={
                            (items?.id === '10' && licenseFile?.length === 0) ||
                            (items?.id === '11' && insuranceFiles?.length === 0) ||
                            (items?.id === '12' && medicalFile?.length === 0)
                          }
                          placeholder={items.placeholder}
                          label={items.label}
                          value={date?.[items?.field]}
                          onDateChange={(date: any) => {
                            if (date?.$d && date?.$d != 'Invalid Date') {
                              const epoc = date ? convertToEpoch2(date?.$d) : null;
                              if (items?.id === '10') {
                                setValue(
                                  'licenseExpire',
                                  epoc !== null ? String(epoc) : ''
                                );
                                setDate((prev: any) => ({
                                  ...prev,
                                  licenseExpire: date.$d
                                }));
                                trigger('licenseExpire');
                              } else if (items?.id === '11') {
                                setValue(
                                  'insuranceExpire',
                                  epoc !== null ? String(epoc) : ''
                                );
                                setDate((prev: any) => ({
                                  ...prev,
                                  insuranceExpire: date.$d
                                }));
                                trigger('insuranceExpire');
                              } else {
                                setValue(
                                  'medicalExpire',
                                  epoc !== null ? String(epoc) : ''
                                );
                                setDate((prev: any) => ({
                                  ...prev,
                                  medicalExpire: date.$d
                                }));
                                trigger('medicalExpire');
                              }
                            } else {
                              setDate((prev: any) => ({
                                ...prev,
                                [items?.field]: null
                              }));
                              setValue(items.field, '');
                            }
                          }}
                        />
                      ) : items?.field === 'licenseType' ? (
                        <CustomSelect
                          id={items.id}
                          options={licenseType}
                          control={control}
                          isOptional={items.id === '6'}
                          name={items.field}
                          label={items.label}
                          placeholder='License type'
                        />
                      ) : !items.field ? (
                        <Box>
                          <CustomFileUpload
                            label={items.title}
                            isOptional={items.id === '7'}
                            handleUpload={(e: any) => {
                              // e.stopPropagation();

                              const fileLimitReached =
                                (items?.label === 'License' && licenseFile.length >= 2) ||
                                (items?.label === 'Insurance' &&
                                  insuranceFiles.length >= 2) ||
                                (items?.label === 'Medical' && medicalFile.length >= 2);

                              if (fileLimitReached) {
                                dispatch(
                                  updateToast({
                                    show: true,
                                    message: 'You can only upload two files',
                                    severity: 'warning'
                                  })
                                );
                                return;
                              }

                              handleFileUpload(items?.label);
                            }}
                            error={
                              items?.label === 'License'
                                ? errors?.license?.message
                                : items?.label === 'Medical'
                                ? errors?.medical?.message
                                : items?.label === 'Insurance'
                                ? errors?.insurance?.message
                                : ''
                            }
                            handleDelete={(item: any) => {
                              handleDelete(item, items?.label);
                            }}
                            files={
                              items?.label === 'License'
                                ? licenseFile
                                : items?.label === 'Insurance'
                                ? insuranceFiles
                                : items?.label === 'Medical'
                                ? medicalFile
                                : []
                            }
                            showUploadButton={
                              !(
                                (items?.label === 'License' && licenseFile.length >= 2) ||
                                (items?.label === 'Insurance' &&
                                  insuranceFiles.length >= 2) ||
                                (items?.label === 'Medical' && medicalFile.length >= 2)
                              )
                            }
                          />
                        </Box>
                      ) : items?.id === '4' ? (
                        <Controller
                          name='contactPhone'
                          control={control}
                          // defaultValue={selected?.mobileNumber || '+65'}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <PhoneNoTextField
                              {...field}
                              country={isAutoplanner ? 'sg' : ''}
                              setValue={setValue}
                              // disableCountry={isAutoplanner ? true : false}
                              style='share'
                              label='Contact Number'
                              onChange={(e: any) => {
                                if (e) {
                                  const emptySpace = /^.+\s.+$/g;
                                  const valid = isValidField('contactnumber', e);
                                  if (e && !emptySpace.test(e) && valid) {
                                    handleFilterChange(e, items.field);
                                  }
                                }
                                trigger('contactPhone');
                              }}
                              error={Boolean((errors as any)?.contactPhone?.message)}
                              helperText={(errors as any)?.contactPhone?.message}
                            />
                          )}
                        />
                      ) : (
                        <CustomTextField
                          key={items.id}
                          control={control}
                          name={items.field}
                          placeholder={items.placeholder}
                          id={items.id}
                          label={items.label}
                          inputProps={items.inputProps}
                          isOptional={
                            items?.id === '2' || items?.id === '5' || items?.id === '3'
                          }
                          loading={
                            (items.field === Object.keys(validationFields)?.[0] &&
                              validationFields.contactEmail.status) ||
                            (items.field === Object.keys(validationFields)?.[1] &&
                              validationFields.contactPhone.status) ||
                            (items.field === Object.keys(validationFields)?.[2] &&
                              validationFields.licenseNumber.status)
                          }
                          onChangeCallback={(e: any) => {
                            if (!e) {
                              dispatch(
                                setValidationErrors({
                                  fieldName: items?.field,
                                  error: '',
                                  status: true
                                })
                              );
                            }
                            if (
                              items?.field === 'contactEmail' ||
                              items?.field === 'licenseNumber'
                            ) {
                              const emptySpace = /^.+\s.+$/g;

                              if (e && !emptySpace.test(e)) {
                                if (isValidField('email', e)) {
                                  handleFilterChange(e, items.field);
                                }
                              }
                            }
                            if (items?.field === 'contactEmail') {
                              trigger('contactEmail');
                            }
                          }}
                          onKeyDown={(e: any) => {
                            if (items?.field === 'licenseNumber') {
                              let NumberRegex = /^\S*$/;
                              if (!NumberRegex.test(e?.key)) {
                                e.preventDefault();
                              }
                            }
                          }}
                        />
                      )}
                    </Grid>
                  ))}
                </Grid>
                <Box className='driver-availability'>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px'
                    }}
                  >
                    <Typography paragraph className='driver-availability-title'>
                      Driver Availability
                    </Typography>
                    {!isSameTimeVisible &&
                    getValues('availableDays')?.every((item: any) => !item.day) ? (
                      <Alert severity='warning'>
                        If no days are selected, the driver will be assigned daily from
                        7:30 AM to 8:30 PM.
                      </Alert>
                    ) : (
                      ''
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '5px'
                      }}
                    >
                      <Switch
                        checked={isSameTimeVisible}
                        onChange={handleSwitchChange}
                        name='fieldSwitch'
                        inputProps={{ 'aria-label': 'Field Switch' }}
                      />
                      <Typography>Standard Shift</Typography>
                    </Box>
                  </Box>

                  {isSameTimeVisible ? (
                    <Box className='driver-available'>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          marginTop: '-10px',
                          position: 'relative'
                        }}
                      >
                        <Typography className='days-typo'>
                          Days<span style={{ color: 'red' }}> *</span>
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
                          {daysOfWeek?.map((day: any) => (
                            <Box
                              key={day.id}
                              onClick={() => toggleDay(day.id)}
                              className={`day-picker ${
                                selectedDays?.includes(day.id)
                                  ? 'selected-day'
                                  : 'non-selected-day'
                              }`}
                              tabIndex={0}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleDay(day.id);
                                }
                              }}
                            >
                              {day.label}
                            </Box>
                          ))}
                          {errors && (
                            <p className='error-days'>{errors?.days?.message as any}</p>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: '10px' }}>
                        <Box className='from-datepicker'>
                          <CustomTimePicker
                            id='from'
                            name='availableFrom'
                            control={control}
                            label='From'
                            values={getValues(`availableFrom`)}
                            // format='HH:mm'

                            isClock={true}
                            isOptional={false}
                            onTimeChange={(event: any) => {
                              if (event?.$d) handleMinTime(event?.$d, 'from');
                              trigger(`availableTo`);
                              trigger(`availableFrom`);
                            }}
                          />
                        </Box>
                        <Box className='to-datepicker'>
                          <CustomTimePicker
                            id='to'
                            name='availableTo'
                            control={control}
                            label='To'
                            values={getValues(`availableTo`)}
                            // format='HH:mm'
                            isClock={true}
                            isOptional={false}
                            minTime={minPickTime}
                            onTimeChange={(event: any) => {
                              trigger(`availableTo`);
                              trigger(`availableFrom`);
                              if (event?.$d) handleMinTime(event?.$d, 'to');
                            }}
                            isDisabled={!fromTime}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          width: '100%',
                          overflowX: 'scroll',
                          gap: '25px',
                          marginTop: '10px'
                        }}
                      >
                        {fields?.map((day: any, index: number) => (
                          <CustomDaySelection
                            // key={index}
                            day={day}
                            disableTime={getValues(`availableDays.${index}.day`)}
                            index={index}
                            isSelected={selectedDays.includes(day.id)}
                            onSelect={handleSelectDay}
                            control={control}
                            update={update}
                            setValue={setValue}
                            handleFromTime={handleFromTime}
                            handleToTime={handleToTime}
                            minPickTime={minPickTimes}
                            maxPickTimes={maxPickTimes}
                            getValues={getValues}
                            trigger={trigger}
                            errors={errors}
                            textValue={textValue.driverAvailability?.[index]}
                          />
                        ))}
                      </Box>
                      {errors && (
                        <p className='error-days'>
                          {errors?.multipleTimeDays?.message as any}
                        </p>
                      )}
                    </>
                  )}
                </Box>

                <>
                  {isSameTimeVisible && (
                    <>
                      <Typography className='driver-break-head'>
                        Driver Break Windows{' '}
                        <Typography
                          component='span'
                          variant='body2'
                          color='textSecondary'
                          sx={{ fontStyle: 'italic' }}
                        >
                          (Note: break window must be above 30 mins)
                        </Typography>
                      </Typography>

                      <Grid container spacing={1}>
                        {breakFields.map((location: any, breakIndex) => (
                          <Grid item xs={12} md={6}>
                            <Typography className='break-index'>
                              Break {breakIndex + 1}
                            </Typography>
                            <Grid container spacing={1} sx={{ width: '100%' }}>
                              <Grid item xs={5.5} md={5}>
                                <CustomTimePicker
                                  id={`time.${breakIndex}.breakTimeFrom`}
                                  name={`time.${breakIndex}.breakTimeFrom`}
                                  control={control}
                                  values={location.breakTimeFrom}
                                  minTime={minPickTime?.subtract(1, 'hour')}
                                  maxTime={maxPickTime?.subtract(1, 'hour')}
                                  label='From'
                                  isClock={true}
                                  isOptional={true}
                                  onTimeChange={(event: any) => {
                                    if (event?.$d && event.$d != 'Invalid Date') {
                                      setValue(
                                        `time.${breakIndex}.breakTimeFrom`,
                                        event?.$d
                                      );
                                      updateBreak(breakIndex, {
                                        ...breakFields[breakIndex],
                                        breakTimeFrom: event.$d
                                      });
                                      trigger(`time.${breakIndex}.breakTimeFrom`);
                                    } else {
                                      updateBreak(breakIndex, {
                                        ...breakFields[breakIndex],
                                        breakTimeFrom: null,
                                        breakTimeTo: null
                                      });
                                    }
                                  }}
                                />
                              </Grid>

                              <Grid item xs={5.5} md={5}>
                                <CustomTimePicker
                                  id={`time.${breakIndex}.breaktimeTo`}
                                  name={`time.${breakIndex}.breakTimeTo`}
                                  control={control}
                                  values={getValues(`time.${breakIndex}.breakTimeTo`)}
                                  label='To'
                                  isOptional={
                                    !getValues(`time.${breakIndex}.breakTimeFrom`)
                                  }
                                  minTime={minPickTime?.subtract(1, 'hour')}
                                  maxTime={maxPickTime?.subtract(1, 'hour')}
                                  onTimeChange={(event: any) => {
                                    if (event?.$d)
                                      setValue(
                                        `time.${breakIndex}.breaktimeTo`,
                                        event.$d
                                      );
                                    updateBreak(breakIndex, {
                                      ...breakFields[breakIndex],
                                      breakTimeTo: event?.$d
                                    });
                                    trigger(`time.${breakIndex}.breakTimeFrom`);
                                    trigger(`time.${breakIndex}.breakTimeTo`);
                                  }}
                                />
                              </Grid>

                              <Grid item xs={1} md={2}>
                                <IconButton
                                  onClick={() => {
                                    removeBreak(breakIndex);
                                    trigger('time');
                                  }}
                                >
                                  <Icon
                                    icon='ic:baseline-delete'
                                    className='delete-btn-break'
                                  />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                      {errors?.time?.root?.message && (
                        <Typography className='break-errors'>
                          {errors?.time?.root?.message as any}
                        </Typography>
                      )}

                      <CustomButton
                        category='Add Break Window'
                        variant='outlined'
                        className='add-break-btn'
                        startIcon={<AddCircleOutline />}
                        onClick={() => {
                          addBreak({ breakTimeFrom: null, breakTimeTo: null });
                          trigger('time');
                        }}
                      />
                    </>
                  )}
                </>

                <Box sx={{ marginTop: '2%', display: 'flex', gap: '15px' }}>
                  <CustomButton
                    className='saveChanges'
                    loading={isLoading && type === 'save-driver'}
                    type='submit'
                    category={selected ? 'Update' : 'Add Driver'}
                  />
                  <CustomButton
                    className='cancel'
                    category='Cancel'
                    onClick={() => {
                      setOpen(false);
                      setTextValue('');
                      reset();
                    }}
                  />
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer
            anchor='right'
            open={open}
            onClose={() => {
              setTextValue('');
              reset();
              mappingReset();
              setOpen(false);
            }}
            sx={{ zIndex: 1 }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px !important'
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#26134b !important' }}>
                {isMapping
                  ? 'Driver & Vehicle Mapping'
                  : selected
                  ? 'Update'
                  : 'Add Driver'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box component='form' onSubmit={handleMappingSubmit(mappingOnSubmit)}>
                  {mappingTextField.map(items => (
                    <CustomTextField
                      key={items.id}
                      control={mappingControl}
                      name={items.field}
                      placeholder={items.placeholder}
                      id={items.id}
                      label={items.label}
                      inputProps={items.inputProps}
                    />
                  ))}

                  {mappingSelectField?.map(items => (
                    <CustomSelect
                      key={items.id}
                      id={items.id}
                      options={firstVehicle ?? []}
                      loading={secondaryLoading}
                      control={mappingControl}
                      name={items.field}
                      label={items?.label}
                      isOptional={true}
                      placeholder={items?.label}
                      onChanges={(e: any, newValue: any) => {
                        if (newValue?.id) {
                          const updatedData = secondaryVehicleData
                            ?.filter((item: any) => item !== newValue?.id)
                            ?.map((item: any) => ({
                              id: item,
                              label: item.toUpperCase()
                            }));
                          setSecondVehicle(updatedData);
                          mappingSetValue('vehiclenumber', newValue?.id);
                          const isAlreadyExist = newValue?.id.includes(
                            mappingGetValue('secondaryVehicle')
                          );
                          if (isAlreadyExist) {
                            mappingSetValue('secondaryVehicle', '');
                          }
                          setCallApi(true);
                        } else {
                          mappingSetValue('vehiclenumber', '');
                          const primaryNumber = textValue?.vehicleInfoList?.find(
                            (item: any) => item.isPrimary === 1
                          );
                          const updatedData = secondaryVehicleData
                            ?.filter((item: any) => item !== primaryNumber?.vehicleNumber)
                            ?.map((item: any) => ({
                              id: item,
                              label: item?.toUpperCase()
                            }));
                          setSecondVehicle(updatedData);
                          setCallApi(false);
                        }
                      }}
                    />
                  ))}

                  {mappingMultiSelectField.map(items => (
                    <CustomSelect
                      key={items.id}
                      id={items.id}
                      options={secondVehicle ? secondVehicle : []}
                      // initialValue={mappingGetValue('secondaryVehicle')?.map(
                      //   (item: any) => item.id
                      // )}
                      loading={secondaryLoading}
                      control={mappingControl}
                      // setValue={mappingSetValue}
                      isOptional={true}
                      name={items.field}
                      label={items?.label}
                      placeholder={items?.label}
                      onChanges={(e: any, newValue: any) => {
                        if (newValue?.length > 0) {
                          mappingSetValue('secondaryVehicle', newValue);
                          setSecondaryCallApi(true);
                          let primaryVehiclesOption = primaryVehicleData?.map(
                            (item: any) => ({
                              id: item,
                              label: item?.toUpperCase()
                            })
                          );
                          // const isPrimary = textValue?.vehicleInfoList?.find(
                          //   (item: any) => item.isPrimary === 1
                          // );
                          // if (isPrimary) {
                          //   primaryVehiclesOption.push({
                          //     id: isPrimary.vehicleNumber,
                          //     label: isPrimary.vehicleNumber.toUpperCase()
                          //   });
                          // }
                          const id = newValue?.map((item: any) => item.id);
                          const filteredData = primaryVehiclesOption?.filter(
                            (item: any) => !id.includes(item.id)
                          );
                          setFirstVehicle(filteredData);
                        } else {
                          setSecondaryCallApi(false);
                          if (primaryVehicleData?.length > 0) {
                            let primaryVehiclesOption = primaryVehicleData?.map(
                              (item: any) => ({
                                id: item,
                                label: item?.toUpperCase()
                              })
                            );
                            // const isPrimary = textValue?.vehicleInfoList?.find(
                            //   (item: any) => item.isPrimary === 1
                            // );
                            // if (isPrimary) {
                            //   primaryVehiclesOption.push({
                            //     id: isPrimary.vehicleNumber,
                            //     label: isPrimary.vehicleNumber.toUpperCase()
                            //   });
                            // }
                            setFirstVehicle(primaryVehiclesOption);
                          }
                        }
                      }}
                    />
                  ))}

                  <Box
                    sx={{
                      marginTop: '5%',
                      display: 'flex',
                      gap: '15px',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <CustomButton
                      loading={assignLoading && assignType === 'driver-mapping'}
                      className='saveChanges'
                      type='submit'
                      category='Add Mapping'
                    />
                    <CustomButton
                      className='cancel'
                      category='Cancel'
                      onClick={() => {
                        setOpen(false);
                        mappingReset();
                        const { abortCall } = createAbort();
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Drawer>
        )}
      </Box>
    </>
  );
}

export default DriverMapping;
