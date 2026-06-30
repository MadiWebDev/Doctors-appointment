import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/utils/api";

export const createConversation = createAsyncThunk(
  "message/createConversation",
  async (conversationData, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/v1/message/conversations", conversationData);
      return data.conversation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create conversation");
    }
  }
);

export const getUserConversations = createAsyncThunk(
  "message/getConversations",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/message/conversations", { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversations");
    }
  }
);

export const getConversationById = createAsyncThunk(
  "message/getConversationById",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/message/conversations/${conversationId}`);
      return data.conversation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversation");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async ({ conversationId, messageData }, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/v1/message/conversations/${conversationId}/messages`, messageData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

export const getConversationMessages = createAsyncThunk(
  "message/getMessages",
  async ({ conversationId, filters = {} }, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/message/conversations/${conversationId}/messages`, { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch messages");
    }
  }
);

export const markAsRead = createAsyncThunk(
  "message/markAsRead",
  async (messageId, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/message/messages/${messageId}/read`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  "message/markConversationAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/message/conversations/${conversationId}/read-all`);
      return data.conversation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark conversation as read");
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "message/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const { data } = await API.delete(`/v1/message/messages/${messageId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete message");
    }
  }
);

export const editMessage = createAsyncThunk(
  "message/editMessage",
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/message/messages/${messageId}/edit`, { content });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to edit message");
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "message/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/message/unread-count");
      return data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unread count");
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalConversations: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(m => m._id === action.payload._id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User Conversations
      .addCase(getUserConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Conversation By ID
      .addCase(getConversationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
      })
      .addCase(getConversationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Conversation Messages
      .addCase(getConversationMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversationMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
      })
      .addCase(getConversationMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      // Mark Conversation As Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      })
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m._id !== action.payload._id);
      })
      // Edit Message
      .addCase(editMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      // Get Unread Count
      .addCase(getUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentConversation, addMessage, updateMessage } = messageSlice.actions;
export default messageSlice.reducer;
