import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import LoginRoutes from './AuthenticationRoutes';
import ShowRoutes from './ShowRoutes';
import ShowSegRoutes from './ShowSegRoutes';
import ShowComRoutes from './ShowComRoutes';


// ==============================|| ROUTING RENDER ||============================== //
const router = createBrowserRouter([MainRoutes, LoginRoutes, ShowRoutes, ShowSegRoutes, ShowComRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
