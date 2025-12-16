import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Drawer, Typography } from '@mui/material';
import CustomButton from '../../../../../../common/components/buttons/CustomButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  capitalizeFirstLetter,
  debounce,
  useAbort
} from '../../../../../../utils/commonFunctions';
import {
  addAgent,
  clearMailError,
  clearUsers,
  getAgent,
  getRateCard,
  setValidationErrors,
  updateAgent
} from '../../../../redux/reducer/autoPlannerSlices/agentslice';
import './AddAgents.scss';
import { useAddActions, useCommanStates, useRenderingHook } from './addAgentHook';
import AddAgentFields from './addAgentFields';

function AddAgent({
  setOpen,
  open,
  selected,
  isMapping,
  page,
  roles,
  tabValue,
  clearState,
  setIsScroll,
  setTabValue
}: any) {
  const [role, setRole] = useState(
    roles === 'ROLE_AGENT' ? 'company User' : tabValue === 0 ? 'agent' : 'opertor'
  );

  const {
    validationErrors,
    setValidationErrorsMake,
    validationField,
    setValidationField,
    error,
    setError,
    validationFields,
    setValidationFields
  } = useCommanStates();
  const addAgentData = useAppSelector(state => state.agentOnboard);
  const updateAgentData = useAppSelector(state => state.autoAgentUpdate);
  const { data } = useAppSelector(state => state.auth);
  const profile = useAppSelector(state => state.myProfile.data);

  const rateCardDropDown = useAppSelector(state => state.RateCardGet);

  const { company } = useAppSelector(state => state.RoleModuleAccess);

  const createAbort = useAbort();

  let roletype = data?.role;

  const APagent = roletype === 'ROLE_AGENT';

  const RateCardOption = rateCardDropDown?.data.map((item: any) => ({
    id: item.rateCardId,
    label: capitalizeFirstLetter(item?.rateCardName)
  }));

  const isAddingAgent = !selected;

  const validationSchema = (selected: any, validationErrors: any) =>
    yup.object({
      agentname: yup
        .string()
        .required('Enter username')
        .matches(
          /^[a-z0-9]+$/,
          'Username can only contain lowercase letters and numbers without spaces'
        )
        .min(3, 'Username must contain at least 3 characters')
        .max(30, 'Username cannot exceed 30 characters')
        // .matches(/[a-z]/, 'Username must include at least one character')
        .test('agentname', 'Enter valid username', function (value: any) {
          if (
            validationErrors?.userName &&
            validationErrors?.userName !== 'no-error' &&
            value
          ) {
            return this.createError({ message: validationErrors?.userName });
          } else {
            return true;
          }
        }),
      password:
        selected === null
          ? yup
              .string()
              .required('Enter password')
              .min(8, 'Password must be at least 8 characters')
              .max(16, 'Password must not exceed 16 characters')
              .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
              .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
              .matches(/[0-9]/, 'Password must contain at least one number')
              .matches(
                /[@$!%*?&#^()_\-+=]/,
                'Password must contain at least one special character'
              )
          : yup.string().notRequired(),

      confirmPassword:
        selected === null
          ? yup
              .string()
              .required('Enter confirm password')
              .max(20, 'Username cannot exceed 20 characters')
              .oneOf([yup.ref('password')], 'Passwords must match')
          : yup.string().notRequired(),
      roletype: yup.string().notRequired(),

      companyName: yup.string().when('roletype', {
        is: 'ROLE_AUTOPLANNER_ADMIN',
        then: () =>
          yup
            .string()
            .required('Enter Company name')
            .matches(
              /^[A-Za-z0-9-\s]+$/,
              'Company name must contain letters or numbers only'
            )
            .test(
              'at-least-one-letter',
              'Company name must contain at least one alphabet',
              value => /[A-Za-z]/.test(value || '')
            )
            .min(3, 'Company name must contain at least 3 characters')
            .max(50, 'Company name cannot exceed 50 characters'),
        otherwise: () => yup.string().notRequired()
      }),
      contactperson: yup
        .string()
        .required('Enter contact person name')
        .matches(
          /^[A-Za-z0-9-\s]+$/,
          'contact person name must contain letters or numbers only'
        )
        .test(
          'at-least-one-letter',
          'contact person name must contain at least one alphabet',
          value => /[A-Za-z]/.test(value || '')
        )
        .min(3, 'Contact person name must contain at least 3 characters')
        .max(50, 'Contact person name cannot exceed 50 characters'),
      phone: yup
        .string()
        .required('Enter contact number')
        .test('basic-contact', 'Invalid contact number', value => {
          if (!value) return true;
          const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
          return phoneRegex.test(value);
        })
        .test('phone', 'Invalid contact number', function (value: any) {
          if (
            validationErrors?.mobileNumber &&
            validationErrors.mobileNumber !== 'no-error' &&
            value
          ) {
            return this.createError({ message: validationErrors?.mobileNumber });
          } else {
            return true;
          }
        }),

      email: yup
        .string()
        .required('Enter email address')
        .matches(
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
          'Enter a valid email address'
        )
        .email('Email format is invalid')
        .test('email', 'Enter valid email', function (value: any) {
          if (validationErrors?.mail && validationErrors.mail !== 'no-error' && value) {
            return this.createError({ message: validationErrors?.mail });
          } else {
            return true;
          }
        }),
      ratecard: yup.string().notRequired(),
      country: yup.string().when('roletype', {
        is: 'ROLE_AUTOPLANNER_ADMIN',
        then: () => yup.string().required('Select country'),
        otherwise: () => yup.string().notRequired()
      }),
      website: yup.string().notRequired()
    });

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema(selected, validationErrors))
  });

  const { handleFilterChange, handleClose } = useAddActions({
    setValidationField,
    setValidationErrors,
    setValidationFields,
    selected,
    trigger,
    setError,
    reset,
    setOpen
  });

  const dispatch = useAppDispatch();

  const onSubmit = async (data: any) => {
    const getPayload = {
      pageNo: page,
      pageSize: APagent ? 16 : 8,
      role: roles,
      signal: createAbort().abortCall.signal
    };
    if (!selected) {
      let payload = {
        rateCardId: data.ratecard,
        userCredentialsReq: {
          userName: data.agentname,
          password: data?.password,
          confirmPassword: data?.confirmPassword
        },
        userOnboardProfileReq: {
          ...(!APagent ? { companyName: data?.companyName } : {}),
          country: data.country,
          email: data.email,
          contactNumber: `${data.phone}`,
          contactPersonName: data.contactperson,
          timezone: profile?.timezone || 'Asia/Singapore',
          ...(data.website !== '' && { website: data.website })
        },
        roleTypes: [
          role === 'agent'
            ? 'ROLE_AGENT'
            : role === 'operator'
            ? 'ROLE_OPERATOR'
            : 'ROLE_SUB_AGENT'
        ]
      };
      const params = { getPayload, payload };
      const action = await dispatch(addAgent(params));
      if (action.type === addAgent.fulfilled.type) {
        setIsScroll(false);
        clearState();
        dispatch(clearUsers());
        await dispatch(getAgent(getPayload));
        handleClose();
      }
    } else {
      let updatePayload = {
        userID: selected?.id,
        roleTypes: [
          role === 'agent'
            ? 'ROLE_AGENT'
            : role === 'operator'
            ? 'ROLE_OPERATOR'
            : 'ROLE_SUB_AGENT'
        ],
        rateCardId: data.ratecard,
        userOnboardProfileReq: {
          contactNumber: `${data.phone}`,
          country: data.country,
          ...(!APagent ? { companyName: data?.companyName } : {}),
          contactPersonName: data?.contactperson,
          email: data?.email,
          timezone: profile?.timezone || 'Asia/Singapore',
          ...(data.website !== '' && { website: data.website })
        }
      };
      const param = { getPayload, updatePayload };
      const action = await dispatch(updateAgent(param));

      if (action.type === updateAgent.fulfilled.type) {
        setIsScroll(false);
        clearState();
        dispatch(clearUsers());
        await dispatch(getAgent(getPayload));

        handleClose();
      }
    }
  };

  // useEffect(() => {
  //   dispatch(getMyProfileAction(createAbort().abortCall.signal));
  //   return () => {
  //     createAbort().abortCall.abort();
  //   };
  // }, []);

  useRenderingHook({
    setValue,
    selected,
    setRole,
    reset,
    company,
    APagent,
    tabValue,
    setValidationErrorsMake,
    validationErrors,
    trigger,
    error,
    roletype
  });

  const formHeader = !APagent
    ? `${selected ? 'Update' : 'Add'} Agent Admin`
    : `${selected ? 'Update' : 'Add'} Agent User`;

  return (
    <Box p={2}>
      <Drawer anchor='right' open={open} onClose={handleClose} sx={{ zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h6' sx={{ fontWeight: 700, marginBottom: '10px' }}>
            {isMapping ? 'Driver & Vehicle Mapping' : formHeader}
          </Typography>
          <Box component='form' onSubmit={handleSubmit(onSubmit)}>
            <AddAgentFields
              APagent={APagent}
              control={control}
              isAddingAgent={isAddingAgent}
              company={company}
              selected={selected}
              setValue={setValue}
              handleFilterChange={handleFilterChange}
              trigger={trigger}
              errors={errors}
              RateCardOption={RateCardOption}
              validationFields={validationFields}
              validationField={validationField}
            />

            <Box
              sx={{
                marginTop: '5%',
                display: 'flex',
                gap: '15px',
                justifyContent: 'end'
              }}
            >
              <CustomButton className='cancel' category='Cancel' onClick={handleClose} />
              <CustomButton
                className='saveChanges'
                type='submit'
                loading={addAgentData?.isLoading || updateAgentData?.isLoading}
                category='Save'
              />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

export default AddAgent;
