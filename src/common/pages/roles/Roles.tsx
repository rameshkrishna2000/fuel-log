import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material';
import './Roles.scss';
import { useCallback, useEffect, useState } from 'react';
import AddRoles from './AddRoles';
import CountUp from 'react-countup';

import { Delete, Edit } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/redux/hooks';
import { capitalizeFirstLetter, debounce } from '../../../utils/commonFunctions';
import { deleteRole, getRoles } from '../../redux/reducer/commonSlices/roleSlice';
import CustomTextField from '../../components/customized/customtextfield/CustomTextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CustomButton from '../../components/buttons/CustomButton';
import constant from '../../../utils/constants';
import CustomDeletePopup from '../../components/customdelete/CustomDeletePopup';
import CustomIconButton from '../../components/buttons/CustomIconButton';
import {
  useCommonFunctions,
  useEffectRoles,
  useMenuActionController,
  userCommonStates
} from './hooks/rolesHooks';

const Roles = () => {
  const { data: authData } = useAppSelector(state => state.auth);
  const { data, isLoading } = useAppSelector(state => state.getRoles);
  const { isLoading: deleteLoading } = useAppSelector(state => state.deleteRole);

  const { control } = useForm<any>({});

  const dispatch = useAppDispatch();
  let roletype = authData?.role;
  const APoperator = roletype === 'ROLE_OPERATOR';
  const urls = { getRoles, deleteRole };

  const {
    isOpen,
    setIsOpen,
    view,
    setView,
    roleType,
    setRoleType,
    message,
    setMessage,
    selectedFeature,
    setSelectedFeature
  } = userCommonStates();

  const cardData = data?.map((value: any) => ({
    ...value
  }));

  const { handleFilterChange, handleView, featureData, filter, row, setRow } =
    useCommonFunctions({
      cardData,
      setView
    });

  const {
    handleClick,
    handleClose,
    handleDelete,
    filteredRow,
    setFilteredRow,
    isDelete,
    setIsDelete,
    anchorEl,
    setAnchorEl
  } = useMenuActionController({
    setView,
    dispatch,
    urls,
    deleteRole
  });
  const open = Boolean(anchorEl);

  useEffectRoles({ data, setRow, dispatch, urls });

  return (
    <Grid height={'80vh'} overflow={'hidden'}>
      <Grid container className='role-container'>
        <Grid item lg={2} md={3} sm={4} xs={8}>
          <CustomTextField
            name='search'
            control={control}
            id='filter-input'
            placeholder='Search...'
            value={filter}
            variant='standard'
            icon={<SearchOutlinedIcon color='primary' />}
            onChangeCallback={(e: any) => handleFilterChange(e)}
          />
        </Grid>
        <Grid item xs={12} sm={5} md={5} className='role-count'>
          <Typography className='role-header'>
            Total Roles :
            <CountUp end={row?.length} duration={3} />
          </Typography>
          {!APoperator && (
            <CustomButton
              category='Add Role'
              className='saveChanges'
              onClick={() => {
                setIsOpen(true);
                setRoleType('Add Role');
                setFilteredRow(null);
              }}
            />
          )}
        </Grid>
        {isOpen && (
          <AddRoles
            filteredRow={filteredRow}
            setFilteredRow={setFilteredRow}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            roleType={roleType}
          />
        )}
      </Grid>

      {isLoading ? (
        <Grid container spacing={1} marginTop={2}>
          {Array.from({ length: 12 })?.map((value: any, index: number) => (
            <Grid item lg={3} md={4} sm={6} xs={12} key={index}>
              <Card
                sx={{
                  height: '130px',
                  width: '100%',
                  borderRadius: '1rem',
                  border: ' 1px solid #e8e8e8',
                  boxShadow: '0 8px 12px rgba(122, 122, 122, 0.2) ',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <Grid container paddingLeft={2} marginTop={2}>
                  <Grid item lg={12} md={12} sm={12} xs={12}>
                    <Skeleton width={'50%'} />
                    <Skeleton width={'80%'} />
                    <Skeleton width={'80%'} />
                  </Grid>
                </Grid>
                <Grid spacing={2} container paddingLeft={2} paddingTop={1}>
                  <Grid item>
                    <Skeleton
                      variant='rounded'
                      width={100}
                      height={20}
                      sx={{ borderRadius: '1rem' }}
                    />
                  </Grid>
                  <Grid item>
                    <Skeleton
                      variant='rounded'
                      width={100}
                      height={20}
                      sx={{ borderRadius: '1rem' }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : row && row?.length > 0 ? (
        <Box className='card-role-container'>
          <Grid container spacing={2} className='card-box'>
            {row?.map((item: any, index: number) => (
              <Grid
                item
                lg={3}
                md={4}
                sm={6}
                xs={12}
                onClick={(event: React.SyntheticEvent) => {
                  event.stopPropagation();
                  handleView(item);
                  setSelectedFeature(
                    item?.featureAccessResponseList?.[0]?.['featureName']
                  );
                }}
              >
                <Card>
                  <CardContent>
                    <Grid className='card-content'>
                      <Grid className='card-items'>
                        <Grid container direction={'column'} spacing={0.8}>
                          <Grid item>
                            <Typography
                              component={'span'}
                              className='card-title'
                              gutterBottom
                            >
                              <Tooltip
                                title={capitalizeFirstLetter(item.roleName.toLowerCase())}
                                placement='right'
                              >
                                <Typography
                                  component={'span'}
                                  sx={{
                                    color: '#727272',
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                  }}
                                >
                                  {capitalizeFirstLetter(item.roleName.toLowerCase())}
                                </Typography>
                              </Tooltip>
                            </Typography>
                          </Grid>

                          <Grid item>
                            <Typography className='card-description' gutterBottom>
                              <Tooltip
                                title={capitalizeFirstLetter(item.description)}
                                arrow
                              >
                                <span
                                  style={{
                                    color: '#000',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  {item?.description
                                    ? capitalizeFirstLetter(item.description)
                                    : 'N/A'}
                                </span>
                              </Tooltip>
                            </Typography>
                          </Grid>
                        </Grid>
                        {/* <Grid container spacing={1} paddingTop={'5px'}>
                          <Grid item xs={6} sm={6} md={6} lg={6}>
                            <Chip
                              label={`Features: ${item?.featureAccessResponseList.length}`}
                              color='primary'
                              size='medium'
                              // icon={
                              //   <Icon
                              //     icon='mdi:feature-highlight'
                              //     width='20'
                              //     height='20'
                              //     style={{ color: '#3239ea' }}
                              //   />
                              // }
                              sx={{
                                fontSize: '0.8rem',
                                color: '#838383',
                                background: '#f0f4ff',
                                '.css-9iedg7': {
                                  width: '100% !important'
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={6} sm={6} md={6} lg={6}>
                            <Chip
                              label={`Modules: ${
                                item?.featureAccessResponseList.flatMap(
                                  (value: any) => value?.modules
                                )?.length
                              }`}
                              // icon={
                              //   <Icon
                              //     icon='fa-brands:unity'
                              //     width='20'
                              //     height='20'
                              //     style={{ color: '#3239ea' }}
                              //   />
                              // }
                              color='primary'
                              size='medium'
                              sx={{
                                fontSize: '0.8rem',
                                background: '#f0f4ff',
                                color: '#838383'
                              }}
                            />
                          </Grid>
                        </Grid> */}
                        <Grid container spacing={1} paddingTop='5px'>
                          <Grid item xs={12}>
                            <Chip
                              label={`Modules: ${
                                item?.featureAccessResponseList?.flatMap(
                                  (value: any) => value?.modules
                                )?.length || 0
                              }`}
                              icon={<></>}
                              sx={{
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: '#2c3e50',
                                backgroundColor: '#f5f7ff',
                                borderRadius: '6px',
                                padding: '2px 4px',
                                '& .MuiChip-label': {
                                  padding: '0 8px'
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      {!APoperator && (
                        <Box>
                          <IconButton
                            aria-label='more'
                            aria-controls='action-menu'
                            aria-haspopup='true'
                            onClick={(event: any) => {
                              event.stopPropagation();
                              handleClick(event);
                              setFilteredRow(item);
                            }}
                          >
                            <Icon
                              icon='mdi:dots-vertical'
                              style={{ fontSize: '20px', color: '#343148ff' }}
                            />
                          </IconButton>

                          <Menu
                            id='action-menu'
                            anchorEl={anchorEl}
                            open={open}
                            tabIndex={0}
                            onKeyDown={(event: any) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.stopPropagation();
                              }
                            }}
                            onClose={(event: any) => {
                              event.stopPropagation();
                              handleClose();
                            }}
                            PaperProps={{
                              sx: { boxShadow: '0px 2px 6px rgba(172, 162, 162, 0.9)' }
                            }}
                          >
                            <MenuItem
                              onClick={(event: any) => {
                                event.stopPropagation();
                                handleClose();
                                setIsOpen(true);
                                setRoleType('Update Role');
                              }}
                            >
                              <Edit
                                sx={{
                                  fontSize: '1.2rem',
                                  marginRight: 1,
                                  color: '#edb10e'
                                }}
                              />
                              Update
                            </MenuItem>
                            <MenuItem
                              id='button'
                              tabIndex={0}
                              onKeyDown={(event: any) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.stopPropagation();
                                  handleClose();
                                  setIsDelete(true);
                                  setMessage(`${constant.DeleteCustomer} the Role?`);
                                }
                              }}
                              onClick={(event: any) => {
                                event.stopPropagation();
                                handleClose();
                                setIsDelete(true);
                                setMessage(`${constant.DeleteCustomer} the Role?`);
                              }}
                            >
                              <Delete
                                sx={{
                                  fontSize: '1.2rem',
                                  marginRight: 1,
                                  color: '#ed0e53'
                                }}
                              />
                              Delete
                            </MenuItem>
                          </Menu>
                        </Box>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
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
      )}

      {isDelete && (
        <CustomDeletePopup
          open={isDelete}
          handleDelete={handleDelete}
          setOpen={setIsDelete}
          handleClose={handleClose}
          message={message}
          isLoading={deleteLoading}
        />
      )}
      {view && (
        <Dialog
          open={view}
          maxWidth={'sm'}
          PaperProps={{
            sx: {
              height: '60%',
              '.css-1sthlmf-MuiGrid-root': {
                backgroundColor: '#eef7ff',
                padding: '10px',
                borderRadius: '1rem'
              }
            }
          }}
          fullWidth
          className='subuser-feature-view animate__animated animate__zoomInRight'
          slotProps={{ backdrop: { invisible: true } }}
        >
          <DialogContent>
            <Box className='feature-content'>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Role Access</Typography>
              </Box>
              <Box
                className='closeIcon icon-position d-flex'
                onClick={() => {
                  setView(false);
                }}
              >
                <CustomIconButton category='CloseValue' />
              </Box>
            </Box>
            {/* <Box sx={{ width: '100%', overflowX: 'scroll', scrollbarWidth: 'none' }}>
              <Grid gap={2} className='feature-chip'>
                {featureData?.map((label: any, index: number) => (
                  <Chip
                    key={index}
                    label={capitalizeFirstLetter(label?.feature)}
                    variant='outlined'
                    sx={{
                      color: selectedFeature === label.feature ? '#fff' : '#000',
                      fontSize: '0.8rem',
                      background:
                        selectedFeature === label.feature
                          ? 'linear-gradient(45deg,#00bcd4,#007aff)'
                          : '#fff'
                    }}
                    onClick={(newValue: any) => {
                      setSelectedFeature(label.feature);
                    }}
                  />
                ))}
              </Grid>
            </Box> */}
            <Box
              sx={{
                height: '40vh',
                overflow: 'auto',
                mt: 2
              }}
            >
              <Grid container className='subuser-view'>
                {['Module', 'READ', 'CREATE', 'MODIFY', 'STATUS(A/D)', 'REMOVE'].map(
                  (label, index) => (
                    <Grid item lg={2} md={2} sm={2} xs={2} key={index}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {label}
                      </Typography>
                    </Grid>
                  )
                )}
                <Grid container direction={'column'}>
                  {featureData
                    .find((f: any) => f.feature === selectedFeature)
                    ?.module?.map((mod: any, index: number) => (
                      <Grid paddingTop={2} container key={index}>
                        <Grid item lg={2} md={2} sm={2} xs={2}>
                          <Typography title={mod.field} className='feature-field'>
                            {capitalizeFirstLetter(mod.field)}
                          </Typography>
                        </Grid>
                        {mod?.checked?.map((item: any) => (
                          <Grid item lg={2} md={2} sm={2} xs={2}>
                            <Icon
                              icon={
                                item === true ? 'mdi:tick-circle' : 'ic:baseline-cancel'
                              }
                              width='20'
                              color={item === true ? 'rgb(14, 188, 147)' : '#ff0000'}
                              height='20'
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Grid>
  );
};

export default Roles;
