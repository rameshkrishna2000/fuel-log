import { Icon } from '@iconify/react';
import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';

const FuelDashboardCard = ({ isLoading, dataLoading, arr }: any) => {
  return (
    <Grid container spacing={3} className='fuel-grid-container'>
      {isLoading && dataLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
              <Card
                className='fuel-card'
                sx={{
                  borderRadius: '5%',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,245,0.95))'
                }}
              >
                <CardContent>
                  <Box className='fuel-card-head'>
                    <Skeleton variant='text' width='60%' height={25} />
                    <Skeleton variant='circular' width={25} height={25} />
                  </Box>
                  <Skeleton variant='text' width='80%' height={25} sx={{ mt: 2 }} />
                  <Skeleton variant='text' width='50%' height={25} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        : arr?.map((item: any, index: number) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
              <Card
                className='fuel-card'
                sx={{
                  background: item?.gradient,
                  transition: 'all 0.3s ease',
                  borderRadius: '5%',
                  '&:hover': {
                    boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent>
                  <Box className='fuel-card-head'>
                    <Typography className='fuel-card-text'>{item.title}</Typography>
                    <Box className='fuel-card-icon-wrapper'>
                      <Icon
                        icon={item.icon}
                        className='fuel-card-icon'
                        style={{ color: item.iconColor, fontSize: '24px' }}
                      />
                    </Box>
                  </Box>
                  <Typography className='fuel-card-cost'>{item.data}</Typography>
                  <Typography className='fuel-card-litre'>{item.litres}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
    </Grid>
  );
};

export default FuelDashboardCard;
