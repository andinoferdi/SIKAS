import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  searchOpen: boolean
  dropdownOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setDropdownOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  dropdownOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setDropdownOpen: (open) => set({ dropdownOpen: open }),
}))
