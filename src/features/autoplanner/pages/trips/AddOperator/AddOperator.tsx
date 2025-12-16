import { Box, Button, ButtonGroup, Drawer, Typography } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
// import './AddAgents.scss';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { capitalizeFirstLetter, useAbort } from '../../../../../utils/commonFunctions';
import {
  addAgent,
  agentValidation,
  clearMailError,
  clearUsers,
  getAgent,
  setValidationErrors,
  updateAgent
} from '../../../redux/reducer/autoPlannerSlices/agentslice';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import PhoneNoTextField from '../../../../../common/components/customized/customtextfield/PhoneNoTextField';
import CustomSelect from '../../../../../common/components/customized/customselect/CustomSelect';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import {
  getOperatorAdmin,
  getRolesDropdown
} from '../../../../../common/redux/reducer/commonSlices/roleSlice';
import {
  useActionsHook,
  useCommanStates,
  useOptionHook,
  useRendering
} from './addOperatorHook';
import AddOperatorFields from './addOperatorFields';

function AddOperator({
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
  const addAgentData = useAppSelector(state => state.agentOnboard);
  const updateAgentData = useAppSelector(state => state.autoAgentUpdate);
  const { data } = useAppSelector(state => state.auth);
  const profile = useAppSelector(state => state.myProfile.data);

  const mail = useAppSelector(state => state.agentValidation.email);
  const mobile = useAppSelector(state => state.agentValidation.mobileNumber);
  const user = useAppSelector(state => state.agentValidation.userName);
  const getRoles = useAppSelector(state => state.rolesUserId);
  const OperatorAdminDrop = useAppSelector(state => state.operaterAdmin);

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
        .test('agentname', 'Enter valid username', function (value: any) {
          if (
            validationErrors?.userName &&
            validationErrors?.userName !== 'no-error' &&
            value
          ) {
            return this.createError({ message: validationErrors?.userName });
          }
          return true;
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
              .max(20, 'Confirm password cannot exceed 20 characters')
              .oneOf([yup.ref('password')], 'Passwords must match')
          : yup.string().notRequired(),

      contactperson: yup
        .string()
        .required('Enter contact person name')
        .matches(
          /^[A-Za-z0-9-\s]+$/,
          'Contact person name must contain letters or numbers only'
        )
        .test(
          'at-least-one-letter',
          'Contact person name must contain at least one alphabet',
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
        .test('basic-contact', 'Invalid contact number', value => {
          if (!value) return true;
          const phoneRegex = /^\+?[0-9]{1,4}[- ]?[0-9]{7,15}$/;
          return phoneRegex.test(value);
        })
        .test('phone', 'Enter valid contact number', function (value: any) {
          if (
            validationErrors?.mobileNumber &&
            validationErrors.mobileNumber !== 'no-error' &&
            value
          ) {
            return this.createError({ message: validationErrors?.mobileNumber });
          }
          return true;
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
          }
          return true;
        }),

      // country: yup
      //   .string()
      //   .required('Select country')
      //   .matches(/^[A-Za-z ]+$/, 'Country name contains only alphabets'),

      roles: yup.string().when('role', {
        is: (y: string) => {
          return role && role === 'operation user';
        },
        then: schema => schema.required('Select  role'),
        otherwise: schema => schema.notRequired()
      })

      // parentRole: yup.string().when('role', {
      //   is: (role: string) => {
      //     return role && role === 'operation user';
      //   },
      //   then: schema => schema.required('Select parent role'),

      //   otherwise: schema => schema.notRequired()
      // }),

      // website: yup.string().notRequired()
    });

  const { validationErrors, setValidationErrorsMake } = useCommanStates();

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

  const { handleClose, handleFilterChange, role, setRole, error, validationFields } =
    useActionsHook({
      reset,
      tabValue,
      roles,

      setOpen,
      setValidationErrors,
      selected,
      trigger
    });

  const createAbort = useAbort();

  const { RolesDropdown } = useOptionHook(getRoles);

  let roletype = data?.role;

  const APagent = roletype === 'ROLE_AGENT';
  const isOperatorAdmin = roletype === 'ROLE_OPERATOR';

  const isAddingAgent = !selected;

  const dispatch = useAppDispatch();
  console.log(role, 'roleadd');
  const onSubmit = async (data: any) => {
    const getPayload = {
      pageNo: page,
      pageSize: 8,
      role: roles,
      category: role === 'operation user' ? 'OPERATION_USER' : '',
      signal: createAbort().abortCall.signal
    };
    if (!selected) {
      let payload = {
        userCredentialsReq: {
          userName: data.agentname,
          password: data?.password,
          confirmPassword: data?.confirmPassword
        },
        userOnboardProfileReq: {
          ...(data.parentRole !== '' && { parentName: data.parentRole }),
          country: data.country,
          email: data.email,
          contactNumber: `${data.phone}`,
          contactPersonName: data.contactperson,
          timezone: profile?.timezone || 'Asia/Singapore',
          ...(data.website !== '' && { website: data.website })
        },
        roleTypes: [data?.roles ? data?.roles : 'ROLE_OPERATOR']
      };
      const params = { getPayload, payload };
      const action = await dispatch(addAgent(params));
      if (action.type === addAgent.fulfilled.type) {
        setTabValue(role === 'operation user' ? 1 : 0);
        setIsScroll(false);
        clearState();
        dispatch(clearUsers());
        await dispatch(getAgent(getPayload));
        handleClose();
      }
    } else {
      let updatePayload = {
        userID: selected?.id,
        roleTypes: [data?.roles ? data?.roles : 'ROLE_OPERATOR'],
        userOnboardProfileReq: {
          ...(data.parentRole !== '' && { parentName: data.parentRole }),
          contactNumber: `${data.phone}`,
          country: data.country,
          contactPersonName: data.contactperson,
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

  useRendering({
    APagent,
    setRole,
    tabValue,
    mail,
    user,
    mobile,
    setValidationErrorsMake,
    isOperatorAdmin,
    validationErrors,
    trigger,
    error,
    selected,
    setValue,
    reset
  });

  return (
    <Box p={2}>
      <Drawer anchor='right' open={open} onClose={handleClose} sx={{ zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h6' sx={{ fontWeight: 700, marginBottom: '10px' }}>
            {isMapping
              ? 'Driver & Vehicle Mapping'
              : isAddingAgent
              ? `Add ${capitalizeFirstLetter(role)}`
              : `Update ${capitalizeFirstLetter(role)}`}
          </Typography>
          <Box component='form' onSubmit={handleSubmit(onSubmit)}>
            <AddOperatorFields
              control={control}
              APagent={APagent}
              selected={selected}
              isOperatorAdmin={isOperatorAdmin}
              setRole={setRole}
              role={role}
              isAddingAgent={isAddingAgent}
              RolesDropdown={RolesDropdown}
              setValue={setValue}
              handleFilterChange={handleFilterChange}
              trigger={trigger}
              errors={errors}
              validationFields={validationFields}
            />
            {/* <CustomSelect
              control={control}
              options={Country.getAllCountries().map((country: any) => ({
                id: country?.name,
                label: country?.name,
                code: country.isoCode
              }))}
              name='country'
              placeholder='Country'
              id='country'
              label='Country'
              defaultValue={selected?.country || ''}
            />
            <CustomTextField
              control={control}
              name='website'
              placeholder='Website URL'
              id='website'
              isOptional={true}
              label='Website URL'
              maxlength={100}
              defaultValue={selected?.websiteLink || ''}
            /> */}
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

export default AddOperator;
