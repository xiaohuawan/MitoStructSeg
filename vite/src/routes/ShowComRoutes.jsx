import { lazy } from 'react';
import WhiteLayout from 'layout/WhiteLayout';
import Loadable from 'ui-component/Loadable';

// Loadable components
const VisualizationComPage = Loadable(lazy(() => import('views/visualization/App_com')));

// Route configuration
const ShowComRoutes = {
  path: '/',
  element: <WhiteLayout />,
  children: [
    {
      path: 'visualizationCom',
      element: <VisualizationComPage />
    },
  ]
};

export default ShowComRoutes;
