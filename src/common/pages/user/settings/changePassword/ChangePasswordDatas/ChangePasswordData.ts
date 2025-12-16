export const ChangePasswordData = ( data: any) => {
  return [
    {
      id: '1',
      name: 'oldPassword',
      label: 'Current Password',
      placeholder: ' Current password',
      inputProps: { maxLength: 30 },
      type: 'string',
      required: 'Enter current password',
      trim: true
    },
    {
      id: '2',
      name: 'newPassword',
      label: 'Create New Password ',
      placeholder: ' New password',
      inputProps: { maxLength: 30 },
      type: 'string',
      required: 'Enter new password',
      trim: true,
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
      maxMessage: 'Password should be maximum 15 characters'
    },
    {
      id: '3',
      name: 'confirmPassword',
      label: 'Confirm Password',
      placeholder: 'Confirm password ',
      type: 'string',
      required: 'Enter confirm password',
      test: data?.newPassword === data?.confirmPassword ? false : true,
      testCase: function (this: any) {
        const { newPassword, confirmPassword } = this.parent;
        return confirmPassword === newPassword;
      },
      testName: 'password-match',
      testMessage: 'Password did not matched',
      trim: true
    }
  ];
};
