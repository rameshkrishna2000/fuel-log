import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Avatar,
  Box,
  Collapse,
  InputLabel,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import './CustomFileUpload.scss';
import { pink } from '@mui/material/colors';
import { TransitionGroup } from 'react-transition-group';
import { useState } from 'react';
import { fileNameFormat } from '../../../../utils/commonFunctions';

const CustomFileUpload = ({
  handleUpload,
  label,
  files,
  handleDelete,
  error,
  isRequired = false
}: any) => {
  const [isExpand, setIsExpand] = useState(false);

  return (
    <Box className='file-upload'>
      <Accordion
        className='file-accordion'
        expanded={files?.length > 0 && isExpand}
        onChange={(e: React.SyntheticEvent, expanded: boolean) => {
          setIsExpand(expanded);
        }}
      >
        <AccordionSummary
          sx={{
            pointerEvents: 'none'
          }}
          expandIcon={
            files?.length > 0 && (
              <ExpandMoreIcon
                sx={{
                  pointerEvents: 'auto'
                }}
                className='expand-icon-no-outline'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsExpand(prev => !prev);
                  }
                }}
              />
            )
          }
          aria-controls='panel1-content'
          id='panel1-header'
        >
          <Stack flexDirection={'row'} alignItems={'center'} gap={'20px'}>
            <Typography className='accordion-summaryhead'>
              {label}
              {isRequired && label ? <span style={{ color: 'red' }}> *</span> : ''}
            </Typography>

            <Icon
              icon='material-symbols:upload'
              width='1.5em'
              className='accordion-uploadicon expand-icon-no-outline'
              height='1.5em'
              name='License'
              onClick={handleUpload}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleUpload();
                  e.preventDefault();
                }
              }}
            />
          </Stack>
        </AccordionSummary>
        {files?.map((item: any, index: number) => (
          <AccordionDetails>
            <TransitionGroup>
              <Collapse>
                <Stack
                  className='accordion-details'
                  flexDirection={'row'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <Avatar sx={{ bgcolor: pink[500], height: '38px', width: '38px' }}>
                    {item?.type?.split('/')[0].includes('image') ? (
                      <ImageIcon />
                    ) : (
                      <PictureAsPdfIcon />
                    )}
                  </Avatar>
                  <Tooltip
                    title={
                      item?.size
                        ? item?.name.replace(/[ &\/\\#,+_$~%'":*?<>{}-]/g, '')
                        : fileNameFormat(item?.name)
                    }
                  >
                    <Typography className='details-filename' key={item?.name}>
                      {`${
                        item?.size
                          ? item?.name.replace(/[ &\/\\#,+_$~%'":*?<>{}-]/g, '')
                          : fileNameFormat(item.name)
                      }`}
                    </Typography>
                  </Tooltip>
                  <Box sx={{ cursor: 'pointer' }}>
                    <Icon
                      icon={'mi:delete'}
                      width='1.5em'
                      height='1.5em'
                      color='red'
                      onClick={() => {
                        handleDelete(item, index);
                      }}
                      className='expand-icon-no-outline'
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleDelete(item, index);
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Collapse>
            </TransitionGroup>
          </AccordionDetails>
        ))}
      </Accordion>
      <Box className='file-count'>{files.length}</Box>
      {error && <p className='warning'>{error}</p>}
    </Box>
  );
};

export default CustomFileUpload;
