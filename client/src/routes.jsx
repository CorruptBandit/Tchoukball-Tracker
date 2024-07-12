import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutEditorPage from './pages/WorkoutEditorPage';
import WorkoutTrackerPage from './pages/WorkoutTrackerPage';
import RecordCaloriesPage from './pages/RecordCaloriesPage';
import RecordWeightPage from './pages/RecordWeightPage';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'workouts', element: <WorkoutsPage /> },
        { path: 'workout-editor', element: <WorkoutEditorPage /> },
        { path: 'workout-tracker', element: <WorkoutTrackerPage /> },
        { path: 'recordcalories', element: <RecordCaloriesPage /> },
        { path: 'record-weight', element: <RecordWeightPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
