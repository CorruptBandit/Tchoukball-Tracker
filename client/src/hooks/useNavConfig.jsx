import SvgColor from '../components/svg-color';
import { useAuth } from '../context/AuthContext';

// Helper function to create an icon component
const icon = (name) => (
  <SvgColor src={`/assets/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const useNavConfig = () => {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    // Admin users get only the dashboard option
    return [
      {
        title: 'admin dashboard',
        path: '/dashboard/app',
        icon: icon('ic_dashboard'),
      },
    ];
  } else {
    // Non-admin users get the full set of options
    return [
      {
        title: 'dashboard',
        path: '/dashboard/app',
        icon: icon('ic_dashboard'),
      },
      {
        title: 'workouts',
        path: '/dashboard/workouts',
        icon: icon('ic_workout'),
      },
      {
        title: 'record calories',
        path: '/dashboard/RecordCalories',
        icon: icon('ic_calories'),
      },
      {
        title: 'record weight',
        path: '/dashboard/record-weight',
        icon: icon('ic_weight'),
      },
    ];
  }
};

export default useNavConfig;
