import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { Link, useNavigate , useLocation } from "react-router-dom";
import { clearErrors, loginUserAction } from "../../Actions/userActions";


function Login() {
  const dispatch = useDispatch();
  const alert = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading,  isAuthenticated,  error } = useSelector(
    (state) => state.user
  );

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    error: null,
  });

  const handleInputChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formState;
    if (!email || !password) {
      alert.error("Please fill in all fields");
      return;
    }
    dispatch(loginUserAction(email, password));
  };
const Redirect = location.search ? location.search.split("=")[1] : "/";
  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
    if (isAuthenticated) {
      alert.success("Login Successful");
      navigate(Redirect);
    }
  }, [dispatch, error, isAuthenticated, alert, navigate , Redirect]);
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gradient-to-br  from-[#c1bcb8] to-[#b2c2bd] via-[#c2bab2] rounded-xl shadow-2xl overflow-hidden p-8 space-y-8">
        <div>
        <img
                  src="/sethoscope.jpeg"
                  alt=""
                  className="mx-auto h-auto w-auto mix-blend-color-burn "
                />
              </div>
              <h2 className="mt-6 text-center text-4xl font-serif text-gray-900">
              Welcome
                
              </h2>
              <p className="text-center text-gray-600">
              Sign in to your account
              </p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  autoComplete="email"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-700 rounded-t-md focus:ring-[#c2bab2] focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-[#624222]"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  autoComplete
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-700 rounded-t-md focus:ring-[#c2bab2] focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-[#624222]"
                />
              </div>
              <div>
                <div>
                  <button
                    type="submit"
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8b5b64] hover:bg-[#7e3e4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2bab2] ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Log In"}
                  </button>
                </div>
                <div className="text-center text-gray-900">
                  Already have an account?
                  <Link
                    to="/SignUp"
                    className="text-indigo-600 hover:underline ml-2"
                  >
                    SignUp
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
