import { useState } from 'react';
import { Box, Card, Dialog, Typography, createTheme, useMediaQuery } from '@mui/material';
import { Icon } from '@iconify/react';
import constants from '../../../utils/constants';
import CustomButton from '../buttons/CustomButton';
import './CustomCard.scss';

interface GeofenceData {
  type: 'geofence';
  id: number;
  geoType: string;
  component?: string;
  geofenceName: string;
  vehicleNumber: string[];
  geofenceRadius: number;
  isActive: number;
  location?: string;
  onClick?: () => void;
  onView?: () => void;
  onDeactivate?: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
  onAssign?: () => void;
  onVehiclesList?: () => void;
}

interface LocationData {
  type: 'location';
  id: number;
  header: string;
  component?: string;
  isPinned: number;
  address?: any;
  onClick?: () => void;
  onView?: () => void;
  onUpdate?: () => void;
  onPinned?: () => void;
  onDelete?: () => void;
}

const CustomCard = (props: GeofenceData | LocationData) => {
  const theme = createTheme();

  // for responsive
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [isLocation, setIsLocation] = useState<boolean>(false);
  const [isGeofence, setIsGeofence] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isDeactivate, setIsDeactivate] = useState<boolean>(false);

  return (
    <>
      <Box sx={{ overflow: 'hidden' }}>
        <Card
          key={props.id}
          className='card animate__animated animate__flipInX animate__fast animate__delay-0.5s'
          elevation={0}
          sx={{ borderRadius: 3, minHeight: '140px' }}
          onClick={props.onView}
        >
          {props.type === 'geofence' ? (
            <Box className='geofence '>
              <Box className='cardHeader '>
                <Box className='cardHead' mb={2}>
                  <Typography component='p' className='geofence-name'>
                    {props.geofenceName?.toLocaleUpperCase()}
                  </Typography>
                </Box>
                <Box className='icons'>
                  <Icon
                    className='icon'
                    icon='fluent:person-key-20-regular'
                    onClick={(event: any) => {
                      event.stopPropagation();
                      if (props.isActive === 1 && props.onAssign) props.onAssign();
                    }}
                    style={{
                      display: isSmallScreen ? 'inline-block' : 'none',
                      color: '#0b29c1',
                      ...(props.isActive === 1
                        ? { visibility: 'visible' }
                        : { visibility: 'hidden' })
                    }}
                  />
                  {props?.vehicleNumber?.length > 0 && (
                    <Icon
                      className='icon'
                      icon='fluent:vehicle-car-24-filled'
                      onClick={(event: any) => {
                        event.stopPropagation();
                        if (props.isActive === 1 && props.onVehiclesList)
                          props.onVehiclesList();
                      }}
                      style={{
                        display: isSmallScreen ? 'inline-block' : 'none',
                        color: '#f03b00',
                        ...(props.isActive === 1
                          ? { visibility: 'visible' }
                          : { visibility: 'hidden' })
                      }}
                    />
                  )}

                  <Icon
                    className='icon'
                    icon='iconamoon:edit-light'
                    onClick={(event: any) => {
                      event.stopPropagation();
                      if (props.isActive === 1 && props.onUpdate) props.onUpdate();
                    }}
                    style={{
                      display: isSmallScreen ? 'inline-block' : 'none',
                      color: '#faba43',
                      ...(props.isActive === 1
                        ? { visibility: 'visible' }
                        : { visibility: 'hidden' })
                    }}
                  />
                  <Icon
                    className='icon'
                    icon={props.isActive === 1 ? 'hugeicons:tick-01' : 'ic:outline-block'}
                    onClick={event => {
                      event.stopPropagation();
                      setIsDeactivate(true);
                    }}
                    style={{
                      display: isSmallScreen ? 'inline-block' : 'none',
                      ...(props.isActive === 1
                        ? { color: 'rgb(14, 188, 147)', fontSize: '20px' }
                        : { color: '#FF1D2A', opacity: '0.8' })
                    }}
                  />
                  <Icon
                    className={`icon ${props.component}`}
                    icon='material-symbols:delete-outline-rounded'
                    onClick={(event: any) => {
                      event.stopPropagation();
                      setIsGeofence(true);
                    }}
                    style={{
                      display: isSmallScreen ? 'inline-block' : 'none',
                      color: '#d32f2f'
                    }}
                  />
                </Box>
              </Box>

              <Typography paragraph className='locationHead' m={0}>
                {constants.Location}
              </Typography>

              <Typography paragraph className='vehicleLocation' mb={2}>
                {props.location}
              </Typography>

              {props.geoType === 'circular' && (
                <>
                  <Typography paragraph className='locationHead' m={0}>
                    {constants.GeofenceRadius}
                  </Typography>

                  <Typography paragraph className='vehicleLocation' m={0}>
                    {`${props.geofenceRadius} KM`}
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Box className='location '>
              <Box className='cardHeader'>
                <Box className='cardHead' mb={2}>
                  {props.header}
                </Box>
                <Box className='icons'>
                  <Icon
                    className={`icon ${props.component}`}
                    icon='iconamoon:edit-light'
                    onClick={(event: any) => {
                      event.stopPropagation();
                      if (props.onUpdate) props.onUpdate();
                    }}
                    style={{ display: isSmallScreen ? 'inline-block' : 'none' }}
                  />
                  <Icon
                    className='icon'
                    icon={props.isPinned === 1 ? 'bi:pin-fill' : 'fluent:pin-16-regular'}
                    onClick={(event: any) => {
                      event.stopPropagation();
                      setIsPinned(true);
                    }}
                    style={{
                      display: isSmallScreen || props.isPinned ? 'inline-block' : 'none'
                    }}
                  />
                  <Icon
                    className={`icon ${props.component}`}
                    icon='material-symbols:delete-outline-rounded'
                    onClick={(event: any) => {
                      event.stopPropagation();
                      setIsLocation(true);
                    }}
                    style={{ display: isSmallScreen ? 'inline-block' : 'none' }}
                  />
                </Box>
              </Box>
              <Typography paragraph className='locationHead' m={0}>
                {`${props.address}.`}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
      {props.type === 'location' ? (
        <Dialog open={isPinned || isLocation}>
          <Box
            sx={{
              textAlign: 'center',
              alignItems: 'center',
              padding: '5%',
              width: '300px'
            }}
          >
            {isLocation && <Typography>{constants.DeleteConfirmation}</Typography>}
            {isPinned && (
              <Typography>{props.isPinned ? constants.unPin : constants.Pin}</Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                padding: '5%',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ marginRight: '12px' }}>
                <CustomButton
                  className='saveChanges'
                  category='Yes'
                  onClick={() => {
                    if (isLocation && props.onDelete) props?.onDelete();
                    else if (props.onPinned) props.onPinned();
                    setIsPinned(false);
                    setIsLocation(false);
                  }}
                />
              </Box>
              <CustomButton
                className='cancel'
                category='No'
                onClick={() => {
                  setIsPinned(false);
                  setIsLocation(false);
                }}
              />
            </Box>
          </Box>
        </Dialog>
      ) : (
        <Dialog open={isDeactivate || isGeofence}>
          <Box
            sx={{
              textAlign: 'center',
              alignItems: 'center',
              padding: '5%',
              width: '300px'
            }}
          >
            {isGeofence && <Typography>{constants.DeleteConfirmation}</Typography>}
            {isDeactivate && (
              <Typography>
                {props.isActive === 1 ? constants.Deactivate : constants.Activate}
              </Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                padding: '5%',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ marginRight: '12px' }}>
                <CustomButton
                  className='saveChanges'
                  category='Yes'
                  onClick={() => {
                    if (isGeofence && props.onDelete) props?.onDelete();
                    else if (props.onDeactivate) props.onDeactivate();
                    setIsDeactivate(false);
                    setIsGeofence(false);
                  }}
                />
              </Box>
              <CustomButton
                className='cancel'
                category='No'
                onClick={() => {
                  setIsDeactivate(false);
                  setIsGeofence(false);
                }}
              />
            </Box>
          </Box>
        </Dialog>
      )}
    </>
  );
};

export default CustomCard;
