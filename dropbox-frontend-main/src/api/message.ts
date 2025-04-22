import apiClient from "./axios";

export interface MessageRequest {
    subject: string;
    message: string;
    type: "issue" | "idea";
    file?: File[] | null;
}

export interface MessageResponse {
    _id: string;
    title: string;
    status: "pending" | "resolved";
    description: string;
    type: "issue" | "idea";
    image: string;
    createdAt: string;
    filePath: string[];
}

// Define the response structure for paginated data
export interface GetAllMessagesResponse {
    messages: MessageResponse[];
    totalPages: number;
    currentPage: number;
    totalMessages: number;
}

// Send a new message API call
export const sendMessage = async (data: MessageRequest) => {
    try {
        const formData = new FormData();
        formData.append("title", data.subject);
        formData.append("description", data.message);
        formData.append("type", data.type);

        if (data.file) {
            data.file.forEach((file: File) => {
                formData.append("files", file, file.name); 
                console.log(`Appended file: ${file.name}, type: ${file.type}`);
            });
        }

        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const response = await apiClient.post("/messages/sendMessages", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error: any) {
        console.error("Error sending message:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
        }
        throw new Error("Failed to send message. Please try again later.");
    }
};

// Fetch messages with pagination & filters
export const getMessages = async (
  page = 1,
  limit = 10,
  filters?: { title?: string; type?: string; status?: string }
): Promise<GetAllMessagesResponse> => {
  const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
  });

  if (filters?.title) params.append("title", filters.title);
  if (filters?.type && filters.type !== "all") params.append("type", filters.type); // ✅ Ignore "all"
  if (filters?.status && filters.status !== "all") params.append("status", filters.status); // ✅ Ignore "all"

  try {
      const response = await apiClient.get(`/messages/getMessages?${params.toString()}`);
      return response.data;
  } catch (error) {
      console.error("Error getting messages:", error);
      throw new Error("Failed to get messages. Please try again later.");
  }
};


export const resolveMessage = async (id: string): Promise<MessageResponse> => {
  try {
      const response = await apiClient.put(`/messages/updateMessages/${id}`);
      return response.data.messages;
  } catch (error) {
      console.error("Error resolving message:", error);
      throw new Error("Failed to resolve message. Please try again.");
  }
};