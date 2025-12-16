//ratecard.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItem,
  Avatar,
  Tooltip,
  Divider,
  CardContent,
  Skeleton
} from '@mui/material';
import './RateCard.scss';
import { Icon, Icon as IconifyIcon } from '@iconify/react';
import { animated, useSpring } from '@react-spring/web';
import {
  LocationOnOutlined,
  Close,
  DirectionsCar,
  ExpandMore,
  Wifi,
  AcUnit,
  Luggage,
  Edit,
  Delete,
  MoreVert
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../../../app/redux/hooks';
import {
  clearRateCard,
  deleteRateCardDetails,
  getRatecardDetails,
  setChildComponent
} from '../../../../redux/reducer/autoPlannerSlices/rateCardSlice';
import constant from '../../../../../../utils/constants';
import CustomDeletePopup from '../../../../../../common/components/customdelete/CustomDeletePopup';
import AddRatecard from './components/AddRateCard';
import InfiniteScroll from '../../../../../../common/components/infinitescroll/InfiniteScroll';
import dayjs from 'dayjs';

import { capitalizeFirstLetter } from '../../../../../../utils/commonFunctions';
// import { useRateCardStates } from './hooks/rateCardStateHooks';
import {
  useCardDialogActions,
  useCommonStates,
  useRateCardActions,
  useRateCardEffects,
  useRateCardInitEffects,
  useRateCardMenuController
} from './hooks/rateCardHooks';

interface RateCardOnResponse {
  rateCardOnId: string;
  rateCardOnName: string;
  addCost: number;
  startTime: number;
  endTime: number;
}

interface SeaterResponse {
  seaterId: string;
  seater: string;
  baseCost: number;
  rateCardOnResponses?: RateCardOnResponse[];
}

interface TourResponse {
  tourId: string;
  tourName: string;
  mode?: string;
  seaterResponses?: SeaterResponse[];
}
interface RateCardItem {
  rateCardId: string;
  rateCardName: string;
  currency: string;
  tourResponses?: TourResponse[];
}

const RateCard = ({ onScroll, setApi, clearState }: any) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<any>();

  const {
    data: rateCardDetails,
    count: rateCardDeatilsCount,
    isLoading: rateCardDetailsIsLoading
  } = useAppSelector(state => state.getRateCardDetailsReducer);
  const { isLoading: deleteloading } = useAppSelector(state => state.deleteRateCard);

  const urls = {
    setChildComponent,
    clearRateCard,
    getRatecardDetails,
    deleteRateCardDetails
  };

  const { message, setMessage } = useCommonStates();

  const { handleFilterChange, handleInfinitePagination, isScroll, setIsScroll } =
    useRateCardActions({
      dispatch,
      urls,
      clearState
    });

  const {
    handleMenuClose,
    handleUpdateRateCard,
    handleDelete,
    addRatecard,
    isSelected,
    setIsSelected,
    isOpen,
    setIsOpen,
    selectedCard,
    setSelectedCard,
    anchorEl,
    setAnchorEl,
    deletePopup,
    setIsDeletePopup
  } = useRateCardMenuController({
    dispatch,
    urls,
    clearState
  });

  const {
    handleCardClick,
    handleCloseDialog,
    toggleTourExpansion,
    dialogOpen,
    setDialogOpen,
    expandedTours,
    setExpandedTours
  } = useCardDialogActions({
    setSelectedCard
  });

  //useEffect hooks

  useRateCardEffects({
    rateCardDetails,
    setApi,
    handleInfinitePagination,
    rateCardDeatilsCount,
    dispatch,
    urls,
    handleFilterChange,
    addRatecard
  });

  useRateCardInitEffects({ dispatch, urls, handleFilterChange, addRatecard });

  return (
    <>
      {rateCardDetailsIsLoading && !isScroll ? (
        <Grid container spacing={1} marginTop={2}>
          {Array.from({ length: 12 })?.map((value: any, index: number) => (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 10px 0px 10px'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton
                        variant='circular'
                        width={40}
                        height={40}
                        sx={{ marginRight: '10px' }}
                      />
                      <Box>
                        <Skeleton width={120} height={28} sx={{ padding: '2px' }} />
                      </Box>
                    </Box>
                    <Skeleton variant='circular' width={24} height={24} />
                  </Box>
                </Box>

                <CardContent>
                  <Skeleton
                    width={200}
                    height={50}
                    sx={{ padding: '2px', borderRadius: '5px' }}
                  />
                  <Skeleton
                    width={200}
                    height={50}
                    sx={{ padding: '2px', borderRadius: '5px' }}
                  />

                  <Box sx={{ textAlign: 'end', mt: 2 }}>
                    <Skeleton
                      variant='rounded'
                      width={100}
                      height={20}
                      sx={{ borderRadius: '1rem', ml: 'auto' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {rateCardDetails?.length > 0 ? (
            <Box
              onScroll={() => {
                setIsScroll(true);
                const { scrollTop, scrollHeight, clientHeight } = inputRef.current;
                const data = { scrollTop, scrollHeight, clientHeight };
                onScroll(data);
              }}
              ref={inputRef}
              sx={{ height: '63vh', overflow: 'scroll' }}
            >
              <Grid container spacing={1.5} mb={1.5} p={2}>
                {rateCardDetails?.map((rateCard: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                      className='ratecard'
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Box className='ratecard-header'>
                        <Box
                          className='ratecard-title'
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar className='ratecard-avatar' sx={{ mr: 2 }}>
                              {rateCard.rateCardName?.charAt(0)?.toUpperCase() || ' '}
                            </Avatar>
                            <Box className='ratecard-title-text'>
                              <Tooltip
                                title={`${rateCard.rateCardName}`}
                                arrow
                                placement='top-start'
                              >
                                <Typography
                                  className='ratecard-title'
                                  variant='h6'
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {capitalizeFirstLetter(rateCard.rateCardName)}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </Box>

                          <IconButton
                            size='small'
                            onClick={event => {
                              event.stopPropagation();
                              setAnchorEl(event.currentTarget);
                              setSelectedCard(rateCard);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </Box>

                      <CardContent className='ratecard-content-container'>
                        <Box className='ratecard-contents'>
                          {/* <AttachMoneyIcon sx={{ color: '#767aeb', mr: 1 }} /> */}
                          <Icon
                            icon='fluent-mdl2:money'
                            style={{ color: '#767aeb', marginRight: '8px' }}
                            width='24'
                            height='24'
                          />
                          <Typography noWrap className='content-overflow' variant='body1'>
                            {rateCard?.currency || 'N/A'}
                          </Typography>
                        </Box>

                        <Box className='ratecard-contents'>
                          <LocationOnOutlined sx={{ color: '#767aeb', mr: 1 }} />
                          <Typography noWrap className='content-overflow' variant='body1'>
                            Applicable{' '}
                            {rateCard?.tourResponses?.length === 1 ? 'Tour ' : 'Tours '} -
                            {rateCard?.tourResponses?.length || 0}{' '}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            bgcolor: 'rgb(255 255 255 / 95%)',
                            px: 2,
                            py: 1,
                            textAlign: 'end',
                            padding: '10px'
                          }}
                          onClick={() => handleCardClick(rateCard)}
                          tabIndex={0}
                          role='button'
                          onKeyDown={(event: any) => {
                            if (event.key === 'Enter') {
                              handleCardClick(rateCard);
                            }
                          }}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            View Details →
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem
                  className='menu-dialog'
                  onClick={handleUpdateRateCard}
                  key='update'
                >
                  <Edit sx={{ mr: 1 }} />
                  {constant.Update}
                </MenuItem>
                <MenuItem
                  className='menu-dialog'
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuClose();
                    setIsDeletePopup(true);
                    setMessage('Are you sure you want to delete this rate card?');
                  }}
                >
                  <Delete sx={{ mr: 1, color: '#FF4343' }} />
                  {constant.Delete}
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            !isScroll && (
              <Grid
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                width={'100%'}
                height={'50vh'}
                overflow={'hidden'}
              >
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    fontFamily: '"Lato", sans-serif',
                    fontWeight: 600,
                    color: '#a3a3a3',
                    textAlign: 'center'
                  }}
                >
                  {' '}
                  {constant.NoDataFound}
                </Typography>
              </Grid>
            )
          )}
        </>
      )}

      {rateCardDetailsIsLoading && isScroll && (
        <Box className='loading-vehicle'>Loading.....</Box>
      )}

      {dialogOpen && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth='sm'
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: ' 4px 12px'
            }}
          >
            <Box>
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  padding: ' 4px 12px'
                }}
              >
                {selectedCard?.rateCardName || 'Rate Card Details'}
              </Typography>
              {/* <Typography variant='body2' sx={{ opacity: 0.9 }}>
              Currency: {selectedCard?.currency || 'N/A'} •{' '}
              {selectedCard?.tourResponses?.length || 0} Tours
            </Typography> */}
            </Box>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {selectedCard?.tourResponses?.map((tour: TourResponse) => (
              <Box key={tour.tourId} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #f8f9ff 0%, #e3e7ff 100%)',
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #e3e7ff 0%, #d1d9ff 100%)'
                    }
                  }}
                  tabIndex={0}
                  role='button'
                  onClick={() => toggleTourExpansion(tour.tourId)}
                  onKeyDown={(event: any) => {
                    if (event.key === 'Enter') {
                      toggleTourExpansion(tour.tourId);
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      <LocationOnOutlined fontSize='small' />
                    </Box>
                    <Box>
                      <Typography
                        component='h6'
                        sx={{
                          fontWeight: 'bold',
                          color: '#333',
                          textTransform: 'capitalize'
                        }}
                      >
                        {tour.tourName || ' '}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={tour.mode?.toUpperCase() || ' '}
                          size='small'
                          sx={{
                            bgcolor: '#667eea',
                            color: 'white',
                            fontSize: '12px',
                            height: 22
                          }}
                        />
                        <Chip
                          label={`${tour.seaterResponses?.length || 0} Coach Available`}
                          size='small'
                          variant='outlined'
                          sx={{ fontSize: '12px', height: 22 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <ExpandMore
                    sx={{
                      transform: expandedTours[tour.tourId]
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </Box>

                {/* Tour Details */}
                {expandedTours[tour.tourId] && (
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {tour.seaterResponses?.map((seater: SeaterResponse) => (
                        <Grid item xs={12} md={12} key={seater.seaterId}>
                          <Card
                            sx={{
                              border: '1px solid #e3e7ff',
                              borderRadius: '12px',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#667eea',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                              }
                            }}
                          >
                            <Box sx={{ p: 2 }}>
                              {/* Seater Info */}
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box
                                  sx={{
                                    bgcolor: '#667eea',
                                    color: 'white',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {seater.seater}
                                </Box>
                                <Box>
                                  <Typography
                                    variant='subtitle1'
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {seater.seater}-Seater Vehicle
                                  </Typography>
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold', color: '#667eea' }}
                                  >
                                    {selectedCard?.currency || 'N/A'}{' '}
                                    {seater.baseCost || '0'}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Divider */}
                              <Box sx={{ height: '1px', bgcolor: '#e5e5e5', my: 2 }} />

                              {/* Add-ons */}
                              <Typography
                                variant='subtitle1'
                                sx={{ fontWeight: 'bold', mb: 1 }}
                              >
                                Add-on Services ({seater.rateCardOnResponses?.length || 0}
                                )
                              </Typography>

                              {seater.rateCardOnResponses &&
                              seater.rateCardOnResponses.length > 0 ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5
                                  }}
                                >
                                  {seater.rateCardOnResponses.map(
                                    (addon: RateCardOnResponse) => (
                                      <Box
                                        key={addon.rateCardOnId}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          p: 1.5,
                                          bgcolor: '#f8f9ff',
                                          borderRadius: '8px',
                                          border: '1px solid #e3e7ff'
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            bgcolor: '#764ba2',
                                            color: 'white',
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2
                                          }}
                                        >
                                          <DirectionsCar sx={{ fontSize: '16px' }} />
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                          <Typography
                                            variant='body2'
                                            sx={{
                                              fontWeight: '600',
                                              textTransform: 'capitalize'
                                            }}
                                          >
                                            {addon.rateCardOnName || ''}
                                          </Typography>
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 2,
                                              mt: 0.3
                                            }}
                                          >
                                            <Typography
                                              variant='body2'
                                              sx={{
                                                fontWeight: 'bold',
                                                color: '#667eea'
                                              }}
                                            >
                                              {selectedCard?.currency || 'USD'}{' '}
                                              {addon.addCost || '0'}
                                            </Typography>
                                            <Typography
                                              variant='body2'
                                              color='text.secondary'
                                            >
                                              {addon.startTime &&
                                                dayjs(addon.startTime * 1000).format(
                                                  'hh:mm A'
                                                )}{' '}
                                              -{' '}
                                              {addon.endTime &&
                                                dayjs(addon.endTime * 1000).format(
                                                  'hh:mm A'
                                                )}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Box>
                                    )
                                  )}
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: '#f5f5f5',
                                    borderRadius: '8px',
                                    border: '1px dashed #ddd'
                                  }}
                                >
                                  <Typography variant='body2' color='text.secondary'>
                                    No add-on services available
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            ))}
          </DialogContent>
        </Dialog>
      )}

      {/* Add Rate Card Modal */}
      {isOpen && (
        <AddRatecard
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setIsSelected={setIsSelected}
          isSelected={isSelected}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          clearState={clearState}
        />
      )}

      {deletePopup && (
        <CustomDeletePopup
          open={deletePopup}
          setOpen={setIsDeletePopup}
          handleClose={() => setIsDeletePopup(false)}
          message={message}
          handleDelete={handleDelete}
          isLoading={deleteloading}
        />
      )}
    </>
  );
};

export default InfiniteScroll(RateCard);
