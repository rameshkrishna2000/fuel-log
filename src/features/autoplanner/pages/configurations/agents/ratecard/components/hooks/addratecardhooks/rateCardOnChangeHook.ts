import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '../../../../../../../../../app/redux/hooks';
import {
  clearTourList,
  getTourNames,
  getVehicleSeaters
} from '../../../../../../../redux/reducer/autoPlannerSlices/rateCardSlice';

//On-Change Functionalities in Add Rate Card Form
export const useReteCardOnChangeFunctions = ({
  toursList,
  seatersList,
  isSelected,
  modes,
  updateTour,
  selectedCard,
  setValue,
  modeFields
}: any) => {
  const dispatch = useAppDispatch();

  const [isFirstCall, setIsFirstCall] = useState(true);
  const [modeValue, setModeValue] = useState('SIC');

  const handleModeChange = async (event: React.SyntheticEvent, newValue: string) => {
    const currentIndex = modes.indexOf(newValue);

    const isApiCall = modeFields[currentIndex]?.isApiCall;
    setModeValue(newValue);
    if (!isApiCall) {
      let data: any = await dispatch(getTourNames(newValue));
      data =
        newValue === 'PVT'
          ? [
              'AIRPORT ARRIVAL',
              'AIRPORT DEPARTURE',
              'MIDNIGHT TRANSFER',
              ...data?.payload?.data
            ]
          : data?.payload?.data;

      if (!isSelected) {
        updateTour(currentIndex, {
          mode: newValue,
          isApiCall: true,
          tours: data?.map((tour: any) => ({
            tourName: tour,
            mode: newValue,
            isAddOn: true,
            seaters: seatersList?.data
              ?.map((seater: any) => {
                return {
                  seater: seater,
                  baseCost: 0,
                  currentBaseCost: 0,
                  addOns: [
                    {
                      name: '',
                      addCost: 0,
                      startTime: null,
                      endTime: null
                    }
                  ],
                  prevaddOns: [
                    {
                      name: '',
                      addCost: 0,
                      startTime: null,
                      endTime: null
                    }
                  ]
                };
              })
              .sort((a: any, b: any) => a.seater - b.seater)
          }))
        });
      }

      if (isSelected) {
        updateTour(currentIndex, {
          mode: newValue,
          isApiCall: true,
          tours: data?.map((tour: any) => {
            const matchedTour = selectedCard?.tourResponses?.find(
              (t: any) =>
                t.tourName.toLowerCase() == tour.toLowerCase() &&
                t.mode.toLowerCase() == newValue.toLowerCase()
            );

            return {
              tourId: matchedTour ? matchedTour?.tourId : null,
              tourName: tour,
              mode: newValue,
              isAddOn: true,
              seaters: seatersList?.data
                ?.map((seater: any) => {
                  const matchedSeater = matchedTour?.seaterResponses?.find(
                    (s: any) => s.seater == seater
                  );
                  return {
                    seaterId: matchedSeater ? matchedSeater?.seaterId : null,
                    seater,
                    baseCost: matchedSeater ? matchedSeater.baseCost : 0,
                    currentBaseCost: matchedSeater ? matchedSeater.baseCost : 0,
                    prevaddOns:
                      matchedSeater?.rateCardOnResponses?.length > 0
                        ? matchedSeater.rateCardOnResponses.map((addon: any) => ({
                            addOnId: addon?.rateCardOnId,
                            name: addon.rateCardOnName || '',
                            addCost: addon.addCost || 0,
                            startTime: addon.startTime
                              ? new Date(addon.startTime * 1000)
                              : null,
                            endTime: addon.endTime ? new Date(addon.endTime * 1000) : null
                          }))
                        : [
                            {
                              name: '',
                              addCost: 0,
                              startTime: 0,
                              endTime: 0
                            }
                          ],
                    addOns:
                      matchedSeater?.rateCardOnResponses.length > 0
                        ? matchedSeater.rateCardOnResponses.map((addon: any) => ({
                            addOnId: addon?.rateCardOnId,
                            name: addon.name ?? '',
                            addCost: addon.addCost ?? 0,
                            startTime: addon.startTime
                              ? new Date(addon.startTime * 1000)
                              : null,
                            endTime: addon.endTime ? new Date(addon.endTime * 1000) : null
                          }))
                        : [
                            {
                              name: '',
                              addCost: 0,
                              startTime: null,
                              endTime: null
                            }
                          ]
                  };
                })
                .sort((a: any, b: any) => a.seater - b.seater)
            };
          })
        });
      }
    }
    modeFields?.forEach((modes: any, modeIndex: number) => {
      if (modes?.mode !== newValue) {
        updateTour(modeIndex, {
          ...modeFields[modeIndex],
          tours: modeFields[modeIndex]?.tours?.map((tour: any) => ({
            ...tour,
            seaters: tour?.seaters?.map((seater: any) => ({
              ...seater,
              baseCost: seater?.currentBaseCost
            }))
          }))
        });
      }
    });
  };

  const currentModeData = useMemo(() => {
    const modeIndex = modes.indexOf(modeValue);
    return modeFields[modeIndex]?.tours ?? [];
  }, [modeFields, modes, modeValue]);

  const currentModeIndex = useMemo(() => modes.indexOf(modeValue), [modes, modeValue]);

  useEffect(() => {
    dispatch(getTourNames('SIC'));
    dispatch(getVehicleSeaters());

    return () => {
      dispatch(clearTourList());
    };
  }, []);

  useEffect(() => {
    if (
      !toursList?.data?.length ||
      !seatersList?.data?.length ||
      !isFirstCall ||
      isSelected
    )
      return;

    modes.forEach((mode: any, modeIndex: any) => {
      if (mode === 'SIC') {
        updateTour(0, {
          mode,
          isApiCall: true,
          tours: toursList?.data?.map((tour: any) => ({
            tourName: tour,
            mode,
            isAddOn: true,
            seaters: seatersList?.data
              ?.map((seater: any) => {
                return {
                  seater: Number(seater),
                  baseCost: 0,
                  currentBaseCost: 0,
                  addOns: [
                    {
                      name: '',
                      addCost: 0,
                      startTime: null,
                      endTime: null
                    }
                  ],
                  prevaddOns: [
                    {
                      name: '',
                      addCost: 0,
                      startTime: null,
                      endTime: null
                    }
                  ]
                };
              })
              ?.sort((a: any, b: any) => a.seater - b.seater)
          }))
        });
      } else {
        updateTour(modeIndex, {
          mode,
          isApiCall: false,
          tours: []
        });
      }
    });

    setIsFirstCall(false);
  }, [toursList, seatersList, !isSelected, isFirstCall]);

  //update useEffect
  useEffect(() => {
    if (
      !toursList?.data?.length ||
      !seatersList?.data?.length ||
      !isFirstCall ||
      !isSelected
    )
      return;

    modes.forEach((mode: any, modeIndex: any) => {
      if (mode === 'SIC') {
        updateTour(modeIndex, {
          mode,
          isApiCall: true,
          tours: toursList?.data?.map((tour: any) => {
            const matchedTour = selectedCard?.tourResponses?.find(
              (t: any) =>
                t.tourName.toLowerCase() == tour.toLowerCase() &&
                t.mode.toLowerCase() == mode.toLowerCase()
            );
            return {
              tourId: matchedTour ? matchedTour?.tourId : null,
              tourName: tour,
              mode,
              isAddOn: true,
              seaters: seatersList?.data
                ?.map((seater: any) => {
                  const matchedSeater = matchedTour?.seaterResponses?.find(
                    (s: any) => s.seater == seater
                  );

                  return {
                    seaterId: matchedSeater ? matchedSeater?.seaterId : null,
                    seater,
                    baseCost: matchedSeater ? matchedSeater.baseCost : 0,
                    currentBaseCost: matchedSeater ? matchedSeater.baseCost : 0,
                    prevaddOns:
                      matchedSeater?.rateCardOnResponses?.length > 0
                        ? matchedSeater.rateCardOnResponses.map((addon: any) => ({
                            addOnId: addon?.rateCardOnId,
                            name: addon.rateCardOnName || '',
                            addCost: addon.addCost || 0,
                            startTime: addon.startTime
                              ? new Date(addon.startTime * 1000)
                              : null,
                            endTime: addon.endTime ? new Date(addon.endTime * 1000) : null
                          }))
                        : [
                            {
                              name: '',
                              addCost: 0,
                              startTime: 0,
                              endTime: 0
                            }
                          ],
                    addOns:
                      matchedSeater?.rateCardOnResponses?.length > 0
                        ? matchedSeater.rateCardOnResponses.map((addon: any) => ({
                            addOnId: addon?.rateCardOnId,
                            name: addon.rateCardOnName || '',
                            addCost: addon.addCost || 0,
                            startTime: addon.startTime
                              ? new Date(addon.startTime * 1000)
                              : null,
                            endTime: addon.endTime ? new Date(addon.endTime * 1000) : null
                          }))
                        : [
                            {
                              name: '',
                              addCost: 0,
                              startTime: 0,
                              endTime: 0
                            }
                          ]
                  };
                })
                ?.sort((a: any, b: any) => a.seater - b.seater)
            };
          })
        });
      } else {
        updateTour(modeIndex, {
          mode: mode,
          isApiCall: false,
          tours: selectedCard?.tourResponses
            ?.map((item: any) => item.mode)
            ?.includes(mode)
            ? selectedCard?.tourResponses
                .filter((modes: any) => modes.mode === mode)
                .map((item: any) => {
                  return {
                    tourId: item.tourId || null,
                    tourName: item.tourName,
                    mode: item.mode,
                    isAddOn: true,
                    seaters: item.seaterResponses
                      .map((item1: any) => ({
                        seaterId: item1.seaterId || null,
                        seater: item1.seater,
                        baseCost: item1.baseCost || 0,
                        currentBaseCost: item1.baseCost || 0,
                        prevaddOns:
                          item1?.rateCardOnResponses?.length > 0
                            ? item1.rateCardOnResponses.map((addon: any) => ({
                                addOnId: addon?.rateCardOnId,
                                name: addon.rateCardOnName || '',
                                addCost: addon.addCost || 0,
                                startTime: addon.startTime
                                  ? new Date(addon.startTime * 1000)
                                  : null,
                                endTime: addon.endTime
                                  ? new Date(addon.endTime * 1000)
                                  : null
                              }))
                            : [
                                {
                                  name: '',
                                  addCost: 0,
                                  startTime: 0,
                                  endTime: 0
                                }
                              ],
                        addOns:
                          item1?.rateCardOnResponses?.length > 0
                            ? item1.rateCardOnResponses.map((addon: any) => ({
                                addOnId: addon?.rateCardOnId || '',
                                name: addon.rateCardOnName || '',
                                addCost: addon.addCost || 0,
                                startTime: addon.startTime
                                  ? new Date(addon.startTime * 1000 || 0)
                                  : 0,
                                endTime: addon.endTime
                                  ? new Date(addon.endTime * 1000 || 0)
                                  : 0
                              }))
                            : [
                                {
                                  name: '',
                                  addCost: 0,
                                  startTime: 0,
                                  endTime: 0
                                }
                              ]
                      }))
                      ?.sort((a: any, b: any) => a.seater - b.seater)
                  };
                })
            : []
        });
      }
    });

    setValue('rateCardId', selectedCard?.rateCardId);
    setValue('rateCardName', selectedCard?.rateCardName);
    setValue('currency', selectedCard?.currency);
    setIsFirstCall(false);
  }, [toursList, seatersList, isSelected, isFirstCall]);

  return {
    currentModeIndex,
    currentModeData,
    handleModeChange,
    isFirstCall,
    setIsFirstCall,
    modeValue,
    setModeValue
  };
};
