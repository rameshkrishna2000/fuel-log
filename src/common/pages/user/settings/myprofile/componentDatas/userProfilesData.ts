export const UserProfileData = (
  profileDetails: any,
  dobTimestamp: any,
  currentTimeStamp: any,
  isOpen?: boolean
) => {
  return [
    {
      id: '1',
      name: 'displayName',
      label: 'User Name',
      placeholder: 'Username',
      inputProps: {
        maxLength: 30,
        style: { cursor: 'not-allowed' }
      },
      defaultValue: profileDetails?.userName ?? '',
      type: 'string',
      required: 'Enter username',
      min: 2,
      minMessage: 'Too short!',
      match: /^[A-Za-z0-9.-]+(\s*[A-Za-z0-9.-]+)*$/,
      matchMessage: 'Enter valid username',
      trim: true
    },
    {
      id: '2',
      name: 'email',
      label: 'Email ID',
      placeholder: 'Email ID',
      defaultValue: profileDetails?.email ?? '',
      inputProps: {
        maxLength: 50
      },
      type: 'string',
      required: 'Enter email ID',
      email: 'Enter valid email ID',
      match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
      matchMessage: 'Enter valid email ID'
    },
    {
      id: '3',
      name: 'dateOfBirth',
      label: 'Date of Birth',
      placeholder: 'Date of birth',
      defaultValue: profileDetails?.dateOfBirth,
      type: 'date',
      notRequired: true,
      nullable: true,
      typeError: 'Invalid DOB',
      testCase: function (value: any) {
        return dobTimestamp <= currentTimeStamp && value !== 'Invalid Date';
      },
      testName: 'dateOfBirth',
      testMessage: 'Invalid DOB'
    },
    {
      id: '4',
      name: 'mobileNumber',
      label: 'Contact Number',
      placeholder: 'Contact Number',
      defaultValue: profileDetails?.mobileNumber ?? '',
      inputProps: { maxLength: 10 },
      type: 'string',
      required: 'Enter contact number',
      min: 8,
      minMessage: 'Enter valid contact number',
      max: 15,
      maxMessage: 'Enter valid contact number',
      match: /^[\d+\-\s]+$/,
      matchMessage: 'Enter valid contact number',
      trim: true
    },
    {
      id: '5',
      name: 'TimeZone',
      label: 'Time Zone',
      placeholder: '',
      defaultValue: profileDetails?.timezone ?? '',
      inputProps: { style: { cursor: 'not-allowed' } },
      type: 'string',
      notRequired: true
    },
    {
      id: '6',
      name: 'password',
      label: 'Password',
      placeholder: 'Password',
      autoComplete: 'new-password',
      type: 'string',
      notRequired: isOpen ? false : true,
      required: 'Enter password'
    }
  ];
};
