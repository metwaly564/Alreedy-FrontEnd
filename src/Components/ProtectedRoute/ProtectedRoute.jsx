import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children, allowedRules = [] }) {
  const location = useLocation();
  const userToken = localStorage.getItem("userToken");

  if (!userToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(userToken);
    
    // Check if decoded token has the required rule property
    if (!decoded || typeof decoded.rule !== 'string') {
      console.error("Invalid token structure: missing or invalid rule property");
      localStorage.removeItem("userToken");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRule = decoded.rule.toLowerCase(); // Normalize to lowercase

    // Admin has access to everything
    if (userRule === 'admin') return children;
    
    // If no specific rules required, allow access
    if (!allowedRules || allowedRules.length === 0) return children;
    
    // Check if user's rule is allowed (case insensitive)
    const normalizedAllowedRules = allowedRules.map(rule => rule.toLowerCase());
    if (normalizedAllowedRules.includes(userRule)) return children;

    // Redirect to unauthorized page if not allowed
    return <Navigate to="/" state={{ from: location }} replace />;
  } catch (error) {
    console.error("Token error:", error);
    localStorage.removeItem("userToken");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
}



// {This part does not affect the code's logic in the final version of the website,
//  but it is a very useful tool for developers.
//  It tells React: "Listen,
//  the ProtectedRoute component must take a prop called children,
//  and it must take another prop called allowedRoles which must be an array of strings."
//  If any developer uses this component incorrectly
//  (for example, they forget to pass the children),
//  React will show them a warning in the console,
//  and this helps to avoid errors.}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRules: PropTypes.arrayOf(PropTypes.string)
};