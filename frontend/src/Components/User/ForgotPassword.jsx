import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { forgotPasswordAction } from "../../Actions/userActions";
import Loader from "../Loader";


const ForgotPassword = () => {
    const dispatch = useDispatch()
    const alert = useAlert()
  const { error, message, loading } = useSelector((state) => state.forgetPassword);
    
 const [email, setEmail] = useState("")


 const forgetPasswordSubmit = (e) => {
    e.preventDefault();
 const myForm = new FormData()
 myForm.append('email' , email)

 dispatch(forgotPasswordAction(myForm))
}
useEffect(() => {
   

    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
    if (message) {
      alert.success("Send Successfully");

      
    }
  }, [dispatch, error, alert, message ]);

  return (
 <> 
      {loading ? (
        <Loader /> 
      ) : (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-gradient-to-tl from-[#c1bcb8] to-[#54452b] via-[#c2bab2] rounded-xl shadow-2xl overflow-hidden p-8 space-y-8">
            <div className="">
              <img
                src="/sethoscope.jpeg"
                alt=""
                className="mx-auto h-auto w-40 mix-blend-color-burn"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Update Profile
            </h2>

            <form
              className="mt-8 space-y-6"
              onSubmit={forgetPasswordSubmit}
              encType="application/json"
            >
             
              <div className="space-y-7">
                <input
                  type="email"
                  placeholder="Email address"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border ring-black ring-2 shadow-2xl placeholder-gray-500 rounded-t-md focus:ring-indigo-500 focus:z-10 sm:text-sm peer h-10 border-b-2 border-gray-300 text-white bg-transparent placeholder-current focus:outline-none focus:border-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                

                <button
                  type="submit"
                  value="send"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ForgotPassword