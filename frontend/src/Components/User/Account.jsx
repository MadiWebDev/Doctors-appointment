import React, { useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Loader";
// import Loader from "../../Loader";

const Account = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/logIn");
    }
  }, [isAuthenticated]);

  return (
    <>
    {loading ? (
      <Loader />
    ) : (
      <div className="min-h-screen flex text-center items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-gradient-to-tl from-[#c1bcb8] to-[#54452b] via-[#c2bab2] rounded-xl shadow-2xl overflow-hidden p-8 space-y-8">
            <div>
            <h2 className="text-xl font-bold  ">User Name</h2>
            <div className="flex gap-2 justify-center  ">
              <p>{user.username}</p>
              <Link
                to="/profile/update"
                className="text-[#65553e] hover:underline flex place-items-center gap-1 "
              >
                Edit <FaEdit />
              </Link>
            </div>
          </div>
          <hr className="border-t border-blue-300 my-3 mx-48 md:mx-24 " />
          <div className="mb-6">
          <div className="flex gap-2 justify-center  ">
              <p>{user.email}</p>
              <Link
                to="/profile/update"
                className="text-[#65553e] hover:underline flex place-items-center gap-1 "
              >
                Edit <FaEdit />
              </Link>
            </div>
          </div>
          <hr className="border-t border-blue-300 my-3 mx-48 md:mx-24 " />
          <div className="mb-6">
            <h2 className="text-xl font-bold">Joined At</h2>
            <p>{String(user.createdAt).substring(0, 10)}</p>
          </div>
          <hr className="border-t  border-blue-300 my-3 mx-48 md:mx-24 " />
          <div className="flex justify-center space-x-4">
            <Link
              to="/password/update"
              className="text-[#65553e] hover:underline flex place-items-center gap-1 "
            >
              Change Password <FaEdit/>
            </Link>
          </div>
    </div>
    </div>
      )}
        </>
  );
};

export default Account;
