import React, { useContext, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import toast from "react-hot-toast";
import logo from "../../assets/Alreedy.png";

export default function Login() {
  // 1. All hooks first
  const { setuserlogin, isArabic } = useContext(UserContext);
  const navigate = useNavigate();
  const [Apierror, setApierror] = useState("");
  const [isLoading, setisLoading] = useState(false);

  // Translation objects
  const translations = {
    title: isArabic ? "تسجيل الدخول إلى حسابك" : "Sign in to your account",
    phoneLabel: isArabic ? "رقم الهاتف" : "Phone Number",
    phoneError: isArabic ? "رقم الهاتف مطلوب" : "Phone number is required",
    phoneInvalid: isArabic ? "أدخل رقم هاتف مصري صالح" : "Enter a valid Egyptian phone number",
    passwordLabel: isArabic ? "كلمة المرور" : "Password",
    passwordError: isArabic ? "كلمة المرور مطلوبة" : "Password is required",
    passwordLength: isArabic ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters",
    rememberMe: isArabic ? "تذكرني" : "Remember me",
    forgotPassword: isArabic ? "نسيت كلمة المرور؟" : "Forgot password?",
    signIn: isArabic ? "تسجيل الدخول" : "Sign in",
    signingIn: isArabic ? "جاري تسجيل الدخول..." : "Signing in...",
    orContinue: isArabic ? "أو تابع باستخدام" : "Or continue with",
    googleSignIn: isArabic ? "تسجيل الدخول باستخدام جوجل" : "Sign in with Google",
    noAccount: isArabic ? "ليس لديك حساب؟" : "Don't have an account?",
    registerNow: isArabic ? "سجل الآن" : "Register now",
    cartTransferSuccess: isArabic ? "تم نقل عناصر سلة التسوق الخاصة بك!" : "Your cart items have been transferred!",
    loginSuccess: isArabic ? "تم تسجيل الدخول بنجاح!" : "Login successful!",
    loginFailed: isArabic ? "فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى." : "Login failed. Please try again.",
    cartTransferFailed: isArabic ? "فشل نقل عناصر السلة" : "Failed to transfer cart items",
    wrongPassword: isArabic ? "كلمة المرور غير صحيحة" : "Wrong password",
    userNotExist: isArabic ? "المستخدم غير موجود" : "User Not exist"
  };

  // 2. Formik hook
  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      identifier: Yup.string()
        .required(translations.phoneError)
        .matches(/^01[0125][0-9]{8}$/, translations.phoneInvalid),
      password: Yup.string()
        .min(6, translations.passwordLength)
        .required(translations.passwordError),
    }),
    onSubmit: async (values) => {
      setisLoading(true);
      try {
        const response = await axios.post(
          "https://reedyph.com/api/v1/auth/login",
          {
            identifier: values.identifier,
            password: values.password,
          }
        );

        localStorage.setItem("userToken", response.data.accessToken);
        setuserlogin(response.data.accessToken);

        // Transfer cart items
        try {
          const guestCartItems = JSON.parse(
            localStorage.getItem("cartItems") || "[]"
          );

          if (guestCartItems.length > 0) {
            const itemsToTransfer = guestCartItems.map((item) => {
              const productId = Object.keys(item)[0];
              return { [productId]: item[productId] };
            });

            await axios.post(
              "https://reedyph.com/api/v1/carts/cart",
              { productId: itemsToTransfer },
              { headers: { "Access-Token": response.data.accessToken } }
            );

            localStorage.removeItem("cartItems");
            toast.success(translations.cartTransferSuccess);
          }
        } catch (error) {
          console.error("Error transferring cart items:", error);
          toast.error(translations.cartTransferFailed);
        }

        toast.success(translations.loginSuccess);
        navigate("/");
        window.dispatchEvent(new Event("auth-change"));
      } catch (error) {
        const apiErrorMessage = error.response?.data?.message;
        let errorMessage;

        if (apiErrorMessage === "Wrong password") {
          errorMessage = translations.wrongPassword;
        } else if (apiErrorMessage === "User Not exist") {
          errorMessage = translations.userNotExist;
        } else {
          errorMessage = translations.loginFailed;
        }

        setApierror(errorMessage);
        toast.error(errorMessage);
      } finally {
        setisLoading(false);
      }
    },
  });

  // 3. Event handlers
  const handleGoogleSignIn = useCallback(() => {
    window.location.href = "https://reedyph.com/auth/google";
  }, []);

  // 4. Render
  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6 lg:min-w-[450px] md:min-w-[380px] z-10">
        <div className="flex flex-col items-center">
          <img src={logo} className="w-24 h-auto mb-4" alt="Company Logo" />
          <h2 className="text-center text-base font-semibold tracking-tight text-gray-900 ">
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
            <div>
              <label
                htmlFor="identifier"
                className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}
              >
                {translations.phoneLabel}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formik.values.identifier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 font-medium block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(170,15,18)] focus:border-[rgb(170,15,18)] transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.errors.identifier && formik.touched.identifier && (
                <p
                  className={`mt-1 font-semibold text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}
                  style={{ fontFamily: "Alexandria", fontWeight: 500 }}
                >
                  {formik.errors.identifier}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${isArabic ? "text-right" : "text-left"} text-gray-700`}
              >
                {translations.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(170,15,18)] focus:border-[rgb(170,15,18)] transition-all duration-200 ${isArabic ? "text-right" : "text-left"}`}
                required
              />
              {formik.errors.password && formik.touched.password && (
                <p className={`mt-1 text-sm text-red-600 ${isArabic ? "text-right" : "text-left"}`}>
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className={`flex items-center justify-between flex-wrap gap-2 ${isArabic ? "flex-row-reverse" : ""}`}>
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 font-medium Alexandria-500 text-[rgb(170,15,18)] border-gray-300 rounded focus:ring-[rgb(170,15,18)] transition-colors duration-200 cursor-pointer"
                />
                <label
                  htmlFor="remember_me"
                  className={`ml-1 block text-sm text-gray-700 cursor-pointer`}
                >
                  {translations.rememberMe}
                </label>
              </div>

              <div className="text-sm z-10">
                <Link
                  to="/ForgetPassword"
                  className="font-medium text-[rgb(170,15,18)] hover:text-[rgb(200,15,18)] transition-colors duration-200"
                >
                  {translations.forgotPassword}
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group font-medium relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                {translations.signingIn}
              </>
            ) : (
              translations.signIn
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {translations.orContinue}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span className="sr-only">{translations.googleSignIn}</span>
              <i className={`fa-brands fa-google text-xl overflow-hidden ${isArabic ? "mr-1" : "-mr-1"}`}></i>
              <span className={`${isArabic ? "mr-2" : "ml-2"}`}>Google</span>
            </button>
          </div>
        </div>

        <div className="text-center text-sm">
          <Link
            to="/register"
            className="font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            {translations.noAccount} {translations.registerNow}
          </Link>
        </div>
      </div>
    </div>
  );
}