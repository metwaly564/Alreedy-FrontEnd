import React, { useState, useEffect, useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../Context/UserContext';

export default function VerifyOTP() {
  const { TempPhone, isArabic } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();

  // Translation objects
  const translations = {
    title: isArabic ? "تحقق من الكود" : "Verify OTP",
    subtitle: isArabic ? "لقد أرسلنا كود التحقق إلى" : "We've sent an OTP to",
    otpPlaceholder: isArabic ? "أدخل الكود المكون من 6 أرقام" : "Enter 6-digit OTP",
    otpError: isArabic ? "الكود مطلوب" : "OTP is required",
    otpInvalid: isArabic ? "يجب أن يكون الكود 6 أرقام" : "OTP must be 6 digits",
    resendButton: isArabic ? "إعادة إرسال الكود" : "Resend OTP",
    resending: isArabic ? "جاري إعادة الإرسال..." : "Resending...",
    resendCountdown: isArabic ? "إعادة الإرسال خلال" : "Resend OTP in",
    verifyButton: isArabic ? "تحقق من الكود" : "Verify OTP",
    verifying: isArabic ? "جاري التحقق..." : "Verifying...",
    successMessage: isArabic ? "تم التحقق بنجاح!" : "Verification successful!",
    resendSuccess: isArabic ? "تم إرسال كود جديد إلى هاتفك" : "New OTP sent to your phone",
    phoneNotFound: isArabic ? "رقم الهاتف غير موجود" : "Phone number not found",
    verificationFailed: isArabic ? "فشل التحقق من الكود" : "Failed to verify OTP",
    resendFailed: isArabic ? "فشل إعادة إرسال الكود" : "Failed to resend OTP",
    invalidOtp: isArabic ? "الكود غير صالح" : "Invalid OTP",
    backToLogin: isArabic ? "العودة لتسجيل الدخول" : "Back to login"
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(30);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .matches(/^[0-9]{6}$/, translations.otpInvalid)
      .required(translations.otpError),
  });

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      
      try {
        const response = await axios.post(
          'https://reedyph.com/api/v1/auth/signupVerefy', 
          {
            otp: values.otp,
            phone: TempPhone
          }
        );

        localStorage.setItem('userToken', response.data.accessToken);
        toast.success(translations.successMessage);
        navigate('/');
      } catch (error) {
        const apiErrorMessage = error.response?.data?.message;
        let errorMessage;

        if (apiErrorMessage === "Invalid OTP") {
          errorMessage = translations.invalidOtp;
        } else {
          errorMessage = translations.verificationFailed;
        }

        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResendOTP = async () => {
    if (!TempPhone) {
      toast.error(translations.phoneNotFound);
      return;
    }

    setIsResending(true);
    
    try {
      await axios.post('https://reedyph.com/api/v1/auth/resend-otp', {
        phone: TempPhone
      });
      
      toast.success(translations.resendSuccess);
      setResendDisabled(true);
    } catch (error) {
      const apiErrorMessage = error.response?.data?.message;
      let errorMessage;

      if (apiErrorMessage === "Invalid OTP") {
        errorMessage = translations.invalidOtp;
      } else {
        errorMessage = translations.resendFailed;
      }

      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 py-2">
            {translations.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {translations.subtitle} {TempPhone || (isArabic ? 'رقم هاتفك' : 'your phone number')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="otp" className="sr-only">{translations.otpPlaceholder}</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm ${isArabic ? "text-right" : "text-left"}`}
                placeholder={translations.otpPlaceholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.otp}
                dir={isArabic ? "rtl" : "ltr"}
              />
              {formik.touched.otp && formik.errors.otp ? (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>
                  {formik.errors.otp}
                </p>
              ) : null}
            </div>
          </div>

          <div className={`flex items-center justify-between ${isArabic ? "flex-row-reverse" : ""}`}>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendDisabled || !TempPhone || isResending}
              className="text-sm font-medium text-red-600 hover:text-red-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600 inline" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {translations.resending}
                </>
              ) : resendDisabled ? (
                `${translations.resendCountdown} ${countdown}s`
              ) : (
                translations.resendButton
              )}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {translations.verifying}
                </>
              ) : translations.verifyButton}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link 
            to="/login" 
            className="font-medium text-red-600 hover:text-red-500"
          >
            {translations.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}