import { useSelector } from 'react-redux';
import {
  selectUser,
  selectToken,
  selectRole,
  selectInitialized,
  selectAuthLoading,
  selectIsLoggedIn,
} from '../features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectToken);
  const role = useSelector(selectRole);
  const initialized = useSelector(selectInitialized);
  const loading = useSelector(selectAuthLoading);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return {
    user,
    accessToken,
    role,
    initialized,
    loading,
    isLoggedIn,
  };
};
