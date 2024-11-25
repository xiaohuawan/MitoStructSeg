import { lazy } from 'react';
import WhiteLayout from 'layout/WhiteLayout';
import Loadable from 'ui-component/Loadable';

// Loadable components
const VisualizationSegPage = Loadable(lazy(() => import('views/visualization/App_seg')));

// Route configuration
const ShowSegRoutes = {
  path: '/',
  element: <WhiteLayout />,
  children: [
    {
      path: 'visualizationSeg',
      element: <VisualizationSegPage />
    },
  ]
};

export default ShowSegRoutes;
