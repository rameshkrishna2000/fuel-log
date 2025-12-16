//json data for mail fields
export const mailFields = [
  {
    name: 'email',
    id: 'email',
    type: 'string',
    email: 'Enter valid email id',
    required: 'Email Id is required'
  },
  {
    name: 'document',
    id: 'document',
    type: 'string',
    required: 'Select document type'
  }
];

//json data for report fields
export const reportFormFields = (data: any) => {
  const reportFields = [
    {
      name: 'vehicle',
      id: 'vehicle',
      type: 'string',
      required: 'Select vehicle number',
      notRequired: ['DeviceHealth', 'DriverScorecard', 'ExternalVehicle']?.includes(
        data.report
      )
    },
    {
      name: 'startDate',
      id: 'startDate',
      type: 'date',
      required: 'Start Date is required',
      typeError: 'Start Date is required',
      notRequired: ['DeviceHealth']?.includes(data.report),
      testCases: [
        {
          testCase: function (this: any) {
            const { startDate } = this.parent;
            return startDate;
          },
          testName: 'start-date',
          testMessage: 'Start Date is required'
        },
        {
          testCase: function (this: any) {
            const { startDate } = this.parent;
            const today = new Date();
            return startDate <= today;
          },
          testName: 'should be in past',
          testMessage: 'Start Date cannot be in future'
        }
      ],

      nullable: true
    },
    {
      name: 'endDate',
      id: 'endDate',
      type: 'date',
      required: 'End Date is required',
      typeError: 'End Date is required',
      nullable: true,
      notRequired: ['DeviceHealth']?.includes(data.report),

      testCases: [
        {
          testCase: function (this: any) {
            const { endDate } = this?.parent || {};
            const today = new Date();
            const expireDate = new Date(endDate);
            return expireDate <= today;
          },
          testName: 'end-date',
          testMessage: 'End Date cannot be in future'
        },
        {
          testCase: function (this: any) {
            const { startDate, endDate } = this?.parent || {};
            return endDate > startDate;
          },
          testName: 'end-date',
          testMessage: 'End Date is invalid'
        }
      ]
    },
    {
      name: 'report',
      id: 'report',
      type: 'string',
      required: 'Select report type'
    }
  ];

  return reportFields;
};
