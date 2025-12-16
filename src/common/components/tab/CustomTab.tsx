import { Box, Tab, Tabs } from '@mui/material';

const CustomTab = ({ onChange, value, tabList }: any) => {
  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Tabs
        value={value}
        onChange={onChange}
        variant='scrollable'
        scrollButtons='auto'
        aria-label='custom-tabs'
        allowScrollButtonsMobile
      >
        {tabList?.map((item: any, index: any) => (
          <Tab
            key={index}
            label={item}
            sx={{ textTransform: 'capitalize' }}
            id={`custom-tab-${index}`}
            aria-controls={`custom-tabpanel-${index}`}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(e, index);
              }
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default CustomTab;
