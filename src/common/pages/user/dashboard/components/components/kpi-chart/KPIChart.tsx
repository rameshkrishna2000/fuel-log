import { Box, Card, CardContent, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import './KPIChart.scss';

interface KPIProps {
  title: string;
  speed: number;
  icon: string;
  iconSize: string;
  color: string;
  flexDirection: string;
  justifyContent: string;
  height: string;
  columnGap: string;
  rowGap: string;
}

const KPIChart = ({
  title,
  speed,
  icon,
  iconSize,
  color,
  flexDirection,
  justifyContent,
  height,
  columnGap,
  rowGap
}: KPIProps) => {
  return (
    <Card className='kpi-container-box'>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: flexDirection,
            justifyContent: justifyContent,
            height: height,
            columnGap: columnGap,
            rowGap: rowGap
          }}
        >
          <Box
            className={
              flexDirection === 'row'
                ? 'kpi-second-color kpi-second-color-row'
                : 'kpi-second-color'
            }
          ></Box>
          <Icon icon={icon} style={{ color, fontSize: iconSize, zIndex: 1 }} />
          <Box sx={{ zIndex: 1 }}>
            <Typography component='h3' className='kpi-speed'>
              {speed}
            </Typography>
            <Typography component='h3' className='kpi-title'>
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPIChart;
