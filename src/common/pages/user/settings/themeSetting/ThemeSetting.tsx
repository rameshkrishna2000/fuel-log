import { Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../../app/redux/hooks';
import { updateTheme } from '../../../../redux/reducer/commonSlices/themeSlice';
import { Icon } from '@iconify/react';
import constant from '../../../../../utils/constants';
import '../../../../../app/styles/variables.scss';

type Theme = 'yaantrac' | 'ayka';

const ThemeSetting = () => {
  const theme = useAppSelector(state => state.theme.theme);

  const dispatch = useAppDispatch();

  const handleChangeTheme = (theme: Theme) => {
    dispatch(updateTheme(theme));
  };

  return (
    <>
      <Box>
        <Stack direction='row' justifyContent='space-between' mb={2}>
          <Typography className='profileData' ml={5}>
            {constant.Themes}
          </Typography>
        </Stack>
        <Stack
          direction='row'
          ml={5}
          pl={3}
          pr={3}
          pt={1}
          pb={1}
          mb={1}
          sx={{ border: '1px solid #CACACA' }}
        >
          <Stack direction='row' alignItems='center' spacing={2} width='100%'>
            <Icon
              icon='fluent:dark-theme-20-regular'
              width='23'
              height='23'
              style={{ color: '#3239ea' }}
            />
            <Typography className='options'>{constant.DefaultTheme}</Typography>
          </Stack>
          <FormControlLabel
            control={
              <Switch
                onChange={() => handleChangeTheme('yaantrac')}
                checked={theme === 'yaantrac'}
              />
            }
            label
          />
        </Stack>
        <Stack
          direction='row'
          ml={5}
          pl={3}
          pr={3}
          pt={1}
          pb={1}
          mb={1}
          sx={{ border: '1px solid #CACACA' }}
        >
          <Stack direction='row' alignItems='center' spacing={2} width='100%'>
            <Icon
              icon='fluent:dark-theme-20-regular'
              width='23'
              height='23'
              style={{ color: '#ff6347' }}
            />
            <Typography className='options'>Ayka Theme</Typography>
          </Stack>
          <FormControlLabel
            control={
              <Switch
                onChange={() => handleChangeTheme('ayka')}
                checked={theme === 'ayka'}
              />
            }
            label
          />
        </Stack>
      </Box>
    </>
  );
};

export default ThemeSetting;
