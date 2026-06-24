import React from "react";
import { FaFonticonsFi } from "react-icons/fa";
import {useSelector} from 'react-redux'
import { IoIosNotifications } from "react-icons/io";
import {Link} from 'react-router-dom'
const NavBar = () => {
  const {user} = useSelector((state) => state.user)
  const handleUserDetails = () => {

  }
  return (
    <div className=" sm:hidden lg:block  ">
      <header className="bg-gradient-to-r from-[#a88d68] to-[#aca278] via-[#7a684d]  ">
        <nav
          className=" flex  max-w-full items-center justify-between lg:p-12 h-10 lg:px-auto"
          aria-label="Global"
        >
          <div className="  mx-6 flex-shrink-0   lg:mr-32 ">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-20 w-auto mix-blend-color-burn "
                src="/sethoscope.jpeg"
                alt=""
              />
            </a>
          </div>

          {/* <div className=" grid grid-flow-col-dense flex-grow justify-center  md:space-x-20 lg:mx-auto    ">
            <div className="" >

            <a
              href="/contact"
              className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:text-[#7e3e4a]"
            >
              contact
            </a>
            </div>
            <div>

            <a
              href="/contact"
              className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:text-[#7e3e4a]"
            >
              contact
            </a>
            </div>
            <div>

            <a
              href="/contact"
              className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:text-[#7e3e4a]"
            >
              contact
            </a>
            </div>
            <div>

            <a
              href="/contact"
              className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:text-[#7e3e4a]"
            >
              contact
            </a>
            </div>
           
          </div> */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-end">
            {user  ?<div className="flex items-center " > <Link to="/account"  className="text-lg p-2.5 underline rounded-md font-semibold leading-6 text-gray-900 hover:text-[#7e3e4a]"
            onClick={handleUserDetails} >{user.username}</Link> <button className="text-3xl text-gray-900 hover:text-[#7e3e4a]"><IoIosNotifications/> </button>  </div> :(

            <a
              href="/logIn"
              className="text-sm p-2.5  rounded-md font-semibold leading-6 text-gray-900 hover:text-[#7e3e4a]"
            >
              Log In <span aria-hidden="true">&rarr;</span>
            </a>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;

