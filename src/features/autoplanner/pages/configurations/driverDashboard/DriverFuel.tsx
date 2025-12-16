import {
  Box,
  CircularProgress,
  DialogContent,
  Grid,
  Typography,
  useMediaQuery
} from '@mui/material';
import './DriverFuel.scss';
import CustomButton from '../../../../../common/components/buttons/CustomButton';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import CustomIconButton from '../../../../../common/components/buttons/CustomIconButton';
import CustomCarousel from '../../../../../common/components/carousel/CustomCarousel';
import CustomTextField from '../../../../../common/components/customized/customtextfield/CustomTextField';
import { useForm } from 'react-hook-form';
import InfiniteScroll from '../../../../../common/components/infinitescroll/InfiniteScroll';
import FuelCard from './components/FuelCard';
import {
  useDriverFuelEffects,
  useDriverFuelStates,
  useHandleAddFuel,
  useHandleImage,
  useHandleSearch,
  useHandleUpdate,
  useMemoDialog
} from './hooks/driverFuel';

const DriverFuel = ({ onScroll, setApi, clearState }: any) => {
  const { data, count, isLoading } = useAppSelector(state => state.getAllDriverFuel);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isXs = useMediaQuery('(max-width:600px)');
  const { control } = useForm();
  const {
    imageCard,
    setImageCard,
    files,
    setFiles,
    isScroll,
    setIsScroll,
    searchValue,
    setSearchValue,
    inputRef
  } = useDriverFuelStates();
  const { MemoizedDialog } = useMemoDialog({ files });
  const { handleAddFuel } = useHandleAddFuel({ navigate });
  const { handleImage } = useHandleImage({ setImageCard, setFiles });
  const { handleUpdate } = useHandleUpdate({ navigate });
  const { handleSearchChange } = useHandleSearch({
    setIsScroll,
    clearState,
    dispatch,
    setSearchValue
  });
  useDriverFuelEffects({ dispatch, setIsScroll, setApi, data, count, searchValue });

  return (
    <Box className='fuel-container'>
      <Box className={'fuel-header'}>
        <Typography className='fuel-title'>Fuel Logger - {count}</Typography>
        <Box className={isXs ? 'fuel-search-xs' : 'fuel-search'}>
          <Box className={isXs ? 'fuel-search-field-xs' : 'fuel-search-field'}>
            <CustomTextField
              control={control}
              name='search'
              placeholder='Search...'
              id='search'
              variant={'standard'}
              value={searchValue}
              icon={<SearchOutlinedIcon color='primary' />}
              onChangeCallback={e => {
                handleSearchChange(e);
              }}
            />
          </Box>
          <CustomButton
            className='saveChanges'
            category='Add Fuel Log'
            onClick={handleAddFuel}
          />
        </Box>
      </Box>
      <Grid
        container
        spacing={2}
        className={isXs ? 'fuel-entire-xs' : 'fuel-entire'}
        onScroll={() => {
          setIsScroll(true);
          const { scrollTop, scrollHeight, clientHeight } = inputRef.current;
          const data = { scrollTop, scrollHeight, clientHeight };
          onScroll(data);
        }}
        sx={{ height: '70vh', overflow: 'scroll', scrollbarWidth: 'none' }}
        ref={inputRef}
      >
        {isLoading ? (
          <Grid item xs={12}>
            <Box className='loading-container'>
              <CircularProgress size={40} className='loading-spinner' />
              <Typography variant='h6' color='textSecondary' className='loading-text'>
                Loading...
              </Typography>
            </Box>
          </Grid>
        ) : data && data.length > 0 ? (
          data?.map((item: any, index: number) => (
            <FuelCard
              key={index}
              item={item}
              handleImage={handleImage}
              handleUpdate={handleUpdate}
            />
          ))
        ) : (
          <Grid item xs={12}>
            <Box className='no-data-container'>
              <Icon icon='mdi:database-off-outline' className='no-data-icon' />
              <Typography variant='h6' color='textSecondary'>
                No Data Found
              </Typography>
              <Typography variant='body2' color='textSecondary' className='no-data-text'>
                There are no fuel records available at the moment.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      {imageCard && files?.length > 0 && (
        <MemoizedDialog
          open={true}
          fullWidth
          fullScreen
          maxWidth='md'
          className='dialog'
          onClose={() => setImageCard(false)}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none'
            }
          }}
        >
          <DialogContent
            className='dialogContent'
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box className='closeIcon icon-position d-flex'>
              <CustomIconButton
                category='CloseValue'
                onClick={() => {
                  setImageCard(false);
                }}
              />
            </Box>
            <CustomCarousel image={files} />
          </DialogContent>
        </MemoizedDialog>
      )}
    </Box>
  );
};

export default InfiniteScroll(DriverFuel);
