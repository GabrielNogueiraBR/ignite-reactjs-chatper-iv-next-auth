import { useAuth } from "../context/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

interface UseCanParams {
  permissions?: string[];
  roles?: string[];
}

export const useCan = ({ permissions = [], roles = [] }: UseCanParams) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  if (!user) return false;

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions;
};
