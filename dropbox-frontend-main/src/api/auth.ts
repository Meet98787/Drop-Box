import Cookies from "js-cookie";
import apiClient from "./axios";

interface LoginData {
    email: string;
    password: string;
}

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "hr" | "user";
    createdAt: string;
}

export const loginUser = async (data: LoginData) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
};
// export const registerUser = async (data: { name: string; email: string; password: string; role: string }) => {
//     const response = await apiClient.post("/auth/register", data);
//     return response.data;
// };

export const logoutUser = async () => {
    try {
      await apiClient.post("/auth/logout"); // ✅ Calls backend logout API
  
      Cookies.remove("token", { path: "/", domain: "localhost" }); // ✅ Ensures token is removed
      Cookies.remove("token");
  
      return true; // ✅ Indicate logout success
    } catch (error) {
      console.error("Logout Failed:", error);
      return false;
    }
  };

export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
};


// forget password
export const sendOTP = async (email: string) => {
  try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
  } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
  }
};

// ✅ Verify OTP
export const verifyOTP = async (email: string, otp: string) => {
  try {
      const response = await apiClient.post("/auth/verify-otp", { email, otp });
      return response.data;
  } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
  }
};

// ✅ Reset Password
export const resetPassword = async (email: string, newPassword: string) => {
  try {
      const response = await apiClient.post("/auth/reset-password", { email, newPassword });
      console.log(response.data);
      return response.data;
  } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
  }
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const response = await apiClient.put("/auth/change-password", { oldPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
