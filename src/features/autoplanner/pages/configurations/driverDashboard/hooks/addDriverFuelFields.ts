export const formFields = (data: any) => {
  const fields = [
    {
      name: 'vehicleNumber',
      id: 'vehicleNumber',
      type: 'string',
      required: 'Enter vehicle number',
      trim: true,
      testCases: [
        {
          testCase: function (this: any) {
            const { vehicleNumber } = this.parent;
            if (!vehicleNumber) return true;
            const vehicleRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{4,10}$/;
            return vehicleRegex.test(vehicleNumber);
          },
          testName: 'vehicle-number-format',
          testMessage: 'Enter valid vehicle number'
        },
        {
          testCase: function (this: any, value: any) {
            const validationErrors = data?.validationErrors;
            if (validationErrors?.vehicleNumber && value) {
              return false;
            }
            return true;
          },
          testName: 'vehicle-error',
          testMessage:
            data?.validationErrors?.vehicleNumber || 'Enter valid vehicle number'
        }
      ]
    },
    {
      name: 'reading',
      id: 'reading',
      type: 'number',
      required: 'Enter reading',
      typeError: 'Reading must be a number'
    },
    {
      name: 'dateTime',
      id: 'dateTime',
      type: 'date',
      required: 'Select date & time'
    },
    {
      name: 'fuelType',
      id: 'fuelType',
      type: 'string',
      required: 'Select fuel type'
    },
    {
      name: 'volume',
      id: 'volume',
      type: 'number',
      required: 'Enter volume',
      typeError: 'Volume must be a number'
    },
    {
      name: 'price',
      id: 'price',
      type: 'number',
      notRequired: true,
      typeError: 'Price must be a number'
    },
    {
      name: 'total',
      id: 'total',
      type: 'number',
      notRequired: true,
      typeError: 'Total must be a number'
    },
    {
      name: 'fuelStation',
      id: 'fuelStation',
      type: 'string',
      required: 'Enter fuel station'
    },
    {
      name: 'paymentMethod',
      id: 'paymentMethod',
      type: 'string',
      notRequired: true
    },
    {
      name: 'notes',
      id: 'notes',
      type: 'string',
      notRequired: true
    },
    {
      name: 'adBlueVolume',
      id: 'adBlueVolume',
      type: 'number',
      notRequired: true,
      typeError: 'AdBlue volume must be a number'
    },
    {
      name: 'adBluePrice',
      id: 'adBluePrice',
      type: 'number',
      notRequired: true,
      typeError: 'AdBlue price must be a number'
    },
    {
      name: 'adBlueTotal',
      id: 'adBlueTotal',
      type: 'number',
      notRequired: true,
      typeError: 'AdBlue total must be a number'
    },
    {
      name: 'odometer',
      id: 'odometer',
      type: 'mixed',
      required: 'At least one file is required.',
      testCases: [
        {
          testCase: function (this: any) {
            const { odometer } = this.parent;
            return odometer && odometer.length > 0;
          },
          testName: 'min-one-file',
          testMessage: 'At least one file is required.'
        },
        {
          testCase: function (this: any) {
            const { odometer } = this.parent;
            if (!odometer || odometer.length === 0) return true;
            return odometer?.every((item: any) =>
              item?.size ? item?.size <= 4000000 : true
            );
          },
          testName: 'is-large-file',
          testMessage: 'File size should not exceed 4MB'
        },
        {
          testCase: function (this: any) {
            const { odometer } = this.parent;
            if (!odometer || odometer.length === 0) return true;
            return odometer?.length <= 2;
          },
          testName: 'maximum-two-files',
          testMessage: `Can't upload more than two files`
        }
      ]
    },
    {
      name: 'fuel',
      id: 'fuel',
      type: 'mixed',
      notRequired: true,
      testCases: [
        {
          testCase: function (this: any) {
            const { fuel } = this.parent;
            if (!fuel || fuel.length === 0) return true;
            return fuel?.every((item: any) =>
              item?.size ? item?.size <= 4000000 : true
            );
          },
          testName: 'is-large-file',
          testMessage: 'File size should not exceed 4MB'
        },
        {
          testCase: function (this: any) {
            const { fuel } = this.parent;
            if (!fuel || fuel.length === 0) return true;
            return fuel?.length <= 2;
          },
          testName: 'maximum-two-files',
          testMessage: `Can't upload more than two files`
        }
      ]
    },
    {
      name: 'adBlue',
      id: 'adBlue',
      type: 'mixed',
      notRequired: true,
      testCases: [
        {
          testCase: function (this: any) {
            const { adBlue } = this.parent;
            if (!adBlue || adBlue.length === 0) return true;
            return adBlue?.every((item: any) =>
              item?.size ? item?.size <= 4000000 : true
            );
          },
          testName: 'is-large-file',
          testMessage: 'File size should not exceed 4MB'
        },
        {
          testCase: function (this: any) {
            const { adBlue } = this.parent;
            if (!adBlue || adBlue.length === 0) return true;
            return adBlue?.length <= 2;
          },
          testName: 'maximum-two-files',
          testMessage: `Can't upload more than two files`
        }
      ]
    }
  ];

  return fields;
};
