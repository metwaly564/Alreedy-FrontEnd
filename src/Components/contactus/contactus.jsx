/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { FaPhone, FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { UserContext } from '../../Context/UserContext';
import { Link } from 'react-router-dom';
import style from './Contactus.module.css';

export default function contactus() {
  const { isArabic } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-40 md:pt-24" style={{ fontFamily: "'Alexandria', sans-serif" }}>
      <div className={`max-w-4xl mx-auto ${isArabic ? 'text-right' : 'text-left'}`}>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-950 mb-4 overflow-hidden p-6 pb-1" style={{ fontFamily: "'Alexandria', sans-serif" }}>
            {isArabic ? 'تواصل معنا' : 'Contact Us'}
          </h1>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
            {/* Contact Information Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-red-950 mb-3 sm:mb-4" style={{ fontFamily: "'Alexandria', sans-serif" }}>
                {isArabic ? 'معلومات الإتصال' : 'Contact Information'}
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 font-light">
                {isArabic ? 'يسعدنا أن تتواصل بنا من خلال خدمة العملاء لسماع المقترحات أو الشكاوي.' : 'We are happy to hear from you through customer service for suggestions or complaints.'}
              </p>

              <div className={`flex items-center mb-3 sm:mb-4 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                {isArabic ? (
                  <div className="flex flex-col items-end"> {/* Add flex-col to stack vertically and items-end to align right */}
                    <span className={`font-semibold text-base sm:text-lg ${isArabic ? 'text-right' : 'text-left'}`}>
                      {isArabic ? 'رقمنا الموحد' : ''}
                    </span>

                    <div className="flex items-center mt-1"> {/* Add mt-1 for a small top margin */}
                      <span className="font-bold text-base sm:text-lg m-1 mr-2">٠١٢٠١٢٠٠٠١٦</span>
                      <FaPhone className={`text-red-950 rotate-90`} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-base sm:text-lg text-left">Hotline:</span>
                      <div className="flex items-center mt-1"> {/* mt-1 adds a small space between the lines */}
                        <FaPhone className="text-red-950 rotate-90 mr-2" />
                        <span className="font-bold text-base sm:text-lg">01201200016</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Social Media Section */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-red-950 mb-3 sm:mb-4" style={{ fontFamily: "'Alexandria', sans-serif" }}>
                {isArabic ? 'تابعنا على' : 'Follow Us'}
              </h3>

              <div className={`flex ${isArabic ? 'justify-end' : 'justify-start'} space-x-3 sm:space-x-4 md:space-x-6`}>
                <a
                  href="https://www.facebook.com/share/1HtdV2U3sX/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-950 hover:text-red-700 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <FaFacebook size={24} className="sm:w-7 sm:h-7" />
                </a>
                <a
                  href="https://www.instagram.com/reedy_pharmacy/profilecard/?igsh=MWx5aHJsZXRpOTdubg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-950 hover:text-red-700 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <FaInstagram size={24} className="sm:w-7 sm:h-7" />
                </a>
                <a
                  href="https://www.tiktok.com/@reedy_pharmacy?_t=ZS-8wKDx2Qfrai&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-950 hover:text-red-700 transition-colors duration-300"
                  aria-label="TikTok"
                >
                  <FaTiktok size={24} className="sm:w-7 sm:h-7" />
                </a>
                <a
                  href="https://wa.me/201201200016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-950 hover:text-red-700 transition-colors duration-300"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={24} className="sm:w-7 sm:h-7" />
                </a>
              </div>
            </div>

            {/* Branches Section */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-red-950 mb-3 sm:mb-4" style={{ fontFamily: "'Alexandria', sans-serif" }}>
                {isArabic ? 'توجه إلى فروعنا' : 'Visit Our Branches'}
              </h3>

              <Link
                to="/branches"
                className="inline-flex items-center text-sm sm:text-base text-red-950 hover:text-red-700 transition-colors duration-300 font-medium"
              >
                {isArabic ? (
                  <>
                    <span className="ml-2">{isArabic ? 'فروعنا' : 'Our Branches'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1">{isArabic ? 'فروعنا' : 'Our Branches'}</span>
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}