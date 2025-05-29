import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { UserContext } from '../../Context/UserContext';
import toast from "react-hot-toast";
import logo from "../../assets/Alreedy.png";

export default function Register() {
  const { TempPhone, setTempPhone, isArabic, setuserlogin } = useContext(UserContext);
  const navigate = useNavigate();
  const [Apierror, setApierror] = useState("");
  const [isLoading, setisLoading] = useState(false);

  // Translation objects
  const translations = {
    title: isArabic ? "إنشاء حساب جديد" : "Create your account",
    nameLabel: isArabic ? "الاسم الكامل" : "Full Name",
    nameError: isArabic ? "الاسم مطلوب" : "Name is required",
    nameMin: isArabic ? "يجب أن يكون الاسم 3 أحرف على الأقل" : "Name must be at least 3 characters",
    nameMax: isArabic ? "يجب أن يكون الاسم 20 حرفًا كحد أقصى" : "Name must be at most 20 characters",
    emailLabel: isArabic ? "البريد الإلكتروني" : "Email Address",
    emailError: isArabic ? "البريد الإلكتروني مطلوب" : "Email is required",
    emailInvalid: isArabic ? "بريد إلكتروني غير صالح" : "Invalid email address",
    phoneLabel: isArabic ? "رقم الهاتف" : "Phone Number",
    phoneError: isArabic ? "رقم الهاتف مطلوب" : "Phone number is required",
    phoneInvalid: isArabic ? "رقم هاتف مصري غير صالح" : "Invalid Egyptian phone number",
    passwordLabel: isArabic ? "كلمة المرور" : "Password",
    passwordError: isArabic ? "كلمة المرور مطلوبة" : "Password is required",
    passwordLength: isArabic ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters",
    confirmPasswordLabel: isArabic ? "تأكيد كلمة المرور" : "Confirm Password",
    confirmPasswordError: isArabic ? "يجب تأكيد كلمة المرور" : "Please confirm your password",
    passwordMatchError: isArabic ? "كلمات المرور غير متطابقة" : "Passwords must match",
    registerButton: isArabic ? "تسجيل" : "Register",
    registering: isArabic ? "جاري التسجيل..." : "Registering...",
    successMessage: isArabic ? "تم التسجيل بنجاح! يرجى التحقق من حسابك." : "Registration successful! Please verify your account.",
    loginLink: isArabic ? "هل لديك حساب بالفعل؟ سجل الدخول الآن" : "Already have an account? Login now",
    registrationFailed: isArabic ? "فشل التسجيل. الرجاء المحاولة مرة أخرى." : "Registration failed. Please try again.",
    userAlreadyExist: isArabic ? "المستخدم موجود بالفعل" : "User already exist"
  };

  async function handleregister(values) {
    setisLoading(true);
    try {
      const response = await axios.post(
        "https://reedyph.com/api/v1/auth/signup",
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password
        }
      );
  
      console.log("Registration response:", response.data);
      setTempPhone(values.phone);
      toast.success(translations.successMessage);
      navigate("/VerifyOtp");
    } catch (error) {
      console.error("Registration error:", error.response?.data?.message || error.message);
      const apiErrorMessage = error.response?.data?.message;
      let errorMessage;

      if (apiErrorMessage === "User already exist") {
        errorMessage = translations.userAlreadyExist;
      } else {
        errorMessage = translations.registrationFailed;
      }

      setApierror(errorMessage);
      toast.error(errorMessage);
    } finally {
      setisLoading(false);
    }
  }

  let myvalidation = Yup.object().shape({
    name: Yup.string()
      .min(3, translations.nameMin)
      .max(20, translations.nameMax)
      .required(translations.nameError),
    email: Yup.string()
      .email(translations.emailInvalid)
      .required(translations.emailError),
    phone: Yup.string()
      .matches(/^01[0125][0-9]{8}$/, translations.phoneInvalid)
      .required(translations.phoneError),
    password: Yup.string()
      .min(6, translations.passwordLength)
      .required(translations.passwordError),
    rePassword: Yup.string()
      .oneOf([Yup.ref("password")], translations.passwordMatchError)
      .required(translations.confirmPasswordError),
  });

  let formik = useFormik({
    initialValues: {
      name: "", 
      email: "",
      phone: "",
      password: "",
      rePassword: "",
    },
    validationSchema: myvalidation,
    onSubmit: handleregister,
  });

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-24 h-auto mb-4" alt="Company Logo" />
          <h2 className="text-center text-base font-semibold tracking-tight text-gray-900">
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
            {/* Name Field */}
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.errors.name && formik.touched.name && (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.errors.email && formik.touched.email && (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.phoneLabel}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.errors.phone && formik.touched.phone && (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}>
                {translations.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.errors.password && formik.touched.password && (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.password}</p>
              )}
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
                value={formik.values.rePassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.errors.rePassword && formik.touched.rePassword && (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>{formik.errors.rePassword}</p>
              )}
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
                {translations.registering}
              </>
            ) : (
              translations.registerButton
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            {translations.loginLink}
          </Link>
        </div>
      </div>
    </div>
  );
}