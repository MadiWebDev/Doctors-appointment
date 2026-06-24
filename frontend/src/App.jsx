import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./Components/User/SignUp";
import Login from "./Components/User/Login";
import Footer from "./Components/Footer/Footer";
import NavBar from "./Components/NavBar/NavBar";
import { loadUserAction } from "./Actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { Store } from "./Store";
import SideBar from "./Components/Header/SideBar";
import Account from "./Components/User/Account";
import Home from "./Components/Home/Home";
import ProtectedRoute from "./ProtectedRoute";
import ProfileUpdate from "./Components/User/ProfileUpdate";
import ErrorPage from "./Components/ErrorPage";
import { FaWhatsapp } from "react-icons/fa";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const UpdateProfile = ProtectedRoute(ProfileUpdate);
  //   useEffect(() => {
  //     Store.dispatch(loadUserAction());

  // } , [Store , dispatch  ]);
  return (
    <div className="bg-gradient-to-tl to-[#c8c4c1] from-[#c2c7c4] via-[#d0cdcd] h-full w-full ">
      <Router>
        <div className="my-auto content-center items-center p-2 right-12 rounded-full bottom-12 bg-green-400 fixed hover:bg-green-500 ">
          <Link
            to="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="text-6xl flex text-center  text-green-700 hover:text-green-800  "
          >
            <FaWhatsapp />
          </Link>
        </div>
        <NavBar />
        {isAuthenticated && <SideBar />}
        <Routes>
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/" element={<Home />} />
          <Route path="/logIn" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile/update" element={<ProfileUpdate />} />
          <Route path="/*" element={<ErrorPage />} />
        </Routes>
        {isAuthenticated && <Footer />}
      </Router>
    </div>
  );
}

export default App;
