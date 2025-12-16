import { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import locationIcon from '../../../../app/assets/images/markers/location.png';
import { capitalizeFirstLetter, findAddress } from '../../../../utils/commonFunctions';
import CustomTable from '../../customized/customtable/CustomTable';
import './GoogleInfoWindow.scss';

interface GoogleInfoWindowProps {
  status?: string;
  name?: string | any;
  lat?: number;
  lng?: number;
  vehicleNumber: string;
  info?: any;
  type?: string | null;
  dAddress?: string | null;
}

function GoogleInfoWindow({
  info,
  vehicleNumber,
  status = 'Offline',
  lat,
  lng,
  name,
  type,
  dAddress
}: GoogleInfoWindowProps) {
  let infodata: any = [];

  if (info) {
    for (const [key, value] of Object.entries(info)) {
      infodata.push({
        label: key,
        value: status === 'Parked' && key === 'speed' ? '0 kmph' : value
      });
    }
  }
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (lat || lng) {
      findAddress(Number(lat), Number(lng)).then(res => {
        setAddress(res);
      });
    }
  }, [lat, lng]);

  return (
    address && (
      <Box className='custom-info-window'>
        <Box className='info-head'>
          {info?.head && (
            <Box className='you-are-here'>
              <Box component='img' src={locationIcon} className='locationIcon' />
              <Typography className='you-are-here-text'> You Are Here</Typography>
            </Box>
          )}
          {!info?.Mylocation && !info?.head ? (
            <Box className='info-head' my={1}>
              {type !== 'delivery' && name !== 'report' && name !== 'trips' && (
                <Icon
                  className='statusIcon'
                  style={{
                    color: status === 'Offline' ? '#ff2532' : '#0EBC93',
                    width: '30px',
                    height: '30px',
                    marginRight: '10px'
                  }}
                  icon={'fluent:live-24-regular'}
                />
              )}
              <Box>
                {name !== 'report' && name !== 'trips' && !info?.head && (
                  <Typography className='heading'>
                    {type === 'delivery' && vehicleNumber !== 'Warehouse'
                      ? `Order ID: ${vehicleNumber?.toUpperCase()}`
                      : vehicleNumber?.toUpperCase()}
                  </Typography>
                )}
                <Box className='statusContainer'>
                  {type !== 'delivery' &&
                    name !== 'report' &&
                    name !== 'trips' &&
                    name !== 'historic' && (
                      <Box>
                        <Typography
                          className={status === 'Offline' ? 'offline' : 'online'}
                        >
                          {capitalizeFirstLetter(status)}
                        </Typography>
                      </Box>
                    )}
                </Box>
              </Box>
            </Box>
          ) : (
            ''
          )}

          {info?.Mylocation || info?.head ? <Box></Box> : <CustomTable info={infodata} />}

          {info?.Mylocation && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {info.heading == 'Started at :' ? (
                  <Icon
                    icon='fluent:live-24-regular'
                    width='40'
                    height='40'
                    style={{ color: '#0EBC93' }}
                  />
                ) : (
                  <Box component='img' src={locationIcon} className='locationIcon' />
                )}
                {name !== 'trips' && (
                  <Typography
                    className='heading'
                    sx={{ alignItems: 'center', paddingLeft: '10px' }}
                  >
                    {vehicleNumber}
                  </Typography>
                )}
              </Box>
              {name === 'waypoints' && (
                <CustomTable
                  info={infodata?.filter((item: any) => item?.label !== 'Mylocation')}
                />
              )}
            </>
          )}

          {info?.heading && (
            <Box>
              <Typography className='sub-heading'>{info?.heading}</Typography>
              <Typography
                className='trip-start'
                sx={{
                  color:
                    info.heading === 'Started at :'
                      ? '#0ebc93 !important'
                      : '#3239EA !important'
                }}
              >
                {info.Time}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography>
              <span className='contents'>{type === 'delivery' ? dAddress : address}</span>
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  );
}

export default GoogleInfoWindow;
