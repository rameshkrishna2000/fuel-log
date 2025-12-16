import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import {
  convertToEpoch,
  convertToEpoch2,
  useAbort
} from '../../../../../../utils/commonFunctions';
import dayjs from 'dayjs';

interface ProfileData {
  displayName: string;
  userName: string;
  mobileNumber: any;
  email: string;
  dateOfBirth: any;
  role: string;
  timezone: string;
}

export const useStateUserProfileHooks = () => {
  const [profileDetails, setProfileDetails] = useState<ProfileData | null>(null);
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [currentTimeStamp, setCurrentTimeStamp] = useState<number | any>(null);
  const [dobTimestamp, setDobTimestamp] = useState<number | any>(null);
  const [isOpen, setOpen] = useState(false);

  const epocvalue: any = convertToEpoch2(profileDetails?.dateOfBirth);

  const formatDOB = (dateOfBirth: string | null) => {
    return dateOfBirth ? dayjs(dateOfBirth).format('YYYY-MM-DD') : null;
  };

  return {
    profileDetails,
    setProfileDetails,
    editProfile,
    setEditProfile,
    currentTimeStamp,
    setCurrentTimeStamp,
    dobTimestamp,
    setDobTimestamp,
    epocvalue,
    formatDOB,
    setOpen,
    isOpen
  };
};

export const useUserProfileHooks = ({
  setProfileDetails,
  editProfile,
  setEditProfile,
  formatDOB,
  setValue,
  clearErrors,
  setCurrentTimeStamp,
  setDobTimestamp,
  myProfileData,
  profileDetails,
  urls,
  setOpen
}: any) => {
  const dispatch = useAppDispatch();
  const createAbort = useAbort();

  const onSubmit = async (params: any) => {
    // params.userBio = 'demo1';
    // params.overSpeed = 70.0;
    params.dateOfBirth = formatDOB(params.dateOfBirth);
    setOpen(true);
    if (params?.password) {
      const action = await dispatch(
        urls.updateProfile({ ...params, dateOfBirth: formatDOB(params.dateOfBirth) })
      );
      if (action.type === urls.updateProfile.fulfilled.type) {
        setProfileDetails(params);
        setEditProfile(false);
        setOpen(false);
        setValue('password', '');
      }
    }
  };

  const handleDOBChange = (date: any) => {
    setValue('dateOfBirth', formatDOB(date?.$d) === '' ? null : formatDOB(date?.$d));
    clearErrors('dateOfBirth');
    let currentTime = new Date();
    let currentTimeStamp: any = convertToEpoch(currentTime);
    setCurrentTimeStamp(currentTimeStamp);
    let dobTime: any = convertToEpoch(date?.$d);
    setDobTimestamp(dobTime);
  };

  useEffect(() => {
    dispatch(urls.getProfile(createAbort().abortCall.signal));
    return () => {
      createAbort().abortCall.abort();
    };
  }, [dispatch, setEditProfile, editProfile]);

  useEffect(() => {
    if (myProfileData) {
      setProfileDetails(myProfileData);
      setValue('displayName', profileDetails?.userName ?? '');
      setValue('email', profileDetails?.email ?? '');
      setValue('mobileNumber', profileDetails?.mobileNumber ?? '');
      if (profileDetails?.dateOfBirth !== null)
        setValue('dateOfBirth', profileDetails?.dateOfBirth);
      else setValue('dateOfBirth', undefined);
      setValue('TimeZone', profileDetails?.timezone);
    }
  }, [myProfileData, profileDetails]);

  return { onSubmit, handleDOBChange };
};
