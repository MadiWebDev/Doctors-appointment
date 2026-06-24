import axios from "axios";
import {
  CLEAR_ERROR,
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_FAIL,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REGISTER_USER_FAIL,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  LOAD_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  UPDATE_PROFILE_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PASSWORD_FAIL,
  UPDATE_PASSWORD_REQUEST,
  UPDATE_PASSWORD_SUCCESS,
  FORGET_PASSWORD_REQUEST,
  FORGET_PASSWORD_SUCCESS,
  FORGET_PASSWORD_FAIL,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  ADMIN_ALL_USERS_REQUEST,
  ADMIN_ALL_USERS_SUCCESS,
  ADMIN_ALL_USERS_FAIL,
  ADMIN_UPDATE_PROFILE_REQUEST,
  ADMIN_UPDATE_PROFILE_SUCCESS,
  ADMIN_UPDATE_PROFILE_FAIL,
  ADMIN_DELETE_PROFILE_REQUEST,
  ADMIN_DELETE_PROFILE_SUCCESS,
  ADMIN_DELETE_PROFILE_FAIL,
  ADMIN_SINGLE_USER_REQUEST,
  ADMIN_SINGLE_USER_SUCCESS,
  ADMIN_SINGLE_USER_FAIL,
} from "../Constants/userConstants";

// Helper function to handle errors
const handleError = (failureAction, error) => {
  const errorMessage =
    error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
  return { payload: errorMessage, type: failureAction };
};

// Login user
export const loginUserAction = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(
      "/api/logIn",
      { email, password },
      config
    );
    dispatch({ type: LOGIN_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: LOGIN_FAIL, payload: error.response.data.message });
  }
};


export const registerUserAction = (formData) => async  (dispatch) => {
    try {
    dispatch({ type: REGISTER_USER_REQUEST });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const { data } = await axios.post(`/api/register`, formData, config);
    dispatch({ type: REGISTER_USER_SUCCESS, payload: data });
    // Remove the redirection since it's not recommended to redirect from an action creator
  } catch (error) {
    dispatch({
      type: REGISTER_USER_FAIL,
      payload:
      error.response.data.message
    });
  }
};

export const AdminAllUsersAction = () => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_ALL_USERS_REQUEST });
    const { data } = await axios.get(`/api/admin/allUsers`);
    dispatch({ type: ADMIN_ALL_USERS_SUCCESS, payload: data.users });
  } catch (error) {
    dispatch({
      type: ADMIN_ALL_USERS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
export const AdminSingleUserAction = (id) => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_SINGLE_USER_REQUEST });
    
    const { data } = await axios.get(`/api/admin/user/${id}`);
    dispatch({ type: ADMIN_SINGLE_USER_SUCCESS, payload: data.user });
  } catch (error) {
    dispatch({
      type: ADMIN_SINGLE_USER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
export const AdminUpdateUserAction = (id , userData) => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_UPDATE_PROFILE_REQUEST });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.put(`/api/admin/user/${id}` , userData , config );
    dispatch({ type: ADMIN_UPDATE_PROFILE_SUCCESS, payload: data.success });
  } catch (error) {
    dispatch({
      type: ADMIN_UPDATE_PROFILE_FAIL,
      payload:
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};
export const AdminDelUserAction = (id) => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_DELETE_PROFILE_REQUEST });
    const { data } = await axios.delete(`/api/admin/user/${id}`);
    dispatch({ type: ADMIN_DELETE_PROFILE_SUCCESS, payload: data.success });
  } catch (error) {
    dispatch({
      type: ADMIN_DELETE_PROFILE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// Load user
export const loadUserAction = () => async (dispatch) => {
  try {
    dispatch({ type: LOAD_USER_REQUEST });

    const { data } = await axios.get("/api/details")
    dispatch({ type: LOAD_USER_SUCCESS, payload: data });
  } catch (error) {
    // dispatch(handleError(error, LOAD_USER_FAIL));
    dispatch({ type: LOAD_USER_FAIL, payload:
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message, });
  }
};

// Logout user
export const logoutUserAction = () => async (dispatch) => {
  try {
    dispatch({ type: LOGOUT_REQUEST });
    await axios.get("/api/logout");
    dispatch({ type: LOGOUT_SUCCESS });
  } catch (error) {
    dispatch({ type: LOGOUT_FAIL, payload:
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message, });
  }
};

// Update user profile
export const updateProfileAction = (updatedUser) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PROFILE_REQUEST });
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const { data } = await axios.put(
      "/api/profile/update",
      updatedUser,
      config
    );
    dispatch({ type: UPDATE_PROFILE_SUCCESS, payload: data });
  } catch (error) { 
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update user password
export const updatePasswordAction = (passwordData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PASSWORD_REQUEST });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.put(
      `/api/password/update`,
      passwordData,
      config
    );
    dispatch({ type: UPDATE_PASSWORD_SUCCESS, payload: data.success });
  } catch (error) {
    dispatch({
      type: UPDATE_PASSWORD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

//forgot Password

export const forgotPasswordAction = (email) => async (dispatch) => {
  try {
    dispatch({ type: FORGET_PASSWORD_REQUEST });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(`/api/password/forgot`, email, config);
    dispatch({ type: FORGET_PASSWORD_SUCCESS, payload: data.message });
  } catch (error) {
    dispatch({
      type: FORGET_PASSWORD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

//reset Password

export const resetPasswordAcion =
  ({ token, passwords }) =>
  async (dispatch) => {
    try {
      dispatch({ type: RESET_PASSWORD_REQUEST });

      const config = { headers: { "Content-Type": "application/json" } };

      const { data } = await axios.put(
        `api/password/reset/${token}`,
        passwords,
        config
      );

      dispatch({ type: RESET_PASSWORD_SUCCESS, payload: data.success });
    } catch (error) {
      dispatch({
        type: RESET_PASSWORD_FAIL,
        payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
      });
    }
  };

// Clear errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERROR });
};
