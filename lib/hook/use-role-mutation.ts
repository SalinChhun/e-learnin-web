import { useQueries } from "@tanstack/react-query";
import roleService from "@/service/role.service";

const useFetchRoles = () => {
  const [roleQuery] = useQueries({
    queries: [
      {
        queryKey: ["users"],
        queryFn: () => roleService.getRoles(),
      },
    ],
  });

  return {
    roleQuery: roleQuery,
  };
};

export const useRoleMutation = {
  useFetchRoles,
};

export default useRoleMutation;
