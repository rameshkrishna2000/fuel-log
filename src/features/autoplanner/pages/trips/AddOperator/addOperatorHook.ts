import { useCallback, useEffect, useState } from 'react';
import { debounce, useAbort } from '../../../../../utils/commonFunctions';
import { useAppDispatch } from '../../../../../app/redux/hooks';
import {
  agentValidation,
  clearMailError
} from '../../../redux/reducer/autoPlannerSlices/agentslice';
import {
  getOperatorAdmin,
  getRolesDropdown
} from '../../../../../common/redux/reducer/commonSlices/roleSlice';

export const useActionsHook = ({
  reset,
  tabValue,
  roles,
  setOpen,
  setValidationErrors,
  selected,
  trigger
}: any) => {
  const dispatch = useAppDispatch();
  const [validationField, setValidationField] = useState('');
  const [error, setError] = useState(false);

  const [validationFields, setValidationFields] = useState<any>({
    mail: { status: false },
    userName: { status: false },
    mobileNumber: { status: false }
  });

  const [role, setRole] = useState(
    roles === 'ROLE_AGENT' ? 'sub Agent' : tabValue ? 'operation user' : 'operator'
  );

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const handleFilterChange = useCallback(
    debounce(async (event: string, field: any) => {
      let eventFilter = field === 'mobileNumber' ? 'mobileNumber' : field;
      setValidationField(field);

      dispatch(
        setValidationErrors({ fieldName: field, error: 'no-error', status: false })
      );
      setValidationFields((prev: any) => ({
        ...prev,
        [field]: { status: true }
      }));
      if (['email', 'userName', 'mobileNumber']?.includes(field) && event) {
        const response = await dispatch(
          agentValidation({
            category: eventFilter,
            value: event ? event : null,
            operation: selected ? 'update' : 'add',
            id: selected?.id
          })
        );

        if (field === 'mobileNumber' && response?.payload?.status !== 200) setError(true);
        dispatch(
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
    [dispatch]
  );

  return {
    validationField,
    handleFilterChange,
    handleClose,
    role,
    setRole,
    error,
    validationFields
  };
};

export const useCommanStates = () => {
  const [validationErrors, setValidationErrorsMake] = useState<any>({
    mail: null,
    userName: null,
    mobileNumber: null
  });

  return {
    validationErrors,
    setValidationErrorsMake
  };
};

export const useRendering = ({
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
}: any) => {
  const createAbort = useAbort();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!APagent) setRole(tabValue ? 'operation user' : 'operation admin');
    return () => {
      createAbort().abortCall.abort();
    };
  }, []);

  useEffect(() => {
    if (isOperatorAdmin) setRole('operation user');
  }, []);

  useEffect(() => {
    if (validationErrors?.mail) trigger('email');
  }, [validationErrors?.mail]);

  useEffect(() => {
    if (validationErrors?.mobileNumber) trigger('phone');
  }, [validationErrors?.mobileNumber, error]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (validationErrors?.userName) trigger('agentname');
  }, [validationErrors?.userName]);

  useEffect(() => {
    return () => {
      dispatch(clearMailError());
    };
  }, []);

  useEffect(() => {
    dispatch(getRolesDropdown());
    dispatch(getOperatorAdmin());
  }, []);

  useEffect(() => {
    if (selected) {
      setValue('agentname', selected.userName);
      setValue('contactperson', selected.contactPersonName);
      setValue('roles', selected.roles?.[0].role || '');
      // setValue('parentRole', selected.parentName || '');
      setValue('phone', selected.contactNumber);
      // setValue('country', selected.country);
      setValue('email', selected.email);
      // setValue('website', selected.website);
      // setRole(
      //   selected.roles?.includes('ROLE_OPERATOR')
      //     ? 'operation admin'
      //     : selected.roles?.includes('ROLE_AGENT')
      //     ? 'sub Agent'
      //     : 'operation user'
      // );
    } else {
      reset();
    }
  }, [selected, setValue, reset]);

  useEffect(() => {
    setValidationErrorsMake({
      userName: user?.error,
      mobileNumber: mobile?.error,
      mail: mail?.error
    });
  }, [user, mobile, mail]);
};

export const useOptionHook = (getRoles: any) => {
  const RolesDropdown = getRoles?.data?.map((value: any) => ({
    id: value.roleName,
    label: value.roleName
  }));
  return {
    RolesDropdown
  };
};
