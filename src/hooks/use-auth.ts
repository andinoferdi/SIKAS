import { useMutation } from "@tanstack/react-query"
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
  return useMutation({
    mutationFn: (input: LoginInput) => userService.login(input.name, input.pin),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => userService.register(input.name, input.pin),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => userService.logout(),
  })
}
