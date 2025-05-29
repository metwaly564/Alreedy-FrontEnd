import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../Context/UserContext';
import logo from "../../assets/Alreedy.png";

export default function ForgotPassword() {
  const { TempPhone, setTempPhone, isArabic } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [Apierror, setApierror] = useState("");
  const navigate = useNavigate();

  // Translation objects
  const translations = {
    title: isArabic ? "نسيت كلمة المرور" : "Forgot Password",
    subtitle: isArabic ? "أدخل رقم هاتفك لاستلام كود التحقق" : "Enter your phone number to receive reset OTP",
    phoneLabel: isArabic ? "رقم الهاتف" : "Phone Number",
    phoneError: isArabic ? "رقم الهاتف مطلوب" : "Phone number is required",
    phoneInvalid: isArabic ? "رقم هاتف مصري غير صالح" : "Invalid Egyptian phone number",
    sendOtpButton: isArabic ? "إرسال الكود" : "Send OTP",
    sendingOtp: isArabic ? "جاري إرسال الكود..." : "Sending OTP...",
    otpSent: isArabic ? "تم إرسال الكود إلى هاتفك" : "OTP sent to your phone",
    otpFailed: isArabic ? "فشل إرسال الكود" : "Failed to send OTP",
    userNotFound: isArabic ? "المستخدم غير موجود" : "User not found",
    rememberPassword: isArabic ? "تذكرت كلمة المرور؟ سجل الدخول" : "Remember your password? Sign in"
  };

  const validationSchema = Yup.object().shape({
    phone: Yup.string()
      .matches(/^01[0125][0-9]{8}$/, translations.phoneInvalid)
      .required(translations.phoneError),
  });

  const formik = useFormik({
    initialValues: {
      phone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      
      try {
        await axios.post('https://reedyph.com/api/v1/auth/forgetSend', {
          phone: values.phone
        });
        
        // Store the phone number in TempPhone state before navigation
        setTempPhone(values.phone);
        toast.success(translations.otpSent);
        navigate('/ForgetPassVerifyOtp');
      } catch (error) {
        const apiErrorMessage = error.response?.data?.message;
        let errorMessage;

        if (apiErrorMessage === "User not found") {
          errorMessage = translations.userNotFound;
        } else {
          errorMessage = translations.otpFailed;
        }

        setApierror(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-32 h-auto mb-4" alt="Company Logo" />
          <h2 className="text-center text-xl font-bold tracking-tight text-gray-900">
            {translations.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {translations.subtitle}
          </p>
        </div>

        {Apierror && (
          <div className="p-3 rounded-lg w-full text-white font-bold text-sm sm:text-base bg-red-600 text-center">
            {Apierror}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.phoneLabel}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.touched.phone && formik.errors.phone ? (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.phone}</p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                {translations.sendingOtp}
              </>
            ) : (
              translations.sendOtpButton
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            {translations.rememberPassword}
          </Link>
        </div>
      </div>
    </div>
  );
}