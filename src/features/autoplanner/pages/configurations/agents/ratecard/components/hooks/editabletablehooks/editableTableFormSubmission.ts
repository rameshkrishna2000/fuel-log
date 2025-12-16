import { useState } from 'react';

//Editable Table Form Submission functionalities
export const editableTableFormSubmission = ({
  data,
  updateTour,
  modeIndex,
  modeFields,
  clearErrors,
  control,
  setError
}: any) => {
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [isaddOnIndex, setIsAddOnIndex] = useState<any>({ rowId: null, columnId: null });
  const [addOnChanges, setAddOnChanges] = useState<any>({});

  const handleDialogClose = () => {
    const seaterIndex = data[isaddOnIndex.rowId]?.seaters?.findIndex(
      (s: any) => s.seater.toString() === isaddOnIndex.columnId
    );
    updateTour(modeIndex, {
      ...modeFields[modeIndex],
      tours: modeFields[modeIndex]?.tours?.map((item: any, tourIndex: number) => ({
        ...item,
        seaters:
          isaddOnIndex.rowId === tourIndex
            ? item?.seaters?.map((seater: any, sIndex: number) => ({
                ...seater,
                addOns: sIndex === seaterIndex ? seater.prevaddOns : seater?.addOns
              }))
            : item?.seaters
      }))
    });
    clearErrors(
      `modes.${modeIndex}.tours.${
        isaddOnIndex.rowId
      }.seaters.${seaterIndex}.addOns.${0}.endTime`
    );
    setIsOpenDialog(false);
  };

  const handleAddOnSubmit = () => {
    const seaterIndex = data[isaddOnIndex.rowId]?.seaters?.findIndex(
      (s: any) => s.seater.toString() === isaddOnIndex.columnId
    );

    if (seaterIndex === -1) return;

    const formValues = control._formValues || control._defaultValues;
    const currentAddOns =
      formValues?.modes?.[modeIndex]?.tours?.[isaddOnIndex.rowId]?.seaters?.[seaterIndex]
        ?.addOns || [];

    const processedAddOns = currentAddOns.map((addOn: any) => ({
      ...addOn,
      startTime: addOn.startTime ? addOn.startTime : null,
      endTime: addOn.endTime ? addOn.endTime : null
    }));

    if (
      processedAddOns[0]?.endTime && processedAddOns[0]?.startTime
        ? processedAddOns[0]?.endTime > processedAddOns[0]?.startTime
        : true
    ) {
      updateTour(modeIndex, {
        ...modeFields[modeIndex],
        tours: modeFields[modeIndex]?.tours?.map((item: any, tourIndex: number) => ({
          ...item,
          seaters:
            isaddOnIndex.rowId === tourIndex
              ? item?.seaters?.map((seater: any, sIndex: number) => ({
                  ...seater,
                  addOns: sIndex === seaterIndex ? processedAddOns : seater?.addOns,
                  prevaddOns: sIndex === seaterIndex ? processedAddOns : seater?.addOns
                }))
              : item?.seaters
        }))
      });
      setIsOpenDialog(false);
      setIsAddOnIndex({ rowId: null, columnId: null });
      setAddOnChanges({});
    } else {
      updateTour(modeIndex, {
        ...modeFields[modeIndex],
        tours: modeFields[modeIndex]?.tours?.map((item: any, tourIndex: number) => ({
          ...item,
          seaters:
            isaddOnIndex.rowId === tourIndex
              ? item?.seaters?.map((seater: any, sIndex: number) => ({
                  ...seater,
                  addOns: sIndex === seaterIndex ? processedAddOns : seater?.addOns,
                  prevaddOns: [{ name: '', addCost: 0, startTime: null, endTime: null }]
                }))
              : item?.seaters
        }))
      });
      setError(
        `modes.${modeIndex}.tours.${
          isaddOnIndex.rowId
        }.seaters.${seaterIndex}.addOns.${0}.endTime`,
        { type: 'custom', message: 'Invalid end time' }
      );
    }
  };

  return {
    handleDialogClose,
    handleAddOnSubmit,
    isOpenDialog,
    setIsOpenDialog,
    isaddOnIndex,
    setIsAddOnIndex,
    setAddOnChanges,
    addOnChanges
  };
};
