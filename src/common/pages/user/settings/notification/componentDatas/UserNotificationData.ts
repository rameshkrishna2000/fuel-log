export const UserNotificationData = () => {
  return [
    {
      id: 1,
      label: 'Engine',
      value: 'IGNITION_EVENT_ALERT',
      key: 'ignition_event_alert_enabled',
      enabled: true
    },
    {
      id: 2,
      label: 'Geofence IN/OUT',
      value: 'FENCE_EVENT_ALERT',
      key: 'fence_event_alert_enabled',
      enabled: true
    },
    {
      id: 3,
      label: 'Harsh Events',
      value: 'HARSH_EVENT_ALERT',
      key: 'harsh_event_alert_enabled',
      enabled: true
    },
    {
      id: 4,
      label: 'Overspeed',
      value: 'OVERSPEED_EVENT_ALERT',
      key: 'overspeed_event_alert_enabled',
      enabled: true
    },
    {
      id: 5,
      label: 'Movement',
      value: 'VEHICLE_MOTION_EVENT_ALERT',
      key: 'vehicle_motion_event_alert_enabled',
      enabled: true
    },
    {
      id: 6,
      label: 'Others',
      value: 'COMMON_EVENT_ALERT',
      key: 'common_event_alert_enabled',
      enabled: true
    }
  ];
};
