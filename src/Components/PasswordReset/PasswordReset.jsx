import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../Context/UserContext';
import logo from "../../assets/Alreedy.png";

export default function PasswordReset() {
  const { TempPhone, TempOtp, isArabic } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [Apierror, setApierror] = useState("");
  const navigate = useNavigate();

  // Translation objects
  const translations = {
    title: isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password",
    passwordLabel: isArabic ? "كلمة المرور الجديدة" : "New Password",
    passwordError: isArabic ? "كلمة المرور مطلوبة" : "Password is required",
    passwordLength: isArabic ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters",
    confirmPasswordLabel: isArabic ? "تأكيد كلمة المرور" : "Confirm Password",
    confirmPasswordError: isArabic ? "يجب تأكيد كلمة المرور" : "Please confirm your password",
    passwordMatchError: isArabic ? "كلمات المرور غير متطابقة" : "Passwords must match",
    resetButton: isArabic ? "إعادة تعيين" : "Reset Password",
    resetting: isArabic ? "جاري إعادة التعيين..." : "Resetting...",
    successMessage: isArabic ? "تم إعادة تعيين كلمة المرور بنجاح!" : "Password reset successfully!",
    resetFailed: isArabic ? "فشل إعادة تعيين كلمة المرور" : "Failed to reset password",
    invalidOrExpiredOtp: isArabic ? "الكود غير صالح أو منتهي الصلاحية" : "Invalid or expired OTP",
    backToLogin: isArabic ? "العودة لتسجيل الدخول" : "Back to login"
  };

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, translations.passwordLength)
      .required(translations.passwordError),
    rePassword: Yup.string()
      .oneOf([Yup.ref('password')], translations.passwordMatchError)
      .required(translations.confirmPasswordError),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      rePassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      
      try {
        await axios.post(
          'https://reedyph.com/api/v1/auth/forgetReset', 
          {
            phone: TempPhone,
            otp: TempOtp,
            password: values.password
          }
        );
        
        toast.success(translations.successMessage);
        navigate('/login');
      } catch (error) {
        const apiErrorMessage = error.response?.data?.message;
        let errorMessage;

        if (apiErrorMessage === "Invalid or expired OTP") {
          errorMessage = translations.invalidOrExpiredOtp;
        } else {
          errorMessage = translations.resetFailed;
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
        </div>

        {Apierror && (
          <div className="p-3 rounded-lg w-full text-white font-bold text-sm sm:text-base bg-red-600 text-center">
            {Apierror}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                placeholder={translations.passwordLabel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                dir={isArabic ? "rtl" : "ltr"}
              />
              {formik.touched.password && formik.errors.password ? (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.password}</p>
              ) : null}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="rePassword" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.confirmPasswordLabel}
              </label>
              <input
                id="rePassword"
                name="rePassword"
                type="password"
                required
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                placeholder={translations.confirmPasswordLabel}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.rePassword}
                dir={isArabic ? "rtl" : "ltr"}
              />
              {formik.touched.rePassword && formik.errors.rePassword ? (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.rePassword}</p>
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
                {translations.resetting}
              </>
            ) : translations.resetButton}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            {translations.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}