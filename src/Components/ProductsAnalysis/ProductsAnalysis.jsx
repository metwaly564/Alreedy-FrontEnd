import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

function ProductsAnalysis() {
  const { token } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchColumn, setSearchColumn] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);

  const columns = [
    { title: "skuId", key: "skuId" },
    { title: "nameEn", key: "nameEn" },
    { title: "company", key: "company" },
    { title: "priceBefore", key: "priceBefore" },
    { title: "priceAfter", key: "priceAfter" },
    { title: "availableStock", key: "availableStock" },
    { title: "itemRank", key: "itemRank" },
    { title: "productViews", key: "productViews" },
    { title: "productPageOpened", key: "productPageOpened" },
    { title: "cartAdditions", key: "cartAdditions" },
    { title: "timesPurchased", key: "timesPurchased" }
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch(`https://reedyph.com/api/v1/products?page=${currentPage}&limit=${limit}`, {
        headers: {
          "Access-Token": token
        }
      });
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, limit]);

  const handleSearch = () => {
    // Implement search functionality
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 pt-[100vh] ">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Product Data Table</h2>

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
              <option className='font-alexandria font-light' value="0">skuId</option>
              <option className='font-alexandria font-light' value="1">nameEn</option>
              <option className='font-alexandria font-light' value="2">company</option>
              <option className='font-alexandria font-light' value="3">priceBefore</option>
              <option className='font-alexandria font-light' value="4">priceAfter</option>
              <option className='font-alexandria font-light' value="5">availableStock</option>
              <option className='font-alexandria font-light' value="6">itemRank</option>
              <option className='font-alexandria font-light' value="7">productViews</option>
              <option className='font-alexandria font-light' value="8">productPageOpened</option>
              <option className='font-alexandria font-light' value="9">cartAdditions</option>
              <option className='font-alexandria font-light' value="10">timesPurchased</option>
            </select>
            <input
              type="text"
              id="columnSearchInput"
              className="bg-white border border-gray-300 text-gray-900 rounded-lg p-2 mr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search value"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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
                  {products.map((product) => (
                    <tr key={product.skuId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.skuId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.nameEn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.priceBefore}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.priceAfter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.availableStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.itemRank}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.productViews}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.productViews}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.cartAdditions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.timesPurchased || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsAnalysis;