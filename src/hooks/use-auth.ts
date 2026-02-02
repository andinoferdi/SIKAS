import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services"
import { broadcastInvalidation } from "@/lib/utils/broadcast-sync"

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
      queryClient.invalidateQueries({ queryKey: ["user", "current"] })
      broadcastInvalidation([["user", "current"]])
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterInput) => userService.register(input.name, input.pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "current"] })
      broadcastInvalidation([["user", "current"]])
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => userService.logout(),
    onSuccess: () => {
      queryClient.clear()
      broadcastInvalidation([["user", "current"], ["transactions"], ["summary"]])
    },
  })
}
