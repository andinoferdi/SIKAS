import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services"

interface LoginInput {
  name: string
  pin: string
}

interface RegisterInput {
  name: string
  pin: string
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => userService.login(input.name, input.pin),
    onSuccess: () => {
      // Invalidate user query to fetch new user data
      queryClient.invalidateQueries({ queryKey: ["user", "current"] })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterInput) => userService.register(input.name, input.pin),
    onSuccess: () => {
      // Invalidate user query to fetch new user data
      queryClient.invalidateQueries({ queryKey: ["user", "current"] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => userService.logout(),
    onSuccess: () => {
      // Clear all queries to prevent data leakage between users
      queryClient.clear()
    },
  })
}
