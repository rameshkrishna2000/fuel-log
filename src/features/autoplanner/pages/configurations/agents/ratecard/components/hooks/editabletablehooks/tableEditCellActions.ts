import { useEffect } from 'react';

//Edit Table Functionalities
export const useEditTableActions = ({
  updateTour,
  modeIndex,
  setEditingRow,
  modeFields
}: any) => {
  const startEdit = (rowIndex: number) => {
    updateTour(modeIndex, {
      ...modeFields[modeIndex],
      tours: modeFields[modeIndex].tours?.map((tour: any, tourIndex: number) => ({
        ...tour,
        seaters:
          rowIndex !== tourIndex
            ? tour?.seaters?.map((seater: any) => ({
                ...seater,
                baseCost: seater?.currentBaseCost
              }))
            : tour.seaters
      }))
    });
    setEditingRow(rowIndex);
  };

  const cancelEdit = (rowIndex: number) => {
    updateTour(modeIndex, {
      ...modeFields[modeIndex],
      tours: modeFields[modeIndex]?.tours?.map((item: any, tourIndex: number) => ({
        ...item,
        seaters:
          rowIndex === tourIndex
            ? item?.seaters?.map((value: any) => ({
                ...value,
                baseCost: value?.currentBaseCost || 0
              }))
            : item?.seaters
      }))
    });
    setEditingRow(null);
  };

  const saveEdit = (index: any) => {
    updateTour(modeIndex, {
      ...modeFields[modeIndex],
      tours: modeFields[modeIndex]?.tours?.map((item: any, tourIndex: number) => ({
        ...item,
        seaters:
          index === tourIndex
            ? item?.seaters?.map((value: any) => ({
                ...value,
                baseCost: value?.baseCost ? Number(value?.baseCost) : 0,
                currentBaseCost: Number(value?.baseCost || 0) ?? 0
              }))
            : item?.seaters
      }))
    });
    setEditingRow(null);
  };

  const updateSeatersData = (
    cell: any,
    rowIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateTour(modeIndex, {
      ...modeFields[modeIndex],
      tours: modeFields[modeIndex]?.tours?.map((item: any, tourIndex: number) => ({
        ...item,
        seaters:
          rowIndex === tourIndex
            ? item?.seaters?.map((value: any) => ({
                ...value
              }))
            : item?.seaters
      }))
    });
  };

  useEffect(() => {
    setEditingRow(null);
  }, [modeIndex]);

  return { startEdit, cancelEdit, saveEdit, updateSeatersData };
};
