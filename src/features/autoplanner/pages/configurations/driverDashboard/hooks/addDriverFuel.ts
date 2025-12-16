import { Dialog, DialogProps, styled, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import Resizer from 'react-image-file-resizer';
import dayjs from 'dayjs';
import {
  capitalizeFirstLetter,
  convertDatetoEpoch,
  convertToEpoch2,
  debounce
} from '../../../../../../utils/commonFunctions';
import {
  addDriverFuel,
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

export const useAddDriverStates = () => {
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
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [dateTime, setDateTime] = useState<any>();
  const [validationErrors, setValidationErrorsMake] = useState<any>({
    vehicleNumber: null
  });
  const [validationFields, setValidationFields] = useState<any>({
    vehicleNumber: { status: false }
  });
  const [error, setError] = useState(false);
  return {
    odometerFiles,
    setOdometerFiles,
    fuelFiles,
    setFuelFiles,
    adBlueFiles,
    setAdBlueFiles,
    overallFiles,
    setOverallFiles,
    imageCard,
    setImageCard,
    files,
    setFiles,
    uploadedOdometerFiles,
    setUploadedOdometerFiles,
    uploadedFuelFiles,
    setUploadedFuelFiles,
    uploadedAdBlueFiles,
    setUploadedAdBlueFiles,
    location,
    setLocation,
    dateTime,
    setDateTime,
    validationErrors,
    setValidationErrorsMake,
    validationFields,
    setValidationFields,
    error,
    setError
  };
};

export const useDriverDropdowns = ({
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

export const useHandleUpload = ({
  uploadedOdometerFiles,
  uploadedFuelFiles,
  uploadedAdBlueFiles,
  setUploadedOdometerFiles,
  setUploadedFuelFiles,
  setUploadedAdBlueFiles,
  trigger,
  setValue
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
  uploadedOdometerFiles,
  setUploadedOdometerFiles,
  uploadedFuelFiles,
  setUploadedFuelFiles,
  uploadedAdBlueFiles,
  setUploadedAdBlueFiles,
  setValue,
  trigger
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

export const useHandleImage = ({ setImageCard, setFiles }: any) => {
  const handleImage = (fileUrl: any, fileName: any) => {
    setImageCard(true);
    setFiles([{ url: fileUrl, name: fileName }]);
  };
  return { handleImage };
};

export const useOnSubmit = ({
  location,
  state,
  uploadedOdometerFiles,
  uploadedFuelFiles,
  uploadedAdBlueFiles,
  overallFiles,
  dispatch,
  navigate
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
      gpsLatitude: state?.selectedRow?.gpsLatitude
        ? state?.selectedRow?.gpsLatitude
        : location?.lat,
      gpsLongitude: state?.selectedRow?.gpsLongitude
        ? state?.selectedRow?.gpsLongitude
        : location?.lng,
      notes: data?.notes ? data?.notes : null,
      adblueVolume: data?.adBlueVolume,
      adbluePricePerUnit: data?.adBluePrice
    };

    if (state?.selectedRow) {
      payloads.fuelEntryId = state?.selectedRow?.id;
      payloads.isExternalVehicle = state?.selectedRow?.isExternalVehicle;
    }

    const payload: any = new FormData();
    payload.append(
      state?.selectedRow ? 'updateFuelEntriesRequest' : 'fuelEntriesRequest',
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
    if (state?.selectedRow) {
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
    }

    const driverFuelPayload = {
      payload: payload
    };
    if (state?.selectedRow) {
      const updateAction = await dispatch(updateDriverFuel(driverFuelPayload));
      if (updateDriverFuel.fulfilled.type === updateAction.type) {
        navigate('/driver-fuel');
      }
    } else {
      const addAction = await dispatch(addDriverFuel(driverFuelPayload));
      if (addDriverFuel.fulfilled.type === addAction.type) {
        navigate('/driver-fuel');
      }
    }
  };
  return { onSubmit };
};

export const useHandleClose = ({ navigate }: any) => {
  const handleClose = () => {
    navigate('/driver-fuel');
  };
  return { handleClose };
};

export const useUploadConfig = ({
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

export const useHandleFilter = ({
  dispatch,
  trigger,
  validationErrors,
  setValidationFields,
  setError
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

export const useAddDriverEffects = ({
  vehicleNumberValidation,
  error,
  trigger,
  validationErrors,
  setValidationErrorsMake,
  setLocation,
  dispatch,
  state,
  setValue,
  setDateTime,
  setAdBlueFiles,
  setFuelFiles,
  setOdometerFiles,
  setOverallFiles,
  timezone
}: any) => {
  useEffect(() => {
    setValidationErrorsMake({
      vehicleNumber: vehicleNumberValidation?.error
    });
  }, [vehicleNumberValidation]);

  useEffect(() => {
    return () => {
      dispatch(clearVehicleValidation());
    };
  }, []);

  useEffect(() => {
    if (error) trigger('vehicleNumber');
  }, [validationErrors?.vehicleNumber, error]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLocation({ lat, lng });
    });
    dispatch(getTypeDropdown());
    dispatch(getStationDropdown());
    dispatch(getPaymentDropdown());
  }, []);

  useEffect(() => {
    if (state?.selectedRow) {
      const data = state?.selectedRow;

      setValue('vehicleNumber', data?.vehicleNumber);
      setValue('reading', data?.odometerReading);
      setValue('fuelType', data?.fuelTypeId);
      setValue('volume', data?.fuelVolume);
      setValue('price', data?.fuelPricePerUnit);
      setValue('total', data?.fuelTotalCost);
      setValue('fuelStation', data?.fuelStationId);
      setValue('paymentMethod', data?.paymentMethodId);
      setValue('notes', data?.notes);
      setValue('adBlueVolume', data?.adblueVolume);
      setValue('adBluePrice', data?.adbluePricePerUnit);
      setValue('adBlueTotal', data?.adblueCost);
      const value: any = dayjs.unix(data?.fuelTimeStamp);
      setDateTime(value?.$d);
      setValue('dateTime', dayjs.unix(convertDatetoEpoch(value?.$d) / 1000).toDate());

      const odometerOld = (data?.odometerAttachments || []).map((item: any) => ({
        fileUrl: item.imageUrl,
        fileName: item.fileName,
        type: 'oldOdometer'
      }));

      const fuelOld = (data?.fuelReceiptAttachments || []).map((item: any) => ({
        fileUrl: item.imageUrl,
        fileName: item.fileName,
        type: 'oldFuel'
      }));

      const adBlueOld = (data?.adblueReceiptAttachments || []).map((item: any) => ({
        fileUrl: item.imageUrl,
        fileName: item.fileName,
        type: 'oldAdBlue'
      }));

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
    } else {
      const today = dayjs().tz(timezone);
      const start = today.toDate();
      setDateTime(start);
      setValue('dateTime', start);
    }
  }, [state?.selectedRow]);
};
