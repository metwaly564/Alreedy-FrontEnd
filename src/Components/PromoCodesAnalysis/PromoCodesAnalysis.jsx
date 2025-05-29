import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const PromoCodesAnalysis = () => {
  const navigate = useNavigate();
  
  // Get token from localStorage
  const [token, setToken] = useState('');
  const [promoCodes, setPromoCodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchColumn, setSearchColumn] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { title: "Code", key: "code" },
    { title: "Name", key: "name" },
    { title: "Is Active", key: "isActive" },
    { title: "Discount Type", key: "discountType" },
    { title: "Value", key: "value" },
    { title: "Usage Count", key: "usageCount" },
    { title: "Total Discount", key: "totalDiscountGiven" },
    { title: "Budget", key: "budget" },
    { title: "Current Budget", key: "currentBudget" },
    { title: "Expiration Date", key: "expirationDate" }
  ];

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setToken(userToken);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchPromoCodes = async () => {
    try {
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `https://reedyph.com/api/v1/promocodes/promocode-analysis?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            "Access-Token": token
          }
        }
      );

      if (!response.ok) {
        throw new Error(`https error! status: ${response.status}`);
      }

      const data = await response.json();
      setPromoCodes(data.analytics); // Changed from data.promoCodes to data.analytics
      setTotalPages(Math.ceil(data.summary.totalPromoCodes / limit));
      setError(null);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      setError(error.message);
      if (error.message.includes('401')) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPromoCodes();
    }
  }, [currentPage, limit, token]);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleSearch = () => {
    setCurrentPage(1);
    fetchPromoCodes();
  };

  if (!token) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-red-500 dark:text-red-400">
          Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans -mt-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Promo Codes Analysis</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-6 flex items-center">
            <label htmlFor="searchColumn" className="mr-2 text-sm text-gray-700">
              Search by:
            </label>
            <select
              id="searchColumn"
              className="bg-white border border-gray-300 text-gray-900 rounded-lg p-2 mr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchColumn}
              onChange={(e) => setSearchColumn(e.target.value)}
            >
              {columns.map((col, index) => (
                <option key={col.key} className='font-alexandria font-light' value={index}>{col.title}</option>
              ))}
            </select>
            <input
              type="text"
              id="columnSearchInput"
              className="bg-white border border-gray-300 text-gray-900 rounded-lg p-2 mr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search value"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Search
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {promo.isActive ? "Yes" : "No"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.discountType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.usageCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.totalDiscountGiven}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {promo.budget ?? "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {promo.currentBudget ?? "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {promo.expirationDate ? new Date(promo.expirationDate).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <label htmlFor="limitSelect" className="mr-2 text-sm text-gray-700">
                    Rows per page:
                  </label>
                  <select
                    id="limitSelect"
                    className="bg-white border border-gray-300 text-gray-900 rounded-lg p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[5, 10, 20, 50].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoCodesAnalysis;