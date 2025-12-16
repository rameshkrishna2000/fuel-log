import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAppSelector } from '../../../../../../app/redux/hooks';
import { convertDriverEpochToDateTime } from '../../../../../../utils/commonFunctions';

interface FuelCardProps {
  item: any;
  handleImage: (item: any) => void;
  handleUpdate: (item: any) => void;
}

const FuelCard: React.FC<FuelCardProps> = ({ item, handleImage, handleUpdate }) => {
  const { timezone } = useAppSelector(state => state.myProfile.data);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        className='fuel-card-container'
        sx={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,245,0.95))',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.2)',
            background:
              'linear-gradient(135deg, rgba(255,255,255,1), rgba(240,240,240,1))',
            '& .fuel-card-head': {
              transform: 'translateY(-2px)'
            }
          }
        }}
      >
        <CardContent>
          <Box className='fuel-card-head'>
            <Box>
              {' '}
              <Typography className='fuel-vehicle'>{item.vehicleNumber}</Typography>
              <Typography className='fuel-date'>
                {convertDriverEpochToDateTime(item.fuelTimeStamp, timezone)}
              </Typography>
            </Box>
            <Box className='fuel-icons'>
              <Icon
                icon='solar:document-linear'
                className={
                  item?.odometerAttachments?.length > 0 ||
                  item?.fuelReceiptAttachments?.length > 0 ||
                  item?.adblueReceiptAttachments?.length > 0
                    ? 'fuel-doc'
                    : 'fuel-doc-disable'
                }
                onClick={() => {
                  if (
                    item?.odometerAttachments?.length > 0 ||
                    item?.fuelReceiptAttachments?.length > 0 ||
                    item?.adblueReceiptAttachments?.length > 0
                  ) {
                    handleImage(item);
                  }
                }}
              />
              <Icon
                icon='lucide:edit'
                className='fuel-update'
                onClick={() => {
                  handleUpdate(item);
                }}
              />
            </Box>
          </Box>
          <Box className='fuel-chip-container'>
            <Chip label={item.fuelType} className='fuel-chip' />
            {item.paymentMethodName && (
              <Chip
                label={item.paymentMethodName}
                variant='outlined'
                className='fuel-chip'
              />
            )}
          </Box>
          <Box className='fuel-adblue'>
            <Box>
              <Typography className='fuel-volume'>Fuel</Typography>
              <Typography>
                {item.fuelVolume}L
                {item.fuelPricePerUnit ? ` . S$ ${item.fuelPricePerUnit}` : ''}
              </Typography>
            </Box>
            {(item.adblueVolume || item.adbluePricePerUnit) && (
              <Box>
                <Typography className='fuel-volume'>AdBlue</Typography>
                <Typography>
                  {item.adblueVolume ?? 'NA'}L
                  {item.adbluePricePerUnit ? ` . S$ ${item.adbluePricePerUnit}` : ''}
                </Typography>
              </Box>
            )}
          </Box>
          <Divider className='fuel-divider' />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '5px'
            }}
          >
            {' '}
            <Box className='fuel-section'>
              <Icon icon='lucide:fuel' className='fuel-icon' />{' '}
              <Typography
                className='fuel-text'
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px'
                }}
              >
                <Tooltip title={item.fuelStation}>{item.fuelStation}</Tooltip>
              </Typography>
            </Box>
            <Typography className='fuel-text-read'>{item.odometerReading} km</Typography>
          </Box>
          <Typography
            className='fuel-notes'
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              maxWidth: '280px'
            }}
          >
            <Tooltip title={item.notes ?? 'NA'}>{item.notes ?? 'NA'}</Tooltip>
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default FuelCard;
