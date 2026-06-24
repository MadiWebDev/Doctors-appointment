import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import { useParams } from "react-router-dom";
import { clearErrors, resetPasswordAcion } from "../../Actions/userActions";
import Loader from "../Loader";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { error, success, loading } = useSelector(
    (state) => state.forgetPassword
  );
  const alert = useAlert();

  const [formState, setFormState] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const updatePasswordSubmit = (e) => {
    e.preventDefault();

    // Validate that newPassword and confirmPassword match
    if (formState.password !== formState.confirmPassword) {
      alert.error("Password and Confirm Password do not match");
      return;
    }

    const myForm = new FormData();
    myForm.append("password", formState.password);
    myForm.append("confirmPassword", formState.confirmPassword);

    dispatch(resetPasswordAcion(token, myForm));
  };

  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
    if (success) {
      alert.success("Password reset Successfully");
      navigate("/logIn");
    }
  }, [dispatch, error, alert, success, navigate]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-gradient-to-r from-blue-500 to-purple-200 via-pink-300 rounded-xl shadow-2xl overflow-hidden p-8 space-y-8">
            <div className="">
              <img
                src="/eagle.png"
                alt="Logo"
                className="mx-auto h-10 w-auto mix-blend-color-burn "
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset Password
            </h2>
            <form
              className="mt-8 space-y-6"
              onSubmit={updatePasswordSubmit}
              encType="application/json"
            >
              <div className="space-y-7">
                <input
                  name="password"
                  type="password"
                  autoComplete="password"
                  placeholder="Password"
                  required
                  value={formState.password}
                  onChange={handleInputChange}
                  aria-label="password"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-500 rounded-t-md focus:ring-indigo-500 focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-purple-500"
                />
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="confirm_password"
                  placeholder="Confirm Password"
                  required
                  value={formState.confirmPassword}
                  onChange={handleInputChange}
                  aria-label="Confirm Password"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-500 rounded-t-md focus:ring-indigo-500 focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  value="change"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPassword;
