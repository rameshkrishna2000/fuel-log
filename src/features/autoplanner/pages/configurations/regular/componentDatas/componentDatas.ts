export const addRegularFields = (params: any, vehicles: any) => {
  return [
    {
      name: 'tourName',
      id: 'tourName',
      placeholder: 'Tour name',
      label: 'Tour Name',
      type: 'string',
      required: 'Enter tour name',
      fieldType: 'textfield',
      min: 3,
      minMessage: 'Tour name must be at least 3 characters',
      max: 30,
      maxMessage: 'Tour name must be at most 30 characters',
      match: /[a-zA-Z]+/,
      matchMessage: 'Tour name must contain at least one character'
    },
    {
      name: 'agentName',
      id: 'agentName',
      placeholder: 'Agent name',
      label: 'Agent Name',
      type: 'string',
      required: 'Enter agent name',
      fieldType: 'textfield',
      min: 3,
      minMessage: 'Agent name must be at least 3 characters',
      max: 30,
      maxMessage: 'Agent name must be at most 30 characters',
      match: /^(?=.*[a-zA-Z])[a-zA-Z0-9]*$/,
      matchMessage: 'Enter valid agent name'
    },
    {
      name: 'source',
      header: 'Pickup Location Details',
      fieldType: 'location',
      type: 'object',
      renderFields: [
        {
          name: 'sourceName',
          id: 'sourceName',
          placeholder: 'Source name',
          label: 'Source Name',
          type: 'string',
          required: 'Enter source name',
          fieldType: 'textfield',
          min: 3,
          minMessage: 'Source name must be at least 3 characters',
          max: 30,
          maxMessage: 'Source name must be at most 30 characters',
          match: /^(?=.*[a-zA-Z])[a-zA-Z0-9 ]*$/,
          matchMessage: 'Enter valid source name'
        },
        {
          name: 'sourceAddress',
          id: 'source',
          placeholder: 'Pickup Location',
          label: 'Pickup Location',
          type: 'object',
          errorMsg: [
            {
              name: 'source',
              required: 'Select pickup location',
              type: 'string'
            },
            {
              name: 'lat',
              required: 'Select pickup location',
              type: 'number'
            },
            {
              name: 'lng',
              required: 'Select pickup location',
              type: 'number'
            }
          ],
          required: 'Select pickup location',
          fieldType: 'searchbox'
        }
      ]
    },
    {
      name: 'destination',
      header: 'Destination Details',
      fieldType: 'location',
      type: 'object',
      renderFields: [
        {
          name: 'destinationName',
          id: 'destinationName',
          placeholder: 'Destination name',
          label: 'Destination Name',
          type: 'string',
          required: 'Enter destination name',
          fieldType: 'textfield',
          min: 3,
          minMessage: 'Destination name must be at least 3 characters',
          max: 30,
          maxMessage: 'Destination name must be at most 30 characters',
          match: /^(?=.*[a-zA-Z])[a-zA-Z0-9 ]*$/,
          matchMessage: 'Enter valid Destination name'
        },
        {
          name: 'destinationAddress',
          id: 'destination',
          placeholder: 'Drop Location',
          label: 'Drop Location',
          type: 'object',
          errorMsg: [
            {
              name: 'destination',
              required: 'Select drop location',
              type: 'string'
            },
            {
              name: 'lat',
              required: 'Select drop location',
              type: 'number'
            },
            {
              name: 'lng',
              required: 'Select drop location',
              type: 'number'
            }
          ],
          test:
            params?.sourceAddress?.lat !== null &&
            params?.sourceAddress?.lng !== null &&
            params?.sourceAddress?.lat == params?.destinationAddress?.lat &&
            params?.sourceAddress?.lng == params?.destinationAddress?.lng
              ? true
              : false,
          testCase: function (this: any) {
            const { sourceAddress, destinationAddress } = this.parent || {};
            const startLat = sourceAddress?.lat;
            const startLng = sourceAddress?.lng;
            const endLat = destinationAddress?.lat;
            const endLng = destinationAddress?.lng;

            if (
              startLat &&
              startLng &&
              endLat &&
              endLng &&
              endLat === startLat &&
              endLng === startLng
            ) {
              return false;
            }
            return true;
          },
          testName: 'different-source-destination',
          testMessage: 'Pickup and drop should not be the same',
          required: 'Select drop location',
          fieldType: 'searchbox'
        }
      ]
    },
    {
      name: 'vehicle',
      id: 'vehicle',
      placeholder: 'Vehicle No.',
      label: 'Vehicle No.',
      type: 'string',
      required: 'Select vehicle no.',
      fieldType: 'select',
      notRequired: true,
      isOptional: true
    },
    {
      name: 'alert',
      header: 'Changes will be applied after rescheduling or at the next scheduled time',
      fieldType: 'alert'
    },
    {
      name: 'time',
      header: 'Trip Window',
      fieldType: 'time',
      type: 'object',
      renderFields: [
        {
          name: 'startTime',
          id: 'startTime',
          placeholder: 'Start time',
          label: 'Start Time',
          type: 'date',
          required: 'Select start time',
          fieldType: 'timepicker'
        },
        {
          name: 'endTime',
          id: 'endTime',
          placeholder: 'End time',
          label: 'End Time',
          type: 'date',
          test: params?.startTime >= params?.endTime ? true : false,
          testCase: function (this: any) {
            const { startTime, endTime } = this.parent;
            return endTime > startTime;
          },
          testName: 'invalid-date',
          testMessage: 'Invalid End Time',
          required: 'Select end time',
          fieldType: 'timepicker'
        },
        {
          name: 'bufferTime',
          id: 'bufferTime',
          placeholder: 'Buffer time',
          label: 'Buffer Time',
          type: 'date',
          required: 'Select buffer time',
          fieldType: 'timepicker',
          notRequired: true
        },
        {
          name: 'availableDays',
          id: 'availableDays',
          placeholder: 'Tour days',
          label: 'Tour Days',
          type: 'array',
          required: 'Select tour days',
          fieldType: 'multiple',
          errorMsg: [
            {
              name: 'id',
              required: 'Select tour days',
              type: 'string'
            },
            {
              name: 'label',
              required: 'Select tour days',
              type: 'string'
            }
          ]
        }
      ]
    },

    {
      name: 'passengers',
      header: 'Trip Window',
      fieldType: 'passengers',
      type: 'object',
      renderFields: [
        {
          name: 'adultCount',
          id: 'adultCount',
          placeholder: 'Adult count',
          label: 'Adult count',
          type: 'string',
          required: 'Enter adult count',
          notRequired: true,
          fieldType: 'textfield'
        },
        {
          name: 'childCount',
          id: 'childCount',
          placeholder: 'Child count',
          label: 'Child count',
          type: 'string',
          required: '',
          notRequired: true,
          fieldType: 'textfield'
        }
      ]
    },
    {
      name: 'driver',
      id: 'driver',
      placeholder: 'Driver name',
      label: 'Driver Name',
      type: 'string',
      required: 'Select driver',
      fieldType: 'select',
      notRequired: !params?.vehicle
    },
    {
      name: 'seats',
      type: 'boolean',
      test: true,
      notField: true,
      default: true,
      // testCase: function (this: any) {
      //   const { adultCount, childCount, vehicle } = this.parent;
      //   const { seatingCapacity } = vehicles?.find(
      //     (item: any) => item.vehicleNumber === vehicle
      //   );
      //   const noSeats = seatingCapacity
      //     ? Number(adultCount ?? 0) + Number(childCount ?? 0) < seatingCapacity
      //     : true;
      //   return noSeats;
      // },
      required: 'Seating capacity reached'
    }
  ];
};

export const daysOfWeek = [
  { id: 'selectAll', label: 'Select All' },
  { id: 'sunday', label: 'Sunday' },
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' }
];
