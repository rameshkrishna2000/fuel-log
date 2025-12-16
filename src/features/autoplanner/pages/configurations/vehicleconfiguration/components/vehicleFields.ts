export const vehicleFields = (params?: any, options?: any) => {
  const isTracking = params?.istracking === 'istracking';

  const allFields = [
    {
      name: 'vehicleNumber',
      id: 'vehicleNumber',
      placeholder: 'Enter vehicle number',
      label: 'Vehicle Number',
      type: 'string',
      required: 'Enter vehicle number',
      fieldType: 'textfield',
      min: 4,
      minMessage: 'Vehicle number must be at least 4 characters',
      max: 20,
      maxMessage: 'Maximum 20 characters',
      match: /[A-Za-z0-9]+/,
      matchMessage: 'Vehicle number must contain letters or numbers'
    },
    {
      name: 'istracking',
      id: 'istracking',
      label: 'Is Tracking Enabled?',
      fieldType: 'radio',
      radiobutton1: 'No',
      radiobutton2: 'Yes',
      value1: 'notIstracking',
      value2: 'istracking'
    },
    {
      name: 'imeiNumber',
      id: 'imeiNumber',
      placeholder: 'Select IMEI Number',
      label: 'IMEI Number',
      fieldType: 'select',
      options: options?.imei || [],
      required: isTracking ? 'Select IMEI number' : undefined
    },
    {
      name: 'simNumber',
      id: 'simNumber',
      placeholder: 'Select SIM Number',
      label: 'SIM Number',
      fieldType: 'select',
      options: options?.sim || [],
      required: isTracking ? 'Select SIM number' : undefined,
      match: /^\d{10,20}$/,
      matchMessage: 'SIM number must be 10-20 digits'
    },
    {
      name: 'planId',
      id: 'planId',
      placeholder: 'Select Plan ID',
      label: 'Plan ID',
      fieldType: 'select',
      options: options?.planId || [],
      required: isTracking ? 'Select plan ID' : undefined
    },
    {
      name: 'vehicleMake',
      id: 'vehicleMake',
      placeholder: 'Select Vehicle Make',
      label: 'Vehicle Make',
      fieldType: 'select',
      options: options?.vehicleMake || [],
      required: isTracking ? 'Select vehicle make' : undefined
    },
    {
      name: 'vehicleModel',
      id: 'vehicleModel',
      placeholder: 'Select Vehicle Model',
      label: 'Vehicle Model',
      fieldType: 'select',
      options: options?.vehicleModel || [],
      required: isTracking ? 'Select vehicle model' : undefined
    },
    {
      name: 'manufacturedYear',
      id: 'manufacturedYear',
      placeholder: 'Select Manufactured Year',
      label: 'Manufactured Year',
      fieldType: 'select',
      options: options?.year || [],
      required: isTracking ? 'Select Manufactured Year' : undefined
    },
    {
      name: 'subType',
      id: 'subType',
      placeholder: 'Select Sub Type',
      label: 'Sub Type',
      fieldType: 'select',
      options: options?.subType || [],
      required: isTracking ? 'Select sub type' : undefined
    },
    {
      name: 'freewaySpeedLimit',
      id: 'freewaySpeedLimit',
      placeholder: 'Freeway Speed Limit',
      label: 'Freeway Speed Limit (km/h)',
      fieldType: 'slider',
      min: 60,
      max: 150,
      step: 5
    },
    {
      name: 'nonFreewaySpeedLimit',
      id: 'nonFreewaySpeedLimit',
      placeholder: 'Non-Freeway Speed Limit',
      label: 'Non-Freeway Speed Limit (km/h)',
      fieldType: 'slider',
      min: 30,
      max: 100,
      step: 5
    },
    {
      name: 'vehicleType',
      id: 'vehicleType',
      placeholder: 'Select Vehicle Type',
      label: 'Vehicle Type',
      fieldType: 'select',
      options: [
        { id: 'coach', label: 'Coach' },
        { id: 'bus', label: 'Bus' },
        { id: 'mini van', label: 'Mini Van' },
        { id: 'comfy', label: 'Comfy' }
      ],
      required: 'Select vehicle type'
    },
    {
      name: 'absoluteSeating',
      id: 'absoluteSeating',
      placeholder: 'Absolute Seating',
      label: 'Absolute Seating',
      type: 'number',
      fieldType: 'textfield',
      required: 'Enter absolute seating',
      min: 1,
      max: 249
    },
    {
      name: 'seating',
      id: 'seating',
      placeholder: 'Preferred Seating',
      label: 'Preferred Seating',
      type: 'number',
      fieldType: 'textfield',
      required: 'Enter preferred seating',
      min: 1,
      maxField: 'absoluteSeating'
    },
    {
      name: 'averageSpeed',
      id: 'averageSpeed',
      placeholder: 'Average Speed',
      label: 'Average Speed (km/h)',
      type: 'number',
      fieldType: 'slider',
      min: 10,
      max: 150,
      required: 'Average speed is required'
    },
    {
      name: 'tripMode',
      id: 'tripMode',
      placeholder: 'Tour Mode',
      label: 'Tour Mode',
      fieldType: 'multiselect',
      options: options?.tripMode || [],
      required: 'Select at least one tour mode'
    }
  ];

  return allFields;
};
