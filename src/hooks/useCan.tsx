import { useAuth } from "../context/AuthContext";

interface UseCanParams {
  permissions?: string[];
  roles?: string[];
}

export const useCan = ({ permissions = [], roles = [] }: UseCanParams) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  if (permissions.length > 0) {
    const hasAllPermisions = permissions.every((permission) => {
      return user?.permissions.includes(permission);
    });

    if (!hasAllPermisions) return false;
  }

  if (roles.length > 0) {
    const hasAllRoles = roles.some((role) => {
      return user?.roles.includes(role);
    });

    if (!hasAllRoles) return false;
  }

  return true;
};
