import apiClient from "./axios";

// Define the User interface for frontend usage
export interface User {
    name: string;
    email: string;
    role: "admin" | "hr" | "user";
}

interface UpdateUserPayload {
    name?: string;
    email?: string;
    role?: "admin" | "hr" | "user";
  }

// Define the UserResponse interface (Returned from backend)
export interface UserResponse {
    _id: string;
    name: string;
    email: string;
    isDelete: boolean;
    role: "admin" | "hr" | "user";
    createdAt: string;
}

// Define the response structure for paginated data
export interface GetAllUsersResponse {
    users: UserResponse[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
}

// Create a new user API call
export const createUser = async (data: User) => {
    const response = await apiClient.post("/auth/create-user", data);
    return response.data;
};

// Fetch users with pagination support
// export const getAllUsers = async (page = 1, limit = 10): Promise<GetAllUsersResponse> => {
//     const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
//     return response.data;
// };
export const getAllUsers = async (page = 1, limit = 10, filters: { name?: string; email?: string; status?: string, role?: string }): Promise<GetAllUsersResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (filters.name) params.append("name", filters.name);
    if (filters.email) params.append("email", filters.email);
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.role && filters.role !== "all") params.append("role", filters.role);
    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
};

export const toggleUserStatus = async (id: string): Promise<UserResponse> => {
    const response = await apiClient.put(`/users/${id}/toggle-status`);
    return response.data.user;
};

export const updateUser = async (userId: string, data: UpdateUserPayload) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };