import * as yup from 'yup';

interface CustomFieldsTypes {
  [key: string]: any;
  type: string;
  renderFields?: any[];
}

const useDynamicYupSchema = (fields: any) => {
  const formFields = fieldsValidationExtend(fields)
    ?.flat()
    .map((item: any) => item?.name);
  const createFormFields = (fields: any) => {
    const dynamicFormData: any = fieldsValidationExtend(fields)?.flat()?.filter(Boolean);
    const dynamicSchema = dynamicFormData?.reduce(useDynamicYupFields, {});
    const schema: any = yup.object().shape(dynamicSchema);
    return { schema };
  };
  return { createFormFields, formFields };
};

// Function to extend validations from config format
const fieldsValidationExtend = (customFields: CustomFieldsTypes[]) => {
  return customFields?.map(({ type, ...rest }: CustomFieldsTypes) => {
    if (!type) return;

    if (type === 'string') {
      const validations: any[] = [];

      if (!rest.notRequired) {
        validations.push({ type: 'required', params: [rest?.required] });
      } else {
        validations.push({ type: 'notRequired', params: [] });
      }
      if (rest?.default) {
        validations.push({ type: 'required', params: [rest?.default] });
      }
      if (rest.match) {
        if (rest.match instanceof RegExp) {
          validations.push({
            type: 'matches',
            params: [rest.match, rest.matchMessage]
          });
        }
        if (Array.isArray(rest.match)) {
          rest.match.forEach((matchObj: { regex: RegExp; message: string }) => {
            validations.push({
              type: 'matches',
              params: [matchObj.regex, matchObj.message]
            });
          });
        }
      }

      if (rest.min) {
        validations.push({ type: 'min', params: [rest.min, rest.minMessage] });
      }
      if (rest.max) {
        validations.push({ type: 'max', params: [rest.max, rest.maxMessage] });
      }
      if (rest.trim) {
        validations.push({ type: 'trim', params: [] });
      }
      if (rest.email) {
        validations.push({ type: 'email', params: [rest.email] });
      }
      if (rest.test) {
        validations.push({
          type: 'test',
          params: [rest.testMessage],
          testFunc: rest.testCase,
          testName: rest.testName
        });
      }

      if (Array.isArray(rest.testCases)) {
        rest.testCases?.forEach((test: any) => {
          validations.push({
            type: 'test',
            params: [test.testMessage],
            testFunc: test.testCase,
            testName: test.testName,
            validationType: type
          });
        });
      }

      return {
        ...rest,
        validationType: type,
        validations
      };
    }
    if (type === 'date') {
      const validations = [];
      if (!rest.notRequired) {
        validations.push({ type: 'required', params: [rest.required] });
      }

      if (rest.typeError) {
        validations.push({ type: 'typeError', params: [rest.typeError] });
      }

      if (rest.nullable) {
        validations.push({ type: 'nullable' });
      }

      if (rest?.testCase) {
        validations.push({
          type: 'test',
          params: [rest.testMessage],
          testFunc: rest.testCase,
          testName: rest.testName,
          validationType: type,
          validations
        });
      }

      if (!rest.notRequired && Array.isArray(rest.testCases)) {
        rest.testCases?.forEach((test: any) => {
          validations.push({
            type: 'test',
            params: [test.testMessage],
            testFunc: test.testCase,
            testName: test.testName,
            validationType: type
          });
        });
      }
      if (rest.notRequired && !rest?.testCase) {
        validations.push({ tyoe: 'notRequired', params: [] });
      }
      return {
        ...rest,
        validationType: type,
        validations
      };
    }
    if (type === 'object') {
      if (rest.renderFields?.length && rest.renderFields?.length > 0) {
        return rest.renderFields.map((item: any) => {
          const validations: any[] = [];

          if (!item.notRequired) {
            validations.push({ type: 'required', params: [item.required] });
          } else {
            validations.push({ type: 'notRequired', params: [] });
          }

          if (item.match) {
            validations.push({
              type: 'matches',
              params: [item.match, item.matchMessage]
            });
          }
          if (item.min) {
            validations.push({ type: 'min', params: [item.min, item.minMessage] });
          }
          if (item.max) {
            validations.push({ type: 'max', params: [item.max, item.maxMessage] });
          }

          if (item.test) {
            validations.push({
              type: 'test',
              params: [item.testMessage],
              testFunc: item.testCase,
              testName: item.testName
            });
          }

          return {
            ...item,
            validationType: item.type,
            validations
          };
        });
      }
    }

    if (type === 'boolean') {
      return {
        ...rest,
        validationType: type,
        validations: [
          {
            type: 'oneOf',
            params: [rest.required],
            default: rest.default
          }
        ]
      };
    }

    if (type === 'number') {
      const validations: any[] = [];

      if (!rest.notRequired) {
        validations.push({ type: 'required', params: [rest.required] });
      } else {
        validations.push({ type: 'notRequired', params: [] });
      }
      if (rest.min) {
        validations.push({ type: 'min', params: [rest.min, rest.minMessage] });
      }
      if (rest.max) {
        validations.push({ type: 'max', params: [rest.max, rest.maxMessage] });
      }

      if (rest.typeError) {
        validations.push({ type: 'typeError', params: [rest.typeError] });
      }

      if (rest.test) {
        validations.push({
          type: 'test',
          params: [rest.testMessage],
          testFunc: rest.testCase,
          testName: rest.testName
        });
      }
      return {
        ...rest,
        validationType: type,
        validations
      };
    }

    if (type === 'array') {
      const validations: any[] = [];

      if (!rest.notRequired) {
        validations.push({ type: 'required', params: [rest.required] });
      } else {
        validations.push({ type: 'notRequired', params: [] });
      }
      return {
        ...rest,
        validationType: type,
        validations
      };
    }

    return null;
  });
};

// Function to convert config into Yup schema
const useDynamicYupFields: any = (schema: any, config?: any) => {
  const {
    name,
    validationType,
    validations,
    errorMsg,
    required,
    default: defaultValue
  } = config;
  const Yup: any = yup;

  if (!Yup[validationType]) return schema;
  let validator: any;
  validator = Yup[validationType]();

  if (defaultValue !== undefined) {
    validator = validator.default(defaultValue);
  }
  validations?.forEach((validation: any) => {
    const { params, type, testName, testFunc, default: defaultValue }: any = validation;
    if (type === 'test') {
      validator = validator?.test(testName, ...params, testFunc);
    } else if (type === 'required' || type === 'notRequired') {
      validator = validator[type](...params);
    } else if (['min', 'max', 'matches'].includes(type)) {
      validator = validator[type](...params);
    } else if (type === 'oneOf') {
      validator = validator.oneOf([true], ...params).default(defaultValue);
    } else if (type === 'email') {
      validator = validator.email(...params);
    } else if (type === 'nullable') {
      validator = validator.nullable();
    } else if (type === 'typeError') {
      validator = validator.typeError(...params);
    } else if (type === 'trim') {
      validator = validator.trim();
    }
  });

  if (validationType === 'object' && errorMsg) {
    const innerShape: any = {};
    errorMsg.forEach((field: any) => {
      innerShape[field.name] = Yup[field.type]().required(field.required);
    });
    validator = validator.shape(innerShape).required(required);
  }

  if (validationType === 'array' && errorMsg) {
    const innerShape: any = {};
    errorMsg.forEach((field: any) => {
      innerShape[field.name] = Yup[field.type]().required(field.required);
    });
    validator = validator.of(Yup.object().shape(innerShape));
  }

  schema[name] = validator;
  return schema;
};

export { useDynamicYupFields, fieldsValidationExtend, useDynamicYupSchema };
