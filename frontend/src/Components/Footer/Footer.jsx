import React from "react";
import {
  FaAngleUp,
  FaDotCircle,
  FaHome,
  FaLock,
  FaNodeJs,
  FaPoll,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { AiFillProfile } from "react-icons/ai";

function Footer() {
  
  return (
    <div className="my-auto  bottom-0 fixed w-full lg:hidden ">
      <footer
        aria-label="bottom"
        className="bg-gradient-to-r from-[#7a6240] to-[#aca278] via-[#7a684d]   text-gray-900 rounded-lg bottom-auto  px-auto py-auto "
      >
        <div className="container px-aut  mx-auto grid grid-cols-5  m-auto  justify-items-center  ">
          {/* NAVIGATION */}
          <Link to="/" className="text-5xl mt-4 mb-4 hover:text-[#140d0744] ">
            <FaHome />
          </Link>
          <Link to="/" className="text-5xl mt-4 mb-4 hover:text-[#140d0744] ">
            <FaNodeJs />
          </Link>
          <Link to="/" className="text-5xl mt-4 mb-4 hover:text-[#140d0744] ">
            <FaDotCircle />
          </Link>
          <Link to="/" className="text-5xl mt-4 mb-4 hover:text-[#140d0744] ">
            <FaAngleUp />
          </Link>
          <Link to="/account" className="text-5xl mt-4 mb-4  hover:text-[#140d0744] ">
          <AiFillProfile />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
