import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../../../app/redux/hooks';
import { updateToast } from '../../../../../redux/reducer/commonSlices/toastSlice';
import { useAbort } from '../../../../../../utils/commonFunctions';
import { UserNotificationData } from '../componentDatas/UserNotificationData';

interface GetDataType {
  push_notification_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
}

export const useUserNotificationHooks = ({ data, error, authData, urls }: any) => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('firebaseToken');
  const createAbort = useAbort();

  const [notificationSettings, setNotificationSettings] = useState<GetDataType | null>(
    null
  );
  const [isload, setIsLoad] = useState(true);
  const [notification, setNotification] = useState<GetDataType | null>({
    push_notification_enabled: true,
    sms_enabled: true,
    email_enabled: true
  });
  const [topics, setTopics] = useState(false);
  const [topicList, setTopicList] = useState(UserNotificationData());
  const [topicDisable, setTopicDisable] = useState(false);
  const [topicsSubscribe, setTopicsSubscribe] = useState<any>({
    subscribe: [
      'IGNITION_EVENT_ALERT',
      'GEOFENCE_EVENT_ALERT',
      'VEHICLE_MOTION_EVENT_ALERT',
      'COMMON_EVENT_ALERT',
      'FENCE_EVENT_ALERT',
      'HARSH_EVENT_ALERT',
      'OVERSPEED_EVENT_ALERT',
      'DRIVER_IDENTIFICATION_ALERT'
    ],
    unsubscribe: []
  });

  const handleSubmit = async () => {
    setIsLoad(true);

    const finalPayload = {
      fcmToken: token,
      username: authData?.userId,
      topicsToSubscribe: topicsSubscribe.subscribe,
      topicsToUnsubscribe: topicsSubscribe.unsubscribe,
      push_notification_enabled: notification?.push_notification_enabled,
      sms_enabled: notification?.sms_enabled,
      email_enabled: notification?.email_enabled
    };
    const notificationStatus = await Notification.requestPermission();
    if (notificationStatus === 'denied' && notification?.push_notification_enabled) {
      dispatch(
        updateToast({
          show: 'true',
          message: 'Enable Browser Notification',
          severity: 'warning'
        })
      );
    }
    await dispatch(urls.UpdateNotification(finalPayload));
  };

  const handleSwitchChange = async (event: any, key: keyof GetDataType) => {
    if (notification) {
      setNotification((prevState: any) => ({
        ...prevState!,
        [`${key}`]: event.target.checked
      }));
    }

    const updatedNotificationSettings = {
      ...notificationSettings!,
      [key]: event.target.checked
    };
    const notificationStatus = await (Notification as any).requestPermission();
    if (
      notificationStatus === 'denied' &&
      event.target.checked &&
      key === 'push_notification_enabled'
    ) {
      dispatch(
        updateToast({
          show: 'true',
          message: 'Enable Browser Notification',
          severity: 'warning'
        })
      );
    }
    setNotificationSettings(updatedNotificationSettings);
  };

  const handleTopics = async (e: any, topicsList: any) => {
    let subscribedTopics = topicsList
      .filter((item: any) => item.enabled === true)
      .map((item: any) => {
        return item.value;
      });

    let unsubscribedTopics = topicsList
      .filter((item: any) => item.enabled === false)
      .map((item: any) => {
        return item.value;
      });
    setTopicsSubscribe({
      subscribe: subscribedTopics,
      unsubscribe: unsubscribedTopics
    });
  };

  const handleSpecificSwitchChange = (e: any, item: any) => {
    if (e.target.checked === false) {
      const falseList = topicList.map(list => ({
        ...list,
        enabled: list.value === item.value ? false : list.enabled
      }));
      setTopicList(falseList);
      handleTopics(e.target.checked, falseList);
    } else if (e.target.checked === true) {
      const trueList = topicList.map(list => ({
        ...list,
        enabled: list.value === item.value ? true : list.enabled
      }));
      setTopicList(trueList);
      handleTopics(e.target.checked, trueList);
    }
  };

  useEffect(() => {
    const payload = {
      token: token,
      signal: createAbort().abortCall.signal
    };
    dispatch(urls?.getNotification(payload));
    return () => {
      createAbort().abortCall.abort();
    };
  }, []);

  useEffect(() => {
    if (data?.data !== null && data?.data !== undefined) {
      if (!data?.data.push_notification_enabled) setTopicDisable(true);
      setTopicList((prev: any) => {
        const updatedList = prev?.map((item: any, index: number) => ({
          ...item,
          enabled: data?.data?.topicSubscriptions[item?.key]
        }));
        return updatedList;
      });
      setNotification({
        push_notification_enabled: data?.data.pushNotificationEnabled,
        sms_enabled: data?.data?.smsEnabled,
        email_enabled: data?.data.emailEnabled
      });
      if (data?.data?.pushNotificationEnabled) setTopicDisable(false);
      setNotificationSettings({
        push_notification_enabled: data?.data.push_notification_enabled,
        sms_enabled: data?.data.sms_enabled,
        email_enabled: data?.data.email_enabled
      });
    }
    setIsLoad(false);
  }, [data]);

  useEffect(() => {
    let subscribedTopics: any = topicList
      .filter(item => item?.enabled)
      .map(topic => topic?.value);
    let unsubscribedTopics: any = topicList
      ?.filter(item => !item?.enabled)
      .map(topic => topic?.value);

    setTopicsSubscribe({ subscribe: subscribedTopics, unsubscribe: unsubscribedTopics });
  }, [topicList]);

  useEffect(() => {
    if (error) {
      dispatch(
        updateToast({
          show: true,
          message: error,
          severity: 'error'
        })
      );
    }
  }, [error, isload, data, dispatch]);

  return {
    handleSwitchChange,
    handleSpecificSwitchChange,
    handleSubmit,
    notification,
    setTopics,
    topics,
    setTopicDisable,
    topicDisable,
    setTopicList,
    topicList
  };
};
