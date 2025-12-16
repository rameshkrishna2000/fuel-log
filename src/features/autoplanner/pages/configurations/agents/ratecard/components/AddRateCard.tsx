import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import * as Yup from 'yup';
import { useAppSelector } from '../../../../../../../app/redux/hooks';
import CustomTextField from '../../../../../../../common/components/customized/customtextfield/CustomTextField';
import CustomButton from '../../../../../../../common/components/buttons/CustomButton';
import { EditableTable } from './EditableTable';
import CustomCurrencyField from '../../../../../../../common/components/customcurrency/CustomCurrency';
import { useRateCardFormSubmission } from './hooks/addratecardhooks/rateCardFormSubmission';
import { useReteCardOnChangeFunctions } from './hooks/addratecardhooks/rateCardOnChangeHook';
import { useAddRateCardComponentData } from './componentdata/AddRateCardComponentDatas';

const AddRatecard = ({
  isOpen,
  setIsOpen,
  setIsSelected,
  isSelected,
  selectedCard,
  setSelectedCard,
  clearState
}: any) => {
  const seatersList = useAppSelector(state => state.getSeatersListReducer);
  const toursList = useAppSelector(state => state.getToursListReducer);
  const { isLoading: addIsLading } = useAppSelector(state => state.addRateCardDetails);
  const { isLoading: getTourLoading } = useAppSelector(
    state => state.getToursListReducer
  );
  const { isLoading: updateIsLoading } = useAppSelector(
    state => state.updateRatecardDeatils
  );

  //Constant Variables
  const modes = useMemo(() => ['SIC', 'TSIC', 'PVT', 'GRP'], []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { columns, setEditingRow, editingRow } = useAddRateCardComponentData({
    seatersList,
    isMobile
  });

  const ratecardSchema = Yup.object().shape({
    rateCardName: Yup.string().required('Enter rate card name'),
    currency: Yup.string().required('Enter currency'),
    modes: Yup.array()
      .of(
        Yup.object().shape({
          mode: Yup.string().required(),
          tours: Yup.array()
            .of(
              Yup.object().shape({
                tourName: Yup.string().required(),
                mode: Yup.string().required(),
                isAddOn: Yup.boolean(),
                seaters: Yup.array()
                  .of(
                    Yup.object().shape({
                      seater: Yup.number().required(),
                      baseCost: Yup.number()
                        .required('Enter base cost')
                        .typeError('Enter base cost'),
                      addOns: Yup.array().of(
                        Yup.object().shape({
                          name: Yup.string(),
                          addCost: Yup.number()
                            .typeError('Enter valid cost')
                            .notRequired(),
                          startTime: Yup.date().notRequired(),
                          endTime: Yup.date().notRequired()
                        })
                      )
                    })
                  )
                  .required()
              })
            )
            .required()
        })
      )
      .required()
  });

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    getValues,
    trigger,
    formState: { errors },
    setError
  } = useForm<any>({
    resolver: yupResolver(ratecardSchema as any),
    defaultValues: {
      rateCardName: '',
      currency: '',
      modes: []
    }
  });

  const { fields: modeFields, update: updateTour }: any = useFieldArray({
    control,
    name: 'modes'
  });

  //Form Submission Hook
  const { onSubmit, handleDialogClose } = useRateCardFormSubmission({
    selectedCard,
    reset,
    clearErrors,
    setIsOpen,
    setIsSelected,
    isSelected,
    clearState,
    setSelectedCard
  });

  //To Handle The OnChange functionality of Rate Card Form
  const { currentModeIndex, currentModeData, handleModeChange, modeValue } =
    useReteCardOnChangeFunctions({
      toursList,
      seatersList,
      isSelected,
      modes,
      updateTour,
      selectedCard,
      setValue,
      modeFields
    });


    

  return (
    <Dialog
      open={isOpen}
      maxWidth='xl'
      fullWidth
      hideBackdrop
      sx={{ zIndex: 1 }}
      fullScreen={isMobile}
    >
      <DialogContent
        className='addratecard-container'
        sx={{
          p: isMobile ? 1 : 3,
          overflow: 'auto',
          maxHeight: isMobile ? '100%' : '80vh'
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: isMobile ? 1 : 2
            }}
            tabIndex={0}
            role='button'
          >
            <Typography
              fontWeight={700}
              color={'#26134b'}
              variant={isMobile ? 'h6' : 'h5'}
            >
              {isSelected ? 'Update Rate Card' : 'Add Rate Card'}
            </Typography>

            <Box className='addratecard-close' tabIndex={0} role='button'>
              <Icon
                icon='ic:round-close'
                className='ratecard-close-icon'
                onClick={handleDialogClose}
                fontSize={isMobile ? 24 : 28}
              />
            </Box>
          </Box>

          <Grid container spacing={isMobile ? 1 : 2} mt={0.5}>
            <Grid item md={2.5} sm={6} xs={12}>
              <CustomTextField
                label='Rate Card Name'
                control={control}
                name='rateCardName'
                id='rateCardName'
                placeholder='Rate card name'
              />
            </Grid>
            <Grid item md={2.5} sm={6} xs={12}>
              <CustomCurrencyField
                control={control}
                name='currency'
                placeholder='Currency'
                label='Currency'
                setValue={setValue}
                defaultValue={selectedCard?.currency && selectedCard?.currency}
                value={selectedCard?.currency && selectedCard?.currency}
                trigger={trigger}
              />
            </Grid>

            <Grid
              item
              md={6.8}
              sm={12}
              xs={12}
              display={'flex'}
              justifyContent={isMobile ? 'center' : 'flex-end'}
              alignItems={'center'}
              gap={isMobile ? 1 : 2}
              mt={isMobile ? 1 : 0}
            >
              <CustomButton
                category='Cancel'
                className='cancel'
                onClick={handleDialogClose}
                size={isMobile ? 'small' : 'medium'}
              />
              <CustomButton
                category={isSelected ? 'Update Rate Card' : 'Add Rate Card'}
                className='saveChanges'
                type='submit'
                disabled={editingRow != null}
                size={isMobile ? 'small' : 'medium'}
                loading={updateIsLoading || addIsLading}
              />
            </Grid>
          </Grid>
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={modeValue}
              onChange={handleModeChange}
              textColor='primary'
              indicatorColor='primary'
              aria-label='secondary tabs example'
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              allowScrollButtonsMobile
            >
              {modes?.map((item: string, index: number) => (
                <Tab
                  key={item}
                  value={item}
                  label={item}
                  sx={{
                    minWidth: isMobile ? 'auto' : undefined,
                    fontSize: isMobile ? '0.75rem' : undefined
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Box
            sx={{
              paddingTop: isMobile ? '15px' : '30px',
              overflow: 'auto',
              height: isMobile ? 'calc(100vh - 220px)' : '350px',
              '& .MuiTableCell-root': {
                padding: isMobile ? '8px 4px' : '16px'
              }
            }}
          >
            <EditableTable
              columns={columns}
              control={control}
              modeIndex={currentModeIndex}
              modeFields={modeFields}
              data={currentModeData}
              updateTour={updateTour}
              setEditingRow={setEditingRow}
              editingRow={editingRow}
              setValue={setValue}
              getValues={getValues}
              trigger={trigger}
              loading={getTourLoading}
              setError={setError}
              clearErrors={clearErrors}
              isMobile={isMobile}
            />
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRatecard;
