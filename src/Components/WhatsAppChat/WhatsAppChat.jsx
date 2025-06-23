import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';

export default function WhatsAppChat() {
    // 1. All hooks first
    const location = useLocation();
    const [scrollOpacity, setScrollOpacity] = useState(0);

    // 2. Event handlers
    const handleWhatsAppClick = () => {
        const phoneNumber = "+201201200016";
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 3. useEffect hook
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight === 0) {
                setScrollOpacity(0);
            } else {
                const percent = Math.min(scrollY / docHeight, 1);
                setScrollOpacity(percent);
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 4. Routes to hide on
    const hiddenFooterRoutes = [
        '/login',
        '/signup',
        '/register',
        '/ForgetPassword',
        '/PasswordReset',
        '/StaffLogin',
        '/AdminEditProducts',
        '/AdminDashboard',
        '/AdminAddProducts',
        '/AdminEditUsers',
        '/AdminEditCities',
        '/AdminEditTags',
        '/ProductsAnalysis',
        '/PromoCodesAnalysis',
        '/UsersAnalysis',
        '/AdminEditDeliveryBoys',
        '/AdminEditPromoCode',
        '/AdminEditCateg',
        '/OperationTeamDashboard',
        '/AdminEditStaff',
        '/AdminSalesDashboard',
        '/EditProduct', 
        '/AdminAddNewPr',
        '/staffLogin',
        '/AdminAddNewPromoCode',
        '/stafflogin',
        '/AdminEditBanners',
        '/ForgetPassVerifyOtp',
        '/AdminReports',
        '/AdminEditCategory',
        '/AdminEditTags',
        '/AdminAddNewTag',
        '/AdminAddNewCat',
        '/EditTag'
    ];

    // 5. Conditional return after all hooks
    return !hiddenFooterRoutes.includes(location.pathname) ? (
        <>
            <button
                onClick={handleWhatsAppClick}
                className="fixed bottom-[12%] lg:bottom-[5vh] right-4 bg-red-600 hover:bg-red-600 text-white w-12 h-12 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center overflow-hidden"
                aria-label="Chat with us"
            >
                <i className="fas fa-comments text-xl overflow-hidden"></i>
            </button>
            <button
                onClick={handleScrollToTop}
                style={{
                    opacity: scrollOpacity,
                    transition: 'opacity 0.4s',
                }}
                className="fixed bottom-[12%] lg:bottom-[5vh] left-4 bg-red-600 hover:bg-red-600 text-white w-12 h-12 rounded-full shadow-lg z-50 flex items-center justify-center overflow-hidden"
                aria-label="Scroll to top"
            >
                <FaArrowUp className="text-xl overflow-hidden" />
            </button>
        </>
    ) : null;
}
