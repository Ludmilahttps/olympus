import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store para autenticação
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (user, tokens) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        set({ user, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        set({ user: { ...currentUser, ...userData } });
      },
    }),
    {
      name: 'olympus-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Store para workspaces
export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  filters: {
    city: '',
    category: '',
    priceRange: [0, 1000],
    amenities: [],
  },
  isLoading: false,
  
  setWorkspaces: (workspaces) => set({ workspaces }),
  
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  
  addWorkspace: (workspace) => {
    const workspaces = get().workspaces;
    set({ workspaces: [workspace, ...workspaces] });
  },
  
  updateWorkspace: (id, updatedData) => {
    const workspaces = get().workspaces;
    const updatedWorkspaces = workspaces.map(workspace =>
      workspace.id === id ? { ...workspace, ...updatedData } : workspace
    );
    set({ workspaces: updatedWorkspaces });
  },
  
  removeWorkspace: (id) => {
    const workspaces = get().workspaces;
    set({ workspaces: workspaces.filter(workspace => workspace.id !== id) });
  },
  
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  
  clearFilters: () => set({
    filters: {
      city: '',
      category: '',
      priceRange: [0, 1000],
      amenities: [],
    }
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));

// Store para trips
export const useTripStore = create((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  
  setTrips: (trips) => set({ trips }),
  
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  
  addTrip: (trip) => {
    const trips = get().trips;
    set({ trips: [trip, ...trips] });
  },
  
  updateTrip: (id, updatedData) => {
    const trips = get().trips;
    const updatedTrips = trips.map(trip =>
      trip.id === id ? { ...trip, ...updatedData } : trip
    );
    set({ trips: updatedTrips });
  },
  
  removeTrip: (id) => {
    const trips = get().trips;
    set({ trips: trips.filter(trip => trip.id !== id) });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));

// Store para categorias
export const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,
  
  setCategories: (categories) => set({ categories }),
  
  addCategory: (category) => {
    set((state) => ({ categories: [...state.categories, category] }));
  },
  
  updateCategory: (id, updatedData) => {
    set((state) => ({
      categories: state.categories.map(category =>
        category.id === id ? { ...category, ...updatedData } : category
      )
    }));
  },
  
  removeCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter(category => category.id !== id)
    }));
  },
  
  setLoading: (isLoading) => set({ isLoading }),
}));

// Store para UI
export const useUIStore = create((set) => ({
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 5000);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
}));

