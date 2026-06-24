
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Components/Loader';

const ProtectedRoute = (  Component ,isAdmin) => {
    //const Navigate = useNavigate()
 return (props) => {
    const { loading, user, isAuthenticated ,  } = useSelector(state => state.user);

    // If loading, show a loading indicator or fallback content
    if (loading) {
       return <div><Loader/></div>; // Replace with your preferred loading indicator
    }

    if(!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    // If there's an error, redirect to an error page or show an error message
    if (!user) {
       return <Navigate to="/error" replace />; // Replace "/error" with your error handling route
    }
    if (isAdmin === true && user.role !== "admin" ) {
      return <Navigate to="/error" replace />; // Replace "/error" with your error handling route
   }

    // Render the component if authenticated
    return <Component {...props} />;
 };
};

export default ProtectedRoute;
