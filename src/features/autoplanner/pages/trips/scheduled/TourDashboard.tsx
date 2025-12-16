import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Chip,
  Tooltip,
  Typography
} from '@mui/material';
import './TourDashboard.scss';
import {
  ExpandMore,
  Business,
  Check,
  Cancel,
  Call,
  AccessTime,
  PeopleAlt,
  DirectionsTransit,
  PendingActions,
  SkipNext
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { capitalizeFirstLetter } from '../../../../../utils/commonFunctions';

const TourDashboard = ({ selectedTour }: any) => {
  const {
    tourName,
    mode,
    hotels,
    guests,
    status,
    totalAbsentees,
    totalGuests,
    totalPresent,
    yetToOnboard,
    skipped
  } = selectedTour;

  const SpanDot = () => {
    return (
      <Box
        sx={{
          height: 4,
          width: 4,
          backgroundColor: 'grey',
          borderRadius: '2px'
        }}
      ></Box>
    );
  };

  const tripStartTime = (time: string) => {
    const times = time.split(':')?.map(Number);
    let [hours, minutes] = times;

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes.toString().padStart(2, '0')} ${period} `;
  };

  const [expanded, setExpanded] = useState(true);

  const tourDetails = ['SIC', 'TSIC']?.includes(mode);

  return (
    <Box mt={2} mb={2}>
      <Box className='tourdetails-headercontainer'>
        <Typography className='tourname-header'>{`${tourName?.replace(
          '->',
          '-'
        )} (${capitalizeFirstLetter(mode)})`}</Typography>

        <Box className='tour-overallcounts'>
          <Chip
            label={`${[null, 'Upcoming']?.includes(status) ? 'Upcoming' : status}`}
            sx={{
              fontWeight: 'bold',
              color: [null, 'Upcoming']?.includes(status)
                ? '#ff0004'
                : status === 'Completed'
                ? '#00b25c'
                : '#fbcf1c',
              borderColor: [null, 'Upcoming']?.includes(status)
                ? '#ff0004'
                : status === 'Completed'
                ? '#00b25c'
                : '#fbcf1c'
            }}
            variant='outlined'
          />

          {['SIC', 'TSIC']?.includes(mode) && (
            <>
              <Chip
                label={`Yet to board - ${yetToOnboard} `}
                variant='outlined'
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                label={`Onboarded - ${totalPresent} `}
                variant='outlined'
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                label={`No show - ${totalAbsentees}`}
                sx={{ fontWeight: 'bold' }}
                variant='outlined'
              />
              <Chip
                label={`Skipped - ${skipped} `}
                variant='outlined'
                sx={{ fontWeight: 'bold' }}
              />
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ height: '73vh', overflow: 'scroll', scrollbarWidth: 'none' }}>
        {tourDetails &&
          hotels?.map(({ name, totalHotelGuests, totalBookings, guests }: any) => (
            <Accordion
              sx={{ boxShadow: 'none' }}
              className='touraccordion-container'
              key={name}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: '#fff' }} />}
                aria-controls='panel1-content'
                id='panel1-header'
                className='touraccordion-summary'
              >
                <Box className='touraccordion-summarydetails'>
                  <Box className='touraccordion-hotels'>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        width: 32,
                        height: 32
                      }}
                    >
                      {<Business />}
                    </Avatar>
                    <Typography component='span' className='touraccordion-header'>
                      {name}
                    </Typography>
                    <Typography
                      className='touraccordion-header'
                      sx={{ display: 'flex', marginLeft: '10px' }}
                    >
                      (Start Time : {tripStartTime(guests[0]?.tripStartTime)})
                    </Typography>
                  </Box>

                  <Box className='touraccordion-guests'>
                    <Box className='touraccordion-counts'>
                      <Box className='touraccordion-bookingscount'>
                        <Typography className='touraccordion-bgcount'>
                          {totalBookings}
                        </Typography>
                        <Typography className='touraccordion-bgheader'>
                          Bookings
                        </Typography>
                      </Box>
                      <Box className='touraccordion-guestscount'>
                        <Typography className='touraccordion-bgcount'>
                          {totalHotelGuests}
                        </Typography>
                        <Typography className='touraccordion-bgheader'>Guests</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails className='touraccordion-details'>
                {guests?.map((item: any) =>
                  item.transferInstance ? (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls='panel1-content'
                        id='panel1-header'
                        sx={{
                          backgroundColor: '#f2f5f5',
                          border: 'none',
                          minHeight: '50px'
                        }}
                      >
                        <Box key={item} className='tourguest-details'>
                          <Box className='tourguest-container'>
                            <Tooltip
                              title={
                                item?.arrived === 'Arrived'
                                  ? 'Onboarded'
                                  : item?.arrived === 'Skipped'
                                  ? 'Skipped'
                                  : item?.arrived === null
                                  ? 'Yet to board'
                                  : 'No show'
                              }
                            >
                              <Avatar
                                sx={{
                                  bgcolor:
                                    item?.arrived === 'Arrived'
                                      ? '#4caf50'
                                      : item?.arrived === 'Skipped'
                                      ? '#fbcf1c'
                                      : item?.arrived === null
                                      ? '#ffa500'
                                      : '#f44336',
                                  color: 'white',
                                  width: 32,
                                  height: 32
                                }}
                              >
                                {item?.arrived === 'Arrived' ? (
                                  <Check />
                                ) : item?.arrived === 'Skipped' ? (
                                  <SkipNext />
                                ) : item?.arrived === null ? (
                                  <PendingActions />
                                ) : (
                                  <Cancel />
                                )}
                              </Avatar>
                            </Tooltip>
                            <Box>
                              <Typography className='tourdetails-guestname'>
                                {item?.name}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              gap: '10px'
                            }}
                          >
                            <Box className='guestdetails-overview'>
                              <Chip
                                size='small'
                                label={`Total - ${item?.adults + item?.children}   `}
                              />
                              <Chip size='small' label={`Adults - ${item?.adults}  `} />
                              <Chip
                                size='small'
                                label={`Children - ${item?.children}  `}
                              />
                            </Box>
                            <Box className='mobiletrip-details'>
                              {item?.contact && (
                                <Box className='tour-mobilenumber'>
                                  <Call style={{ fontSize: '1rem' }} />
                                  <Typography>{item?.contact}</Typography>
                                </Box>
                              )}

                              {item.tripStartTime && (
                                <Box className='tour-mobilenumber'>
                                  <Typography>
                                    Start Time : {tripStartTime(item?.tripStartTime)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                          Transfer Details:
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            width: '100%',
                            gap: '10px',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Box sx={{ display: 'flex' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                              From :
                            </Typography>
                            <Tooltip
                              title={item?.transferInstance?.from?.locationAddress}
                            >
                              <Typography
                                sx={{ width: '100px', fontSize: '14px' }}
                                noWrap
                              >{`${item?.transferInstance?.from?.locationAddress}`}</Typography>
                            </Tooltip>
                          </Box>
                          <Box sx={{ display: 'flex' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                              To :
                            </Typography>
                            <Tooltip title={item?.transferInstance?.to?.locationAddress}>
                              <Typography
                                sx={{ width: '100px', fontSize: '14px' }}
                                noWrap
                              >{`${item?.transferInstance?.to?.locationAddress}`}</Typography>
                            </Tooltip>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Icon icon={'ix:steering-user'} height={20} width={20}></Icon>

                            <Tooltip
                              title={`Driver Name:${item?.transferInstance?.driverName}`}
                            >
                              <Typography
                                sx={{ width: '100px', fontSize: '14px' }}
                                noWrap
                              >{`${item?.transferInstance?.driverName}`}</Typography>
                            </Tooltip>
                          </Box>

                          <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Icon icon={'famicons:call'} height={20} width={20}></Icon>
                            <Tooltip
                              title={`Contact No. :${item?.transferInstance?.contactNumber}`}
                            >
                              <Typography
                                sx={{ width: '100px', fontSize: '14px' }}
                                noWrap
                              >{`${item?.transferInstance?.contactNumber}`}</Typography>
                            </Tooltip>
                          </Box>

                          <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Icon
                              icon={'fluent:vehicle-bus-20-filled'}
                              height={20}
                              width={20}
                            ></Icon>
                            <Tooltip
                              title={`Vehicle No. :${item?.transferInstance?.vehicleNumber?.toUpperCase()}`}
                            >
                              <Typography
                                sx={{ width: '100px', fontSize: '14px' }}
                                noWrap
                              >{`${item?.transferInstance?.vehicleNumber?.toUpperCase()}`}</Typography>
                            </Tooltip>
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Box key={item} className='tourguest-details'>
                      <Box className='tourguest-container'>
                        <Tooltip
                          title={
                            item?.arrived === 'Arrived'
                              ? 'Onboarded'
                              : item?.arrived === 'Skipped'
                              ? 'Skipped'
                              : item?.arrived === null
                              ? 'Yet to board'
                              : 'No show'
                          }
                        >
                          <Avatar
                            sx={{
                              bgcolor:
                                item?.arrived === 'Arrived'
                                  ? '#4caf50'
                                  : item?.arrived === 'Skipped'
                                  ? '#fbcf1c'
                                  : item?.arrived === null
                                  ? '#ffa500'
                                  : '#f44336',
                              color: 'white',
                              width: 32,
                              height: 32
                            }}
                          >
                            {item?.arrived === 'Arrived' ? (
                              <Check />
                            ) : item?.arrived === 'Skipped' ? (
                              <SkipNext />
                            ) : item?.arrived === null ? (
                              <PendingActions />
                            ) : (
                              <Cancel />
                            )}
                          </Avatar>
                        </Tooltip>
                        <Box>
                          <Typography className='tourdetails-guestname'>
                            {item?.name}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
                      >
                        <Box className='guestdetails-overview'>
                          <Chip
                            size='small'
                            label={`Total - ${item?.adults + item?.children}  `}
                          />
                          <Chip size='small' label={`Adults - ${item?.adults}  `} />
                          <Chip size='small' label={`Children - ${item?.children}  `} />
                        </Box>

                        <Box className='mobiletrip-details'>
                          {item?.contact && (
                            <Box className='tour-mobilenumber'>
                              <Call />
                              <Typography>{item?.contact}</Typography>
                            </Box>
                          )}

                          {item.tripStartTime && (
                            <Box className='tour-mobilenumber'>
                              <AccessTime />
                              <Typography>
                                Start Time : {tripStartTime(item?.tripStartTime)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                )}
              </AccordionDetails>
            </Accordion>
          ))}

        {!tourDetails && (
          <Accordion
            className='touraccordion-container'
            defaultExpanded
            expanded={expanded}
            onChange={(e: any) => {
              setExpanded(true);
            }}
          >
            <AccordionSummary
              aria-controls='panel1-content'
              id='panel1-header'
              className='touraccordion-summary'
            >
              <Box className='touraccordion-summarydetails'>
                <Box className='touraccordion-hotels'>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      width: 35,
                      height: 35
                    }}
                  >
                    {<PeopleAlt />}
                  </Avatar>
                  <Typography component='span' className='touraccordion-header'>
                    Guest List
                  </Typography>
                </Box>

                <Box className='touraccordion-guests'>
                  <Box className='touraccordion-counts'>
                    <Box className='touraccordion-bookingscount'>
                      <Typography className='touraccordion-bgcount'>
                        {totalPresent}
                      </Typography>
                      <Typography className='touraccordion-bgheader'>
                        Onboarded
                      </Typography>
                    </Box>
                    <Box className='touraccordion-guestscount'>
                      <Typography className='touraccordion-bgcount'>
                        {totalAbsentees}
                      </Typography>
                      <Typography className='touraccordion-bgheader'>No show</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails className='touraccordion-details'>
              {guests?.map((item: any) => (
                <Box key={item} className='tourguest-details'>
                  <Box className='tourguest-container'>
                    <Tooltip
                      title={
                        item?.arrived === 'Arrived'
                          ? 'Onboarded'
                          : item?.arrived === 'Skipped'
                          ? 'Skipped'
                          : item?.arrived === null
                          ? 'Yet to board'
                          : 'No show'
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            item?.arrived === 'Arrived'
                              ? '#4caf50'
                              : item?.arrived === 'Skipped'
                              ? '#fbcf1c'
                              : item?.arrived === null
                              ? '#ffa500'
                              : '#f44336',
                          color: 'white',
                          width: 32,
                          height: 32
                        }}
                      >
                        {item?.arrived === 'Arrived' ? (
                          <Check />
                        ) : item.arrived === 'Skipped' ? (
                          <SkipNext />
                        ) : item?.arrived === null ? (
                          <PendingActions />
                        ) : (
                          <Cancel />
                        )}
                      </Avatar>
                    </Tooltip>
                    <Box>
                      <Typography className='tourdetails-guestname'>
                        {item?.name}
                      </Typography>
                    </Box>{' '}
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px'
                    }}
                  >
                    <Box className='guestdetails-overview'>
                      <Chip
                        size='small'
                        label={`Total - ${item?.adults + item?.children}  `}
                      />
                      <Chip size='small' label={`Adults - ${item?.adults}  `} />
                      <Chip size='small' label={`Children - ${item?.children}  `} />
                    </Box>
                    <Box className='mobiletrip-details'>
                      {item?.contact && (
                        <Box className='tour-mobilenumber'>
                          <Call />
                          <Typography>{item?.contact}</Typography>
                        </Box>
                      )}

                      {item.tripStartTime && (
                        <Box className='tour-mobilenumber'>
                          {/* <AccessTime /> */}
                          <Typography>
                            Start Time : {tripStartTime(item?.tripStartTime)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
};

export default TourDashboard;
