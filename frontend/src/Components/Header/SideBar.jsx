import React from "react";
import {
  FaCanadianMapleLeaf,
  FaCommentMedical,
  FaFile,
  FaHome,
  FaLock,
  FaPortrait,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUserAction } from "../../Actions/userActions";
import { useAlert } from "react-alert";
const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alert = useAlert();
  const handleLogOut = () => {
    dispatch(logoutUserAction());
    navigate("/");
    alert.success("LogOut Successfully");
  };
  return (
    <>
      <div className="my-auto  -left-60 content-center -mt-20   fixed h-full w-80 hover:translate-x-36 transform transition ease-in-out duration-500 sm:duration-700  ">
        <div className="container  hover:backdrop-blur-3xl  m-2 ring-1 ring-[#15040488] rounded-lg size-auto pr-5 flex flex-col gap-2 items-end mr-4 scroll-my-52  ">
          <Link
            to="/"
            className="text-3xl my-3 grid-cols-2  gap-x-5 flex hover:text-[#140d0744] "
          >
            <span className="text-xl mx-6 ">home</span>
            <FaHome />
          </Link>
          <hr className="border-t-2 w-full border-[#15040488]    max-w-full " />
          <Link
            to="/"
            className="text-3xl my-3 flex grid-cols-2 gap-x-5  hover:text-[#140d0744] "
          >
            <span className="text-xl ">Appointment</span>
            <FaFile />
          </Link>
          <hr className="border-t-2 w-full border-[#15040488]    max-w-full " />
          <Link
            to="/"
            className="text-3xl my-3  grid-cols-2 gap-x-5 flex hover:text-[#140d0744] "
          >
            <span className="text-xl ">Apply Doctor</span>
            <FaPortrait />
          </Link>
          <hr className="border-t-2 w-full border-[#15040488]    max-w-full " />
          <button
            onClick={handleLogOut}
            className="text-3xl my-3  grid-cols-2 gap-x-5 flex hover:text-[#140d0744] "
          >
            <span className="text-xl mx-6 ">LogOut</span>
            <FaLock />
          </button>
        </div>
      </div>
    </>
  );
};

export default SideBar;
