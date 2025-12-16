import { Dialog, DialogProps, styled } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import Resizer from 'react-image-file-resizer';
import {
  capitalizeFirstLetter,
  convertDatetoEpoch,
  convertToEpoch2,
  debounce
} from '../../../../../../utils/commonFunctions';
import dayjs from 'dayjs';
import {
  getAllDriverFuelDashboard,
  getPaymentDropdown,
  getStationDropdown,
  getTypeDropdown,
  updateDriverFuel,
  vehicleNumberValid
} from '../../../../../../common/redux/reducer/commonSlices/driverFuelSlice';
import {
  clearVehicleValidation,
  setValidationErrors
} from '../../../../../../common/redux/reducer/commonSlices/driverSlice';

export const useMemoDialog = ({ files }: any) => {
  const BlurryDialog = styled(Dialog)<DialogProps>(({ theme }) => ({
    backgroundColor: 'rgba(60, 60, 60, 0.5)'
  }));
  const MemoizedDialog = useCallback(BlurryDialog, [files?.length]);
  return { MemoizedDialog };
};

export const useUpdateFuelStates = () => {
  const [dateTime, setDateTime] = useState<any>();
  const [validationErrors, setValidationErrorsMake] = useState<any>({
    vehicleNumber: null
  });
  const [error, setError] = useState(false);
  const [validationFields, setValidationFields] = useState<any>({
    vehicleNumber: { status: false }
  });
  const [odometerFiles, setOdometerFiles] = useState<any>([]);
  const [fuelFiles, setFuelFiles] = useState<any>([]);
  const [adBlueFiles, setAdBlueFiles] = useState<any>([]);
  const [overallFiles, setOverallFiles] = useState<any>({
    odometerFiles: [],
    OdometerImagesToDelete: [],
    fuelFiles: [],
    FuelImagesToDelete: [],
    adBlueFiles: [],
    AdBlueImagesToDelete: []
  });
  const [imageCard, setImageCard] = useState<boolean>(false);
  const [files, setFiles] = useState<any[]>([]);
  const [uploadedOdometerFiles, setUploadedOdometerFiles] = useState<any>([]);
  const [uploadedFuelFiles, setUploadedFuelFiles] = useState<any>([]);
  const [uploadedAdBlueFiles, setUploadedAdBlueFiles] = useState<any>([]);
  return {
    validationFields,
    setValidationFields,
    error,
    setError,
    validationErrors,
    setValidationErrorsMake,
    dateTime,
    setDateTime,
    overallFiles,
    setOverallFiles,
    adBlueFiles,
    setAdBlueFiles,
    fuelFiles,
    setFuelFiles,
    odometerFiles,
    setOdometerFiles,
    uploadedAdBlueFiles,
    setUploadedAdBlueFiles,
    uploadedFuelFiles,
    setUploadedFuelFiles,
    uploadedOdometerFiles,
    setUploadedOdometerFiles,
    files,
    setFiles,
    imageCard,
    setImageCard
  };
};
export const useUpdateFuelDropdown = ({
  typeDropdownData,
  stationDropdownData,
  paymentDropdownData
}: any) => {
  const fuelTypeOptions =
    typeDropdownData?.map((item: any) => ({
      id: item?.id,
      label: capitalizeFirstLetter(item?.name)
    })) ?? [];

  const fuelStationOptions =
    stationDropdownData?.map((item: any) => ({
      id: item?.id,
      label: capitalizeFirstLetter(item?.name)
    })) ?? [];

  const paymentOptions =
    paymentDropdownData?.map((item: any) => ({
      id: item?.id,
      label: capitalizeFirstLetter(item?.name)
    })) ?? [];
  return { fuelTypeOptions, fuelStationOptions, paymentOptions };
};

export const useConfig = ({
  overallFiles,
  uploadedOdometerFiles,
  uploadedFuelFiles,
  uploadedAdBlueFiles
}: any) => {
  const uploadConfig = [
    {
      title: 'Odometer',
      type: 'Odometer',
      overallFiles: overallFiles.odometerFiles,
      uploadedFiles: uploadedOdometerFiles
    },
    {
      title: 'Fuel Receipt',
      type: 'Fuel',
      overallFiles: overallFiles.fuelFiles,
      uploadedFiles: uploadedFuelFiles
    },
    {
      title: 'AdBlue Receipt',
      type: 'AdBlue',
      overallFiles: overallFiles.adBlueFiles,
      uploadedFiles: uploadedAdBlueFiles
    }
  ];
  return { uploadConfig };
};

export const useHandleUpload = ({
  uploadedOdometerFiles,
  uploadedFuelFiles,
  uploadedAdBlueFiles,
  setUploadedOdometerFiles,
  setValue,
  trigger,
  setUploadedFuelFiles,
  setUploadedAdBlueFiles
}: any) => {
  const handleUpload = async (type: string, capturedFile?: File) => {
    if (capturedFile) {
      const file = capturedFile;
      const fileName = file.name;
      const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
      const baseName = fileName.slice(0, fileName.lastIndexOf('.'));

      let newFile: File;

      if (type === 'Odometer') {
        if (uploadedOdometerFiles.some((f: any) => f.name === fileName)) {
          newFile = new File([file], `${baseName}(1)${fileExtension}`, {
            type: file.type,
            lastModified: file.lastModified
          });
        } else {
          newFile = file;
        }
      } else if (type === 'Fuel') {
        if (uploadedFuelFiles.some((f: any) => f.name === fileName)) {
          newFile = new File([file], `${baseName}(1)${fileExtension}`, {
            type: file.type,
            lastModified: file.lastModified
          });
        } else {
          newFile = file;
        }
      } else if (type === 'AdBlue') {
        if (uploadedAdBlueFiles.some((f: any) => f.name === fileName)) {
          newFile = new File([file], `${baseName}(1)${fileExtension}`, {
            type: file.type,
            lastModified: file.lastModified
          });
        } else {
          newFile = file;
        }
      } else {
        newFile = file;
      }

      (Resizer as any).imageFileResizer(
        newFile,
        1920,
        1920,
        'JPEG',
        50,
        0,
        (uri: any) => {
          const blob = new Blob([uri], { type: 'image/jpeg' });
          const resizedFile = new File([blob], newFile.name, {
            type: 'image/jpeg'
          });
          if (type === 'Odometer') {
            setUploadedOdometerFiles((prev: any) => {
              const updated = [...prev, resizedFile];
              setValue('odometer', updated);
              trigger('odometer');
              return updated;
            });
          } else if (type === 'Fuel') {
            setUploadedFuelFiles((prev: any) => {
              const updated = [...prev, resizedFile];
              setValue('fuel', updated);
              trigger('fuel');
              return updated;
            });
          } else {
            setUploadedAdBlueFiles((prev: any) => {
              const updated = [...prev, resizedFile];
              setValue('adBlue', updated);
              trigger('adBlue');
              return updated;
            });
          }
        },
        'blob'
      );
      return;
    }

    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.multiple = true;
    inputElement.onchange = async (event: Event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files) return;
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        let newFile: File;
        const fileName = file.name;
        const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
        const baseName = fileName.slice(0, fileName.lastIndexOf('.'));
        if (type === 'Odometer') {
          if (uploadedOdometerFiles.some((f: any) => f.name === fileName)) {
            newFile = new File([file], `${baseName}(1)${fileExtension}`, {
              type: file.type,
              lastModified: file.lastModified
            });
          } else {
            newFile = file;
          }
        } else if (type === 'Fuel') {
          if (uploadedFuelFiles.some((f: any) => f.name === fileName)) {
            newFile = new File([file], `${baseName}(1)${fileExtension}`, {
              type: file.type,
              lastModified: file.lastModified
            });
          } else {
            newFile = file;
          }
        } else if (type === 'AdBlue') {
          if (uploadedAdBlueFiles.some((f: any) => f.name === fileName)) {
            newFile = new File([file], `${baseName}(1)${fileExtension}`, {
              type: file.type,
              lastModified: file.lastModified
            });
          } else {
            newFile = file;
          }
        } else {
          newFile = file;
        }
        (Resizer as any).imageFileResizer(
          newFile,
          1920,
          1920,
          'JPEG',
          50,
          0,
          (uri: any) => {
            const blob = new Blob([uri], { type: 'image/jpeg' });
            const resizedFile = new File([blob], newFile.name, {
              type: 'image/jpeg'
            });
            if (type === 'Odometer') {
              setUploadedOdometerFiles((prev: any) => {
                const updated = [...prev, resizedFile];
                setValue('odometer', updated);
                trigger('odometer');
                return updated;
              });
            } else if (type === 'Fuel') {
              setUploadedFuelFiles((prev: any) => {
                const updated = [...prev, resizedFile];
                setValue('fuel', updated);
                trigger('fuel');
                return updated;
              });
            } else {
              setUploadedAdBlueFiles((prev: any) => {
                const updated = [...prev, resizedFile];
                setValue('adBlue', updated);
                trigger('adBlue');
                return updated;
              });
            }
          },
          'blob'
        );
      }
    };
    inputElement.click();
  };
  return { handleUpload };
};

export const useHandleDelete = ({
  odometerFiles,
  setOdometerFiles,
  overallFiles,
  setOverallFiles,
  fuelFiles,
  setFuelFiles,
  adBlueFiles,
  setAdBlueFiles,
  setUploadedOdometerFiles,
  uploadedOdometerFiles,
  setValue,
  trigger,
  uploadedFuelFiles,
  setUploadedFuelFiles,
  setUploadedAdBlueFiles,
  uploadedAdBlueFiles
}: any) => {
  const handleDelete = (data: any, type: any) => {
    if (type === 'OldOdometer') {
      const newFiles = odometerFiles?.filter(
        (value: any) => value.fileName !== data.fileName
      );
      setOdometerFiles(newFiles);
      const deletedFiles = overallFiles.odometerFiles.filter(
        (item: any) => item.fileUrl === data.fileUrl
      );
      setOverallFiles((prev: any) => ({
        ...prev,
        odometerFiles: prev.odometerFiles.filter(
          (item: any) => item.fileName !== data.fileName
        ),
        OdometerImagesToDelete: [
          ...prev.OdometerImagesToDelete,
          ...deletedFiles
            .filter((item: any) => item.type === 'oldOdometer')
            .map((item: any) => item.fileName)
        ]
      }));
    } else if (type === 'OldFuel') {
      const newFiles = fuelFiles?.filter(
        (value: any) => value.fileName !== data.fileName
      );
      setFuelFiles(newFiles);
      const deletedFiles = overallFiles.fuelFiles.filter(
        (item: any) => item.fileUrl === data.fileUrl
      );
      setOverallFiles((prev: any) => ({
        ...prev,
        fuelFiles: prev.fuelFiles.filter((item: any) => item.fileName !== data.fileName),
        FuelImagesToDelete: [
          ...prev.FuelImagesToDelete,
          ...deletedFiles
            .filter((item: any) => item.type === 'oldFuel')
            .map((item: any) => item.fileName)
        ]
      }));
    } else if (type === 'OldAdBlue') {
      const newFiles = adBlueFiles?.filter(
        (value: any) => value.fileName !== data.fileName
      );
      setAdBlueFiles(newFiles);
      const deletedFiles = overallFiles.adBlueFiles.filter(
        (item: any) => item.fileUrl === data.fileUrl
      );
      setOverallFiles((prev: any) => ({
        ...prev,
        adBlueFiles: prev.adBlueFiles.filter(
          (item: any) => item.fileName !== data.fileName
        ),
        AdBlueImagesToDelete: [
          ...prev.AdBlueImagesToDelete,
          ...deletedFiles
            .filter((item: any) => item.type === 'oldAdBlue')
            .map((item: any) => item.fileName)
        ]
      }));
    } else if (type === 'Odometer') {
      const newFiles = uploadedOdometerFiles?.filter((value: any) => value !== data);
      setUploadedOdometerFiles(newFiles);
      setValue('odometer', newFiles.length === 0 ? undefined : newFiles);
      trigger('odometer');
    } else if (type === 'Fuel') {
      const newFiles = uploadedFuelFiles?.filter((value: any) => value !== data);
      setUploadedFuelFiles(newFiles);
      setValue('fuel', newFiles.length === 0 ? undefined : newFiles);
      trigger('fuel');
    } else if (type === 'AdBlue') {
      const newFiles = uploadedAdBlueFiles?.filter((value: any) => value !== data);
      setUploadedAdBlueFiles(newFiles);
      setValue('adBlue', newFiles.length === 0 ? undefined : newFiles);
      trigger('adBlue');
    }
  };
  return { handleDelete };
};

export const useOnSubmit = ({
  location,
  selectedValue,
  uploadedAdBlueFiles,
  uploadedFuelFiles,
  uploadedOdometerFiles,
  overallFiles,
  dispatch,
  setIsUpdate,
  setPageNo,
  filterPayload
}: any) => {
  const onSubmit = async (data: any) => {
    const payloads: any = {
      vehicleNumber: data?.vehicleNumber,
      fuelTimeStamp: convertToEpoch2(data?.dateTime),
      fuelVolume: data?.volume,
      paymentMethodId: data?.paymentMethod,
      fuelTypeId: data?.fuelType,
      fuelPricePerUnit: data?.price,
      fuelStationId: data?.fuelStation,
      odometerReading: data?.reading,
      gpsLatitude: selectedValue?.gpsLatitude,
      gpsLongitude: selectedValue?.gpsLongitude,
      notes: data?.notes,
      adblueVolume: data?.adBlueVolume,
      adbluePricePerUnit: data?.adBluePrice,
      fuelEntryId: selectedValue?.fuelEntryId,
      isExternalVehicle: selectedValue?.isExternalVehicle
    };

    const payload: any = new FormData();
    payload.append(
      'updateFuelEntriesRequest',
      new Blob([JSON.stringify(payloads)], { type: 'application/json' })
    );
    uploadedOdometerFiles.forEach((item: any, index: number) => {
      payload.append('odometerAttachments', uploadedOdometerFiles[index]);
    });
    uploadedFuelFiles.forEach((item: any, index: number) => {
      payload.append('fuelReceiptAttachments', uploadedFuelFiles[index]);
    });
    uploadedAdBlueFiles.forEach((item: any, index: number) => {
      payload.append('adblueReceiptAttachments', uploadedAdBlueFiles[index]);
    });
    const filesToDeletePayload = {
      odometerFiles: overallFiles?.OdometerImagesToDelete || [],
      fuelReceiptAttachments: overallFiles?.FuelImagesToDelete || [],
      adblueReceiptAttachments: overallFiles?.AdBlueImagesToDelete || []
    };

    if (
      filesToDeletePayload.odometerFiles.length ||
      filesToDeletePayload.fuelReceiptAttachments.length ||
      filesToDeletePayload.adblueReceiptAttachments.length
    ) {
      payload.append(
        'filesToDelete',
        new Blob([JSON.stringify(filesToDeletePayload)], { type: 'application/json' })
      );
    }

    const driverFuelPayload = {
      payload: payload
    };
    const updateAction = await dispatch(updateDriverFuel(driverFuelPayload));
    if (updateDriverFuel.fulfilled.type === updateAction.type) {
      setIsUpdate(false);
      setPageNo(1);
      await dispatch(getAllDriverFuelDashboard(filterPayload));
    }
  };
  return { onSubmit };
};

export const useHandleImage = ({ setImageCard, setFiles }: any) => {
  const handleImage = (fileUrl: any, fileName: any) => {
    setImageCard(true);
    setFiles([{ url: fileUrl, name: fileName }]);
  };
  return { handleImage };
};

export const useHandleFilterChange = ({
  setValidationFields,
  dispatch,
  setError,
  trigger,
  validationErrors
}: any) => {
  const handleFilterChange = useCallback(
    debounce(async (event: any, field) => {
      setValidationFields((prev: any) => ({
        ...prev,
        [field]: { status: true }
      }));
      if (['vehicleNumber']?.includes(field) && event) {
        const response = await dispatch(vehicleNumberValid(event));
        if (field === 'vehicleNumber' && response?.payload?.status !== 200) {
          setError(true);
        }

        await dispatch(
          setValidationErrors({
            fieldName: field,
            error: response?.payload?.status !== 200 ? response.payload : '',
            status: false
          })
        );
        setValidationFields((prev: any) => ({
          ...prev,
          [field]: { status: false }
        }));
        trigger(field);
      }
    }),
    [validationErrors]
  );
  return { handleFilterChange };
};

export const useUpdateFuelEffects = ({
  setValidationErrorsMake,
  vehicleNumberValidation,
  error,
  trigger,
  validationErrors,
  setLocation,
  dispatch,
  selectedValue,
  setValue,
  setDateTime,
  setAdBlueFiles,
  setFuelFiles,
  setOdometerFiles,
  setOverallFiles
}: any) => {
  useEffect(() => {
    setValidationErrorsMake({
      vehicleNumber: vehicleNumberValidation?.error
    });
  }, [vehicleNumberValidation]);

  useEffect(() => {
    if (error) trigger('vehicleNumber');
  }, [validationErrors?.vehicleNumber, error]);

  useEffect(() => {
    dispatch(getTypeDropdown());
    dispatch(getStationDropdown());
    dispatch(getPaymentDropdown());
    return () => {
      dispatch(clearVehicleValidation());
    };
  }, []);

  useEffect(() => {
    if (selectedValue) {
      setValue('vehicleNumber', selectedValue?.vehicleNumber);
      setValue('reading', selectedValue?.odometerReading);
      setValue('fuelType', selectedValue?.fuelTypeId);
      setValue('volume', selectedValue?.volume);
      setValue('price', selectedValue?.fuelPricePerUnit);
      setValue('total', selectedValue?.cost);
      setValue('fuelStation', selectedValue?.fuelStationId);
      setValue('paymentMethod', selectedValue?.paymentId);
      setValue('notes', selectedValue?.notes);
      setValue('adBlueVolume', selectedValue?.adblueVolume);
      setValue('adBluePrice', selectedValue?.adbluePricePerUnit);
      setValue('adBlueTotal', selectedValue?.adblueTotalCost);
      const value: any = dayjs.unix(selectedValue?.dateAndTime);
      setDateTime(value?.$d);
      setValue('dateTime', dayjs.unix(convertDatetoEpoch(value?.$d) / 1000).toDate());

      const odometerOld = (selectedValue?.odometerAttachments || []).map((item: any) => ({
        fileUrl: item.imageUrl,
        fileName: item.fileName,
        type: 'oldOdometer'
      }));

      const fuelOld = (selectedValue?.fuelReceiptAttachments || []).map((item: any) => ({
        fileUrl: item.imageUrl,
        fileName: item.fileName,
        type: 'oldFuel'
      }));

      const adBlueOld = (selectedValue?.adblueReceiptAttachments || []).map(
        (item: any) => ({
          fileUrl: item.imageUrl,
          fileName: item.fileName,
          type: 'oldAdBlue'
        })
      );

      setOdometerFiles(odometerOld);
      setFuelFiles(fuelOld);
      setAdBlueFiles(adBlueOld);

      setOverallFiles({
        odometerFiles: odometerOld,
        OdometerImagesToDelete: [],
        fuelFiles: fuelOld,
        FuelImagesToDelete: [],
        adBlueFiles: adBlueOld,
        AdBlueImagesToDelete: []
      });

      setValue('odometer', odometerOld.length > 0 ? odometerOld : undefined);
      setValue('fuel', fuelOld.length > 0 ? fuelOld : undefined);
      setValue('adBlue', adBlueOld.length > 0 ? adBlueOld : undefined);
    }
  }, [selectedValue]);
};
