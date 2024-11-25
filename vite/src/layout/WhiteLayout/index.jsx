import { Outlet } from 'react-router-dom';

// ==============================|| WHITE LAYOUT ||============================== //

const WhiteLayout = () => (
  <div>
    {/* Add any layout components or styling you need here */}
    <Outlet /> {/* This will render the child routes */}
  </div>
);

export default WhiteLayout;
