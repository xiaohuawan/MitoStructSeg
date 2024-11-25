import { lazy } from 'react';
import WhiteLayout from 'layout/WhiteLayout';
import Loadable from 'ui-component/Loadable';

// Loadable components
const VisualizationPage = Loadable(lazy(() => import('views/visualization/App')));

// Route configuration
const ShowRoutes = {
  path: '/',
  element: <WhiteLayout />,
  children: [
    {
      path: 'visualizationCla',
      element: <VisualizationPage />
    },
  ]
};

export default ShowRoutes;
