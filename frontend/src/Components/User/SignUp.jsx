import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import { clearErrors, registerUserAction } from "../../Actions/userActions";
const SignUp = () => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.user
  );
  // const [email, setEmail] = useState("");
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   switch (name) {
  //     case "email":
  //       setEmail(value);
  //       break;
  //     case "username":
  //       setUsername(value);
  //       break;
  //     case "password":
  //       setPassword(value);
  //       break;
  //     case "confirmPassword":
  //       setConfirmPassword(value);
  //       break;
  //     default:
  //       console.error(`Unknown input field: ${name}`);
  //   }
  // };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Invalid email address";
  };

  const validateUsername = (username) => {
    return username.length < 3 || username.length > 20
      ? "Username must be between 3-20 characters"
      : "";
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/;
    return passwordRegex.test(password)
      ? ""
      : "Password must be at least 8 characters long,includes aatleast one special character  (a-z) , (A-Z) , @!  ";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    return password !== confirmPassword ? "Passwords do not match" : "";
  };

  const validateForm = () => {
    const newErrors = {
      email: validateEmail(email),
      username: validateUsername(username),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateForm();
    let userData = new FormData(e.target);
    // userData.append("email", email);
    // userData.append("username", username);
    // userData.append("password", password);
    // userData.append("confirmPassword", confirmPassword);
let formObj = Object.fromEntries(userData.entries())

    dispatch(registerUserAction(formObj));
    console.log(formObj)
    alert.success("Registration successful");
    navigate("/");
  };
  useEffect(() => {
    validateForm();
    if (error) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message
          : error.message;
      alert.error(errorMessage);
      dispatch(clearErrors());
    }

    if (isAuthenticated) {
      navigate("/");
    }
  }, [
    // email,
    // username,
    // password,
    // confirmPassword,
    dispatch,
    alert,
    error,
    navigate,
    isAuthenticated,
  ]);

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gradient-to-br from-[#c1bcb8] to-[#54452b] via-[#c2bab2] rounded-xl shadow-2xl overflow-hidden p-8 space-y-8">
          <div>
            <img
              src="/sethoscope.jpeg"
              alt=""
              className="mx-auto h-auto w-auto mix-blend-color-burn"
            />
          </div>
          <h2 className="mt-6 text-center text-4xl font-serif text-gray-900">
            Create your account
          </h2>
          <p className="text-center text-gray-600">
            Sign up to start your experience
          </p>
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                 // value={email}
                  //onChange={handleInputChange}
                  placeholder="Email address"
                  autoComplete="email"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-700 rounded-t-md focus:ring-[#c2bab2] focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-[#624222]"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby="email-error"
                />
                {errors.email && (
                  <p id="email-error" className="text-[#65553e] font-bold ">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  //value={username}
                  //onChange={handleInputChange}
                  placeholder="Username"
                  autoComplete="username"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-700 rounded-t-md focus:ring-[#c2bab2] focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-[#624222]"
                  aria-invalid={errors.username ? "true" : "false"}
                  aria-describedby="username-error"
                />
                {errors.username && (
                  <p id="username-error" className="text-[#65553e] font-bold ">
                    {errors.username}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                 // value={password}
                 // onChange={handleInputChange}
                  placeholder="Password"
                  autoComplete="password"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-700 rounded-t-md focus:ring-[#c2bab2] focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-[#624222]"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby="password-error"
                />
                {errors.password && (
                  <p id="password-error" className="text-[#65553e] font-bold ">
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                 // value={confirmPassword}
                 // onChange={handleInputChange}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-700 rounded-t-md focus:ring-[#c2bab2] focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-[#624222]"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby="confirmPassword-error"
                />
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-[#65553e] font-bold "
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8b5b64] hover:bg-[#7e3e4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2bab2] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Loading..." : "Sign up"}
              </button>
            </div>
          </form>
          <div>
            <div className="text-center text-gray-900">
              Already have an account?
              <Link to="/logIn" className="text-[#65553e] hover:underline ml-2">
                LogIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
