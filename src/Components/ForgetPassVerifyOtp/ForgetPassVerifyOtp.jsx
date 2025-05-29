import React, { useState, useEffect, useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../../Context/UserContext';
import logo from "../../assets/Alreedy.png";

export default function ForgetPassVerifyOtp() {
  const { TempPhone, TempOtp, setTempOtp, isArabic } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [Apierror, setApierror] = useState("");
  const navigate = useNavigate();

  // Translation objects
  const translations = {
    title: isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password",
    subtitle: isArabic ? "لقد أرسلنا كود التحقق إلى" : "We've sent an OTP to",
    otpLabel: isArabic ? "كود التحقق" : "OTP Code",
    otpPlaceholder: isArabic ? "أدخل الكود المكون من 6 أرقام" : "Enter 6-digit OTP",
    otpError: isArabic ? "الكود مطلوب" : "OTP is required",
    otpInvalid: isArabic ? "يجب أن يكون الكود 6 أرقام" : "OTP must be 6 digits",
    resendButton: isArabic ? "إعادة إرسال الكود" : "Resend OTP",
    resending: isArabic ? "جاري إعادة الإرسال..." : "Resending...",
    resendCountdown: isArabic ? "إعادة الإرسال خلال" : "Resend OTP in",
    verifyButton: isArabic ? "تحقق من الكود" : "Verify OTP",
    verifying: isArabic ? "جاري التحقق..." : "Verifying...",
    successMessage: isArabic ? "تم التحقق من الكود بنجاح" : "OTP verified successfully",
    resendSuccess: isArabic ? "تم إرسال كود جديد إلى هاتفك" : "New OTP sent to your phone",
    phoneNotFound: isArabic ? "رقم الهاتف غير موجود" : "Phone number not found",
    verificationFailed: isArabic ? "فشل التحقق من الكود" : "Failed to verify OTP",
    resendFailed: isArabic ? "فشل إعادة إرسال الكود" : "Failed to resend OTP",
    invalidOrExpiredOtp: isArabic ? "الكود غير صالح أو منتهي الصلاحية" : "Invalid or expired OTP",
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
        await axios.post(
          'https://reedyph.com/api/v1/auth/forgetVerefy', 
          {
            phone: TempPhone,
            otp: values.otp
          }
        );
        
        setTempOtp(values.otp);
        toast.success(translations.successMessage);
        navigate('/PasswordReset');
      } catch (error) {
        const apiErrorMessage = error.response?.data?.message;
        let errorMessage;

        if (apiErrorMessage === "Invalid or expired OTP") {
          errorMessage = translations.invalidOrExpiredOtp;
        } else {
          errorMessage = translations.verificationFailed;
        }

        setApierror(errorMessage);
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
      await axios.post('https://reedyph.com/api/v1/auth/forgetSend', {
        phone: TempPhone
      });
      
      toast.success(translations.resendSuccess);
      setResendDisabled(true);
    } catch (error) {
      const apiErrorMessage = error.response?.data?.message;
      let errorMessage;

      if (apiErrorMessage === "Invalid or expired OTP") {
        errorMessage = translations.invalidOrExpiredOtp;
      } else {
        errorMessage = translations.resendFailed;
      }

      setApierror(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-32 h-auto mb-4" alt="Company Logo" />
          <p className="mt-2 text-sm text-gray-600 text-center">
            {translations.subtitle} {TempPhone || (isArabic ? 'رقم هاتفك' : 'your phone number')}
          </p>
        </div>

        {Apierror && (
          <div className="p-3 rounded-lg w-full text-white font-bold text-sm positief sm:text-base bg-red-600 text-center">
            {Apierror}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="otp" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.otpLabel}
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                required
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
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
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  {translations.resending}
                </>
              ) : resendDisabled ? (
                `${translations.resendCountdown} ${countdown}s`
              ) : (
                translations.resendButton
              )}
            </button>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                {translations.verifying}
              </>
            ) : (
              translations.verifyButton
            )}
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