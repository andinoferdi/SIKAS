import { useQuery } from "@tanstack/react-query"
import { userService } from "@/services"

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: () => userService.getCurrentUser(),
  })
}
