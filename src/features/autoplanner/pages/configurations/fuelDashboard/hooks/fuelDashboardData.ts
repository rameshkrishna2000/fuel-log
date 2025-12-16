export const FuelDashboardFormData = () => {
  return [
    {
      id: 'search',
      name: 'search',
      label: 'Search',
      type: 'string',
      notRequired: true
    },
    {
      id: 'vehicleNumber',
      name: 'vehicleNumber',
      label: 'Vehicle Number',
      type: 'array',
      notRequired: true,
      errorMsg: [
        {
          name: 'id',
          notRequired: true,
          type: 'string'
        },
        {
          name: 'label',
          notRequired: true,
          type: 'string'
        }
      ]
    },
    {
      id: 'driver',
      name: 'driver',
      label: 'Driver',
      type: 'array',
      notRequired: true,
      errorMsg: [
        {
          name: 'id',
          notRequired: true,
          type: 'string'
        },
        {
          name: 'label',
          notRequired: true,
          type: 'string'
        }
      ]
    },
    {
      id: 'fromDate',
      name: 'fromDate',
      label: 'From Date',
      type: 'date',
      notRequired: true
    },
    {
      id: 'toDate',
      name: 'toDate',
      label: 'To Date',
      type: 'date',
      notRequired: true
    },
    {
      id: 'fuelType',
      name: 'fuelType',
      label: 'Fuel Type',
      type: 'array',
      notRequired: true,
      errorMsg: [
        {
          name: 'id',
          notRequired: true,
          type: 'string'
        },
        {
          name: 'label',
          notRequired: true,
          type: 'string'
        }
      ]
    },
    {
      id: 'fuelStation',
      name: 'fuelStation',
      label: 'Fuel Station',
      type: 'array',
      notRequired: true,
      errorMsg: [
        {
          name: 'id',
          notRequired: true,
          type: 'string'
        },
        {
          name: 'label',
          notRequired: true,
          type: 'string'
        }
      ]
    },
    {
      id: 'paymentMethod',
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'array',
      notRequired: true,
      errorMsg: [
        {
          name: 'id',
          notRequired: true,
          type: 'string'
        },
        {
          name: 'label',
          notRequired: true,
          type: 'string'
        }
      ]
    }
  ];
};
