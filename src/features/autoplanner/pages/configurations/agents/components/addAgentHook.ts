import { useCallback, useEffect, useState } from 'react';
import { debounce, useAbort } from '../../../../../../utils/commonFunctions';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  agentValidation,
  clearMailError,
  getRateCard
} from '../../../../redux/reducer/autoPlannerSlices/agentslice';

export const useCommanStates = () => {
  const [validationFields, setValidationFields] = useState<any>({
    mail: { status: false },
    userName: { status: false },
    mobileNumber: { status: false }
  });
  const [error, setError] = useState(false);

  const [validationField, setValidationField] = useState('');
  const [validationErrors, setValidationErrorsMake] = useState<any>({
    mail: null,
    userName: null,
    mobileNumber: null
  });
  return {
    validationErrors,
    setValidationErrorsMake,
    validationField,
    setValidationField,
    error,
    setError,
    validationFields,
    setValidationFields
  };
};

export const useAddActions = ({
  setValidationField,
  setValidationErrors,
  setValidationFields,
  selected,
  trigger,
  setError,
  reset,
  setOpen
}: any) => {
  const dispatch = useAppDispatch();
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

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  return {
    handleFilterChange,
    handleClose
  };
};

export const useRenderingHook = ({
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
}: any) => {
  const createAbort = useAbort();
  const dispatch = useAppDispatch();

  const mail = useAppSelector(state => state.agentValidation.email);
  const mobile = useAppSelector(state => state.agentValidation.mobileNumber);
  const user = useAppSelector(state => state.agentValidation.userName);

  useEffect(() => {
    if (selected) {
      setValue('companyName', selected.companyName);
      setValue('agentname', selected.userName);
      setValue('ratecard', selected?.rateCardName ? selected?.rateCardId : '');
      setValue('contactperson', selected.contactPersonName);
      setValue('phone', selected.contactNumber);
      setValue('country', selected.country);
      setValue('email', selected.email);
      setValue('website', selected.website);
      setRole(
        selected.roles?.includes('ROLE_OPERATOR')
          ? 'operator'
          : selected.roles?.includes('ROLE_AGENT')
          ? 'agent'
          : 'company User'
      );
    } else {
      reset();
    }
  }, [selected, setValue, reset]);

  useEffect(() => {
    if (company) {
      setValue('companyName', company);
    }
  }, [company]);

  useEffect(() => {
    if (APagent) setRole('company User');
    if (!APagent) setRole(tabValue === 0 ? 'agent' : 'operator');
    return () => {
      createAbort().abortCall.abort();
    };
  }, []);

  useEffect(() => {
    setValidationErrorsMake({
      userName: user?.error,
      mobileNumber: mobile?.error,
      mail: mail?.error
    });
  }, [user, mobile, mail]);

  useEffect(() => {
    if (validationErrors?.mail) trigger('email');
  }, [validationErrors?.mail]);

  useEffect(() => {
    if (validationErrors?.mobileNumber) trigger('phone');
  }, [validationErrors?.mobileNumber, error]);

  useEffect(() => {
    if (validationErrors?.userName) trigger('agentname');
  }, [validationErrors?.userName]);

  useEffect(() => {
    dispatch(getRateCard());
    setValue('roletype', roletype);
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearMailError());
    };
  }, []);
};
