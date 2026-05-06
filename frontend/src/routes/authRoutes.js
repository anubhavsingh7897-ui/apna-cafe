import AuthPage from '../components/AuthPage';
import RoleRedirect from './RoleRedirect';

export default function AuthRoutes({ auth, onAuth, apiRequest }) {
  if (auth) {
    return <RoleRedirect auth={auth} />;
  }

  return <AuthPage onAuth={onAuth} apiRequest={apiRequest} />;
}
