/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export let UserContext = createContext();
export default function UserContextProvider(props) {
  const [userlogin, setuserlogin] = useState(localStorage.getItem("userToken") ? localStorage.getItem("userToken") : null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") ? localStorage.getItem("refreshToken") : null);
  const [searchkey, setsearchkey] = useState();
  const [SearchResult, setSearchResult] = useState();
  const [TempPhone, setTempPhone] = useState();
  const [TempOtp, setTempOtp] = useState();
  const [TempSkuID, setTempSkuID] = useState();
  const [TempTagData, setTempTagData] = useState();
  const [TempCatData, setTempCatData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isArabic, setisArabic] = useState(() => {
    const stored = localStorage.getItem("isArabic");
    return stored !== null ? JSON.parse(stored) : true;
  });

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    try {
      const currentRefreshToken = localStorage.getItem("refreshToken");
      if (!currentRefreshToken) return;

      const response = await axios.post("https://reedyph.com/api/v1/auth/refresh-token", {
        refreshToken: currentRefreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update tokens in localStorage and state
      localStorage.setItem("userToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      setuserlogin(accessToken);
      setRefreshToken(newRefreshToken);
    } catch (error) {
      console.error("Error refreshing token:", error);
      // If refresh fails, logout the user
      localStorage.removeItem("userToken");
      localStorage.removeItem("refreshToken");
      setuserlogin(null);
      setRefreshToken(null);
    }
  };

  // Set up axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshAccessToken();
            // Retry the original request with the new token
            originalRequest.headers["Access-Token"] = localStorage.getItem("userToken");
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      setuserlogin(localStorage.getItem("userToken"));
    }
  }, [refreshTrigger]);

  useEffect(() => {
    localStorage.setItem("isArabic", JSON.stringify(isArabic));
  }, [isArabic]);

  return (
    <UserContext.Provider value={{
      userlogin, setuserlogin,
      refreshToken, setRefreshToken,
      searchkey, setsearchkey,
      SearchResult, setSearchResult,
      TempPhone, setTempPhone,
      TempOtp, setTempOtp,
      TempSkuID, setTempSkuID,
      TempTagData, setTempTagData,
      TempCatData, setTempCatData,
      triggerRefresh,
      refreshTrigger, setRefreshTrigger,
      isArabic, setisArabic,
      refreshAccessToken
    }}>
      {props.children}
    </UserContext.Provider>
  );
}