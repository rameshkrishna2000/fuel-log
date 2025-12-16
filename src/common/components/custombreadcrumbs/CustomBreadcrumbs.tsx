import Breadcrumbs from '@mui/material/Breadcrumbs';
import './CustomBreadcrumbs.scss';
import Box from '@mui/material/Box';
interface BreadCurmbsInterface {
  itemOne: any;
  itemTwo: any;
  itemTwoState: boolean;
  setView: any;
  className?: string;
  handleItemOneClick?: any;
}
function CustomBreadcrumbs({
  itemOne,
  itemTwo,
  itemTwoState,
  className,
  setView,
  handleItemOneClick
}: BreadCurmbsInterface) {
  const handleClick = () => {
    setView(false);

    if (handleItemOneClick) {
      handleItemOneClick();
    }
  };
  return (
    <Box component={'div'} role='presentation'>
      <Breadcrumbs aria-label='breadcrumb' separator='/'>
        <Box
          component={'span'}
          style={{ color: 'inherit' }}
          className={`${className} cursor`}
          onClick={handleClick}
        >
          {itemOne}
        </Box>

        {itemTwoState && (
          <Box
            component={'span'}
            style={{ color: 'blue' }}
            className={`${className} cursor`}
          >
            {itemTwo}
          </Box>
        )}
      </Breadcrumbs>
    </Box>
  );
}

export default CustomBreadcrumbs;
