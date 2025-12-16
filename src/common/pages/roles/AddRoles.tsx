import {
  Box,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/redux/hooks';
import { capitalizeFirstLetter } from '../../../utils/commonFunctions';
import { updateToast } from '../../redux/reducer/commonSlices/toastSlice';
import {
  addRole,
  getRoles,
  updateRole
} from '../../redux/reducer/commonSlices/roleSlice';
import { feature } from '../../redux/reducer/commonSlices/loginSlice';
import CustomIconButton from '../../components/buttons/CustomIconButton';
import CustomTextField from '../../components/customized/customtextfield/CustomTextField';
import CustomDataGrid from '../../components/customized/customdatagrid/CustomDataGrid';
import CustomButton from '../../components/buttons/CustomButton';
import { moduleDatas } from './rolesDatas';

const featuresSchema = yup.object().shape({
  rolename: yup.string().required('Enter role name'),
  description: yup
    .string()
    .notRequired()
    .test('Description', 'Description have at least 10 words', function (params) {
      if (params) {
        return params?.length > 20 ? true : false;
      } else {
        return true;
      }
    })
});

const credentialsSchema = yup.object().shape({
  rolename: yup.string().required('Enter role Name')
});

interface AddSubUser {
  isOpen: boolean;
  setIsOpen: any;
  roleType: string;
  filteredRow: any;
  setFilteredRow: any;
}

const AddRoles = ({
  isOpen,
  setIsOpen,
  roleType,
  filteredRow,
  setFilteredRow
}: AddSubUser) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(featuresSchema)
  });
  const {
    control: credentialsControl,
    handleSubmit: credentialsHandleSubmit,
    setValue: credentialsSetValue,
    reset: credentialsReset
  } = useForm({
    resolver: yupResolver(credentialsSchema)
  });

  const { data, featureData, isLoading, roleData, existingFeatures } = useAppSelector(
    state => state.RoleModuleAccess
  );

  const { isLoading: addIsLoading } = useAppSelector(state => state.addRole);

  const { isLoading: UpdateIsLoading } = useAppSelector(state => state.updateRole);

  const featuresModule = useAppSelector(state => state.RoleModuleAccess.features);

  const [activeStep, setActiveStep] = useState(0);
  const [rolesData, setRolesData] = useState<any>(null);
  const [selectedRow, setSelectedRow] = useState<any>([]);
  const [combinedDetails, setCombinedDetails] = useState<any | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>([]);
  const [access, setAcess] = useState<any>(true);
  const [moduleRow, setModuleRow] = useState<any>([]);
  const dispatch = useAppDispatch();

  const roleModules = [
    'summary',
    'schedule',
    'tour',
    'regular',
    'vehicle',
    'pickup',
    'driver'
  ];

  /*
  const rows = [
    {
      id: 0,
      serialNo: '1',
      feature: 'Yaantrac',
      description: 'Its a tracking system'
    },
    {
      id: 1,
      serialNo: '2',
      feature: 'Autoplanner',
      description: 'Its related to trip'
    },
    {
      id: 2,
      serialNo: '3',
      feature: 'Truck Management',
      description: 'Its used to manage the truck'
    }
  ]; */

  const columns = [
    {
      field: 'id',
      headerName: `S No.`,
      flex: 1,
      maxWidth: 150
    },
    {
      field: 'featureName',
      headerName: `Feature`,
      flex: 1,
      minWidth: 150
    },
    {
      field: 'description',
      headerName: `Description`,
      flex: 1,
      minWidth: 150
    }
  ];

  const names: any = {};
  roleData?.featureResponseList?.forEach((item: any) => {
    if (
      selectedRow?.map((value: any) => value?.featureName)?.includes(item?.featureName)
    ) {
      item?.modules.forEach((module: any) => {
        names[module?.moduleName] = (names[module.moduleName] ?? 0) + 1;
      });
    }
  });

  const existedColumns = [
    'module',
    ...selectedRow?.map((value: any) => value?.featureName)
  ];

  const handleModule = (params: any, checked: any, action: string, col: string) => {
    if (action === 'Module') {
      setModuleRow((prev: any) => {
        const updatedDatas = prev?.map((item: any) => {
          const updatedValues: any = {};
          selectedRow
            ?.map((feature: any) => feature?.featureName)
            ?.forEach((value: any) => {
              updatedValues[value] = item[value]?.map((updates: any) => ({
                ...updates,
                checked: params.row?.module === item?.module ? checked : updates.checked,
                disabled: params?.row?.module === item?.module ? true : updates.disabled
              }));
            });

          return {
            ...item,
            checked: params.row?.module === item?.module ? checked : item?.checked,
            ...updatedValues
          };
        });
        return updatedDatas;
      });
    } else {
      setModuleRow((prev: any) => {
        if (names[params?.row?.module] > 1) {
          const updatedParams: any = {};
          const updatedDatas = prev?.map((items: any) => {
            selectedRow
              ?.map((feature: any) => feature?.featureName)
              ?.forEach((value: any) => {
                updatedParams[value] = items[value]?.map((item: any) => ({
                  ...item,
                  checked:
                    params?.row?.module === items?.module && item?.action === action
                      ? checked
                      : item?.checked
                }));
              });
            return {
              ...items,
              ...updatedParams
            };
          });
          return updatedDatas;
        } else {
          const updatedDatas = prev?.map((item: any) => ({
            ...item,
            [params?.field]:
              params?.row?.module === item?.module
                ? item[params?.field]?.map((update: any) => ({
                    ...update,
                    checked: update?.action === action ? checked : update?.checked
                  }))
                : item[params?.field]
          }));
          return updatedDatas;
        }
      });
    }

    // setModuleRow((prev: any) => {
    //   const updatedFeature = prev?.map((item: any) => {
    //     if (item.feature === params.field) {
    //       return {
    //         ...item,
    //         module: item.module.map((mod: any) => ({
    //           ...mod,
    //           read:
    //             type === 'Get' && mod.field === params.row.module ? checked : mod.read,
    //           write:
    //             type === 'Update' && mod.field === params.row.module ? checked : mod.write
    //         }))
    //       };
    //     }
    //     return item;
    //   });

    //   const isExisting = prev?.some((item: any) => item.feature === params.field);

    //   if (!isExisting) {
    //     updatedFeature.push({
    //       feature: params.field,
    //       module: [
    //         {
    //           field: params.row.module,
    //           read: type === 'Get' && checked,
    //           write: type === 'Update' && checked
    //         }
    //       ]
    //     });
    //   }
    //   return updatedFeature;
    // });
  };

  const moduleColumns = existedColumns
    ?.map((col: any, index: number) => {
      if (index === 0) {
        return {
          field: col,
          headerName: capitalizeFirstLetter(col),
          flex: 1,
          minWidth: 250,
          renderCell: (params: any) => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={e => handleModule(params, e.target.checked, 'Module', '')}
                    checked={params?.row?.checked}
                    disabled={params?.row?.disabled}
                  />
                }
                label={capitalizeFirstLetter(params?.row?.module)}
              />
            );
          }
        };
      } else {
        return {
          field: col,
          headerName: capitalizeFirstLetter(col),
          flex: 1,
          minWidth: 500,
          headerAlign: 'center',
          align: 'center',
          renderCell: (params: any) => {
            const modules = params?.row[col];
            if (!modules) {
              return (
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#a29d9d'
                  }}
                >
                  N/A
                </Typography>
              );
            }
            return (
              <Box display='flex' gap={2} alignItems='center'>
                {modules?.map((actions: any, index: number) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        onChange={e =>
                          handleModule(params, e.target.checked, actions.action, col)
                        }
                        checked={actions?.checked}
                      />
                    }
                    disabled={actions.disabled}
                    label={actions.action}
                  />
                ))}
              </Box>
            );
          }
        };
      }
    })
    ?.filter((item: any, index) => index === 0);

  const handleNext = (params: any) => {
    if (selectedRow?.map((value: any) => value?.featureName)?.length > 0) {
      setActiveStep(1);
    }
    if (selectedRow?.map((value: any) => value?.featureName)?.length === 0) {
      dispatch(
        updateToast({
          show: true,
          message: 'Please select altleast one feature',
          severity: 'warning'
        })
      );
    }
  };

  const onSubmit = async (params: any) => {
    if (filteredRow) {
      const UpdatePayload = selectedRow?.map((item: any) => {
        let updatedObj: any = {};
        moduleRow?.forEach((response: any) => {
          if (
            item?.modules
              ?.map((module: any) => module.moduleName)
              ?.includes(response?.module) &&
            response[item.featureName]?.some((action: any) => action.checked)
          ) {
            updatedObj[response?.module] = {
              moduleId: response?.moduleId,
              accessTypes: response[item?.featureName]
                ?.filter((res: any) => res.checked)
                ?.map((resdata: any) => resdata.action)
            };
          }
        });

        return {
          featureId: item.featureId,
          moduleAccessRequestList: Object.values(updatedObj)
        };
      });

      const moduleUpdate = UpdatePayload?.every(
        (item: any) => item?.moduleAccessRequestList?.length > 0
      );
      if (moduleUpdate) {
        const res = {
          roleName: params?.rolename,
          description: params?.description,
          featureAccessList: UpdatePayload
        };
        const updateRes = {
          featureAccessList: res,
          id: filteredRow?.roleId
        };

        let res1 = await dispatch(updateRole(updateRes));
        if (updateRole.fulfilled.type === res1.type) {
          await dispatch(getRoles());
          setIsOpen(false);
        }
      } else {
        dispatch(
          updateToast({
            show: true,
            message: 'Please select one module in each feature',
            severity: 'warning'
          })
        );
      }
    } else {
      const addpayload = selectedRow?.map((item: any) => {
        let updatedObj: any = {};
        moduleRow?.forEach((response: any) => {
          if (
            item?.modules
              ?.map((module: any) => module.moduleName)
              ?.includes(response?.module) &&
            response[item.featureName]?.some((action: any) => action.checked)
          ) {
            updatedObj[response?.module] = {
              moduleId: response?.moduleId,
              accessTypes: response[item?.featureName]
                ?.filter((res: any) => res.checked)
                ?.map((resdata: any) => resdata.action)
            };
          }
        });

        return {
          featureId: item.featureId,
          moduleAccessRequestList: Object.values(updatedObj)
        };
      });
      const hasModuleAccess = addpayload?.every(
        (item: any) => item?.moduleAccessRequestList?.length > 0
      );
      if (hasModuleAccess) {
        const res = {
          roleName: params?.rolename,
          description: params?.description,
          featureAccessList: addpayload,
          category: 'OPERATION_USER'
        };

        let res2 = await dispatch(addRole(res));
        if (addRole.fulfilled.type === res2.type) {
          await dispatch(getRoles());
          setIsOpen(false);
        }
      } else {
        dispatch(
          updateToast({
            show: true,
            message: 'Please select one module in each feature',
            severity: 'warning'
          })
        );
      }
    }
  };

  const handleClose = () => {
    reset();
    setActiveStep(0);
    setIsOpen(false);
    setFilteredRow(null);
    setModuleRow(null);
    setSelectedRow(null);
    // dispatch(feature([] as any));
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveStep(0);
    }
  };

  useEffect(() => {
    if (filteredRow) {
      const mergedModules = featuresModule?.map((module: any) => {
        const matchedModule = filteredRow.featureAccessResponseList
          ?.flatMap((item: any) => item.modules)
          ?.find((value: any) => value.moduleName === module.module);

        if (!matchedModule) return module;

        const updatedModule = {
          ...module,
          checked: true,
          moduleId: matchedModule.moduleId
        };

        Object.keys(module).forEach(key => {
          if (Array.isArray(module[key])) {
            updatedModule[key] = module[key].map((action: any) => ({
              ...action,
              checked: matchedModule.accessType?.includes(action.action),
              disabled: action.action === 'GET'
            }));
          }
        });
        return updatedModule;
      });
      setModuleRow(mergedModules);
    } else {
      setModuleRow(featuresModule);
    }
  }, [featuresModule, filteredRow]);

  useEffect(() => {
    if (filteredRow) {
      setValue('rolename', filteredRow?.roleName);
      setValue('description', filteredRow?.description);
      setAcess(true);
      const selectedFeatureNames = filteredRow?.featureAccessResponseList?.map(
        (item: any) => item?.featureName
      );
      dispatch(feature(selectedFeatureNames));
    }
  }, [filteredRow]);

  useEffect(() => {
    if (filteredRow && existingFeatures && access) {
      setAcess(false);
      const features = featureData
        ?.map((featureItem: any, index: number) =>
          filteredRow?.featureAccessResponseList?.some(
            (accessItem: any) => accessItem?.featureName === featureItem?.featureName
          )
            ? index + 1
            : null
        )
        ?.filter((val: any) => val !== null);
      setSelectedIndex(features);
      const updatedFeatures = featureData?.filter((item: any) =>
        filteredRow?.featureAccessResponseList
          ?.map((val: any) => val.featureName)
          ?.includes(item.featureName)
      );
      setSelectedRow(updatedFeatures);
      const res = Object.fromEntries(
        Object.entries(existingFeatures)?.filter(([a, b]) => roleModules?.includes(a))
      );

      let updatedModules: any = Object.assign({}, existingFeatures);

      filteredRow?.featureAccessResponseList?.forEach((features: any) => {
        features?.modules?.forEach((modules: any, index: number) => {
          const existedKeys = Object.keys(updatedModules);
          if (existedKeys?.includes(modules?.moduleName)) {
            updatedModules[modules?.moduleName] = {
              ...updatedModules[modules?.moduleName],
              moduleId: modules?.moduleId,
              checked: true,
              [features.featureName]: [
                { action: 'GET', checked: false, disabled: true },
                { action: 'ADD', checked: false, disabled: true },
                { action: 'UPDATE', checked: false, disabled: true },
                { action: 'PATCH', checked: false, disabled: true },
                { action: 'DELETE', checked: false, disabled: true }
              ]?.map((item: any) => ({
                ...item,
                checked: modules?.accessType?.includes(item?.action)
                  ? true
                  : item.checked,
                disabled: true
              }))
            };
          } else {
            updatedModules[modules?.moduleName] = {
              id: index + 1,
              module: modules?.moduleName,
              moduleId: modules?.moduleId,
              checked: true,
              [features.featureName]: [
                { action: 'GET', checked: false, disabled: true },
                { action: 'ADD', checked: false, disabled: true },
                { action: 'UPDATE', checked: false, disabled: true },
                { action: 'PATCH', checked: false, disabled: true },
                { action: 'DELETE', checked: false, disabled: true }
              ]?.map((item: any) => ({
                ...item,
                checked: modules?.accessType?.includes(item?.action)
                  ? true
                  : item.checked,
                disabled: true
              }))
            };
            return updatedModules;
          }
        });
      });
      const datas = Object.values(updatedModules)?.filter(
        (modules: any) => modules.module !== 'user'
      );
      setModuleRow(datas);
    }
  }, [existingFeatures, filteredRow, access]);

  useEffect(() => {
    if (featureData && !filteredRow) {
      featureData?.forEach((item: any, index: number) => {
        if (item?.featureName === 'autoplanner') {
          setSelectedIndex([index + 1]);
          setSelectedRow([item]);
        }
      });
      dispatch(feature(featureData?.map((value: any) => value?.featureName)));
    }
  }, [featureData, filteredRow]);

  return (
    <Dialog
      open={isOpen}
      maxWidth={'md'}
      PaperProps={{
        sx: {
          minHeight: '500px'
        }
      }}
      fullWidth
      className='freight-dialog animate__animated animate__zoomInRight'
      slotProps={{ backdrop: { invisible: true } }}
    >
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px !important'
          }}
        >
          <Box
            className='closeIcon icon-position d-flex'
            sx={{ zIndex: '1' }}
            onClick={handleClose}
          >
            <CustomIconButton category='CloseValue' />
          </Box>
          <Typography sx={{ fontWeight: 700 }}>
            {roleType === 'Add Role' ? 'Add Role' : 'Update Role'}
          </Typography>
          {/* <Stepper activeStep={activeStep} alternativeLabel>
            <Step>
              <StepLabel>Feature</StepLabel>
            </Step>
            <Step>
              <StepLabel>Module</StepLabel>
            </Step>
          </Stepper> */}
          <Box>
            <>
              <Box className='animate__animated animate__zoomIn animate__fast'>
                <Grid container gap={3}>
                  <Grid item lg={3} sm={3} xs={12} md={3}>
                    <CustomTextField
                      name='rolename'
                      id='rolename'
                      label='Role'
                      disabled={filteredRow ? true : false}
                      control={control}
                      placeholder='Role'
                    />
                  </Grid>
                  <Grid item lg={3} sm={3} xs={12} md={3}>
                    <CustomTextField
                      name='description'
                      id='description'
                      isOptional={true}
                      label='Description'
                      control={control}
                      placeholder='Enter Description'
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box
                className='animate__animated animate__zoomIn animate__fast'
                component={'form'}
                onSubmit={handleSubmit(onSubmit)}
              >
                {moduleRow?.length > 0 && (
                  <CustomDataGrid
                    rows={moduleRow}
                    columns={moduleColumns}
                    pageSize={5}
                    paginationMode={'client'}
                  />
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <CustomButton
                      className='cancel'
                      category='Cancel'
                      onClick={() => handleClose()}
                    />
                    <CustomButton
                      className='saveChanges'
                      type='submit'
                      loading={filteredRow ? UpdateIsLoading : addIsLoading}
                      category={roleType === 'Add Role' ? 'Add' : 'Update'}
                      sx={{ marginLeft: '20px' }}
                    />
                  </Box>
                </Box>
              </Box>
            </>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoles;
