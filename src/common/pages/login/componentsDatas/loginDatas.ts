import parsePhoneNumberFromString from 'libphonenumber-js';

export const loginData = () => {
  return [
    {
      id: 'userID',
      name: 'userID',
      label: 'User Name',
      placeholder: 'User Name',
      type: 'string',
      required: 'Enter username',
      match: /^[A-Za-z0-9@._-]+$/,
      matchMessage: 'Enter a valid username',
      trim: true
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      placeholder: 'Password',
      type: 'string',
      required: 'Enter password',
      trim: true
    }
  ];
};

export const driverContact = (value: string) => {
  return [
    {
      name: 'mobileNumber',
      type: 'string',
      required: 'Enter contact number',
      test: true,
      testCase: function (this: any) {
        const { mobileNumber } = this.parent;
        if (!mobileNumber) return false;

        const phoneNumber = parsePhoneNumberFromString(mobileNumber);
        return phoneNumber ? phoneNumber?.isValid() : false;
      },
      testName: 'invalid-number',
      testMessage: 'Enter a valid contact number'
    }
  ];
};

export const otpVerificationData = () => {
  return [
    {
      name: 'otp',
      required: 'Enter OTP',
      match: /^[0-9]{4}$/,
      matchMessage: 'OTP must be 4 digits'
    }
  ];
};
