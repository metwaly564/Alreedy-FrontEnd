import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import Footer from '../Footer/Footer';
import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../Context/UserContext';
import SelectNavbar from '../SelectNavbar/SelectNavbar';
import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import StaticFooter from '../StaticFooter/StaticFooter';

const Layout = ({ children }) => {
  const { userlogin } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SelectNavbar />
      
      {/* المحتوى الرئيسي */}
      <main className="flex-1">
        <Outlet />
        {children}
      </main>
      {/* الترتيب الصحيح للعناصر السفلية */}
      <Footer />
      <StaticFooter />
      <WhatsAppChat />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;