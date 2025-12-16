export const OTPUsernameData = () => {
  return [
    {
      id: 'userName',
      name: 'userName',
      label: 'Username',
      placeholder: 'Username',
      type: 'string',
      required: 'Enter username',
      trim: true
    }
  ];
};

export const OTPValidData = () => {
  return [
    {
      label: 'One Time Password',
      id: 'onetimepassword',
      name: 'onetimepassword',
      placeholder: 'One Time Password',
      type: 'string',
      required: 'Enter one time password',
      min: 4,
      minMessage: 'Enter valid OTP',
      max: 4,
      maxMessage: 'Enter valid OTP',
      match: /^[0-9]+$/,
      matchMessage: 'Enter numbers only',
      trim: true
    }
  ];
};

export const ResetPassowrdData = (data?: any) => {
  return [
    {
      id: 'newPassword',
      name: 'newPassword',
      placeholder: 'New Password',
      label: 'New Password',
      type: 'string',
      required: 'Enter new password',
      match: [
        { regex: /[A-Z]/, message: 'Password must contain at least one uppercase' },
        { regex: /[a-z]/, message: 'Password must contain at least one lowercase' },
        {
          regex: /[#?!@$%^&*-]/,
          message: 'Password must contain at least one special character'
        },
        { regex: /[0-9]/, message: 'Password must contain at least one number' }
      ],
      min: 8,
      minMessage: 'Password should be minimum 8 characters',
      max: 15,
      maxMessage: 'Password should be maximum 15 characters',
      trim: true
    },
    {
      id: 'confirmNewPassword',
      name: 'confirmNewPassword',
      placeholder: 'Confirm New Password',
      label: 'Confirm New Password',
      type: 'string',
      required: 'Enter confirm new password',
      match: [
        { regex: /[A-Z]/, message: 'Password must contain at least one uppercase' },
        { regex: /[a-z]/, message: 'Password must contain at least one lowercase' },
        {
          regex: /[#?!@$%^&*-]/,
          message: 'Password must contain at least one special character'
        },
        { regex: /[0-9]/, message: 'Password must contain at least one number' }
      ],
      min: 8,
      minMessage: 'Password should be minimum 8 characters',
      test: data?.newPassword === data?.confirmNewPassword ? false : true,
      testCase: function (this: any) {
        const { newPassword, confirmNewPassword } = this.parent;
        return confirmNewPassword === newPassword;
      },
      testName: 'password-match',
      testMessage: 'Password did not matched',
      trim: true
    }
  ];
};
