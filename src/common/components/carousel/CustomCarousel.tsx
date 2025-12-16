import { useState } from 'react';
import Carousel from 'react-spring-3d-carousel';
import { config } from '@react-spring/web';
import { Box, Card, CardMedia, Tooltip, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import './CustomCarousel.scss';
import pdf from '../../../../src/app/assets/images/markers/pdflogo.jpg';
import CustomIconButton from '../buttons/CustomIconButton';
import ToolTip from '../../pages/user/management/components/reports/ToolTip';

const CustomCarousel = ({ image }: any) => {
  const [goToSlide, setGoToSlide] = useState<any>(null);

  const cards = image?.map(({ url, name }: any, index: any) => ({
    key: url,
    content: (
      <Box>
        <Card className='carousel-card'>
          <CardMedia
            component='img'
            height='230'
            sx={{ objectFit: 'cover !important' }}
            className={`carousel-${url?.includes('pdf') ? 'pdf' : 'image'}`}
            image={url?.includes('pdf') ? pdf : url}
            alt={index}
          />
        </Card>
        <Box className='uploaded-fileheader'>
          <Tooltip title={name}>
            <Typography noWrap className='uploaded-filename'>
              {name}
            </Typography>
          </Tooltip>
        </Box>

        <Box component={'a'} href={url} target='_blank'>
          <Icon icon='gg:maximize' className='zoom-icon' />
        </Box>
      </Box>
    ),
    onClick: () => setGoToSlide(index)
  }));

  return (
    <Box className='carousel-box'>
      {cards?.length > 1 && (
        <CustomIconButton
          category='arrowLeft'
          showTooltip={false}
          onClick={() => {
            setGoToSlide(goToSlide - 1);
          }}
        />
      )}

      <Carousel
        slides={cards}
        goToSlide={goToSlide}
        offsetRadius={1}
        showNavigation={false}
        animationConfig={config.gentle}
      />
      {cards?.length > 1 && (
        <CustomIconButton
          category='arrowRight'
          showTooltip={false}
          onClick={() => {
            setGoToSlide(goToSlide + 1);
          }}
        />
      )}
    </Box>
  );
};

export default CustomCarousel;
