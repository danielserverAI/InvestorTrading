import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  createUser: (userData: any) => Promise<User>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: ["/api/users/me"],
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/users/me"], data);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await apiRequest("PATCH", "/api/users/me", userData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/users/me"], data);
    },
  });

  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      queryClient.setQueryData(["/api/users/me"], null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Create a user
  const createUser = async (userData: any): Promise<User> => {
    return createUserMutation.mutateAsync(userData);
  };

  // Update a user
  const updateUser = async (userData: Partial<User>): Promise<User> => {
    return updateUserMutation.mutateAsync(userData);
  };

  const value = {
    user: user || null,
    isLoading,
    error: error as Error | null,
    createUser,
    updateUser,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
