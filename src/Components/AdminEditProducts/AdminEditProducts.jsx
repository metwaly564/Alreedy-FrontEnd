import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function AdminEditProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'skuId',
    direction: 'ascending'
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [xlsxFile, setXlsxFile] = useState(null);
  const [isXlsxUploading, setIsXlsxUploading] = useState(false);
  
  const navigate = useNavigate();
  const { TempSkuID, setTempSkuID } = useContext(UserContext);
  const TestToken = localStorage.getItem('userToken');

  // Constants for pagination
  const ITEMS_PER_PAGE = 10;

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://reedyph.com/api/v1/products/product');
        if (!response.ok) {
          throw new Error(`https error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
        toast.success('Products loaded successfully');
      } catch (error) {
        setError(error.message);
        toast.error(`Error loading products: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle CSV file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  // Handle CSV upload
  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch('https://reedyph.com/api/v1/products/csv', {
        method: 'POST',
        headers: {
          'Access-Token': TestToken
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'CSV upload failed');
      }

      const result = await response.json();
      toast.success('CSV uploaded successfully!');
      
      // Refresh products after successful upload
      const fetchResponse = await fetch('https://reedyph.com/api/v1/products/product');
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setProducts(data);
      } else {
        throw new Error('Failed to refresh products after upload');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error(`Error uploading CSV: ${error.message}`);
    } finally {
      setIsUploading(false);
      setCsvFile(null);
      // Reset file input
      if (document.getElementById('csv-upload')) {
        document.getElementById('csv-upload').value = '';
      }
    }
  };

  // Handle XLSX Export
  const handleXlsxExport = async () => {
    try {
      const response = await fetch('https://reedyph.com/api/v1/products/export-xlsx', {
        method: 'GET',
        headers: {
          'Access-Token': TestToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export XLSX');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('XLSX exported successfully');
    } catch (err) {
      toast.error(`Error exporting XLSX: ${err.message}`);
    }
  };

  // Handle XLSX file selection
  const handleXlsxFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setXlsxFile(e.target.files[0]);
    }
  };

  // Handle XLSX upload
  const handleXlsxUpload = async () => {
    if (!xlsxFile) {
      toast.error('Please select an XLSX file first');
      return;
    }

    setIsXlsxUploading(true);
    const formData = new FormData();
    formData.append('file', xlsxFile);

    try {
      const response = await fetch('https://reedyph.com/api/v1/products/xlsx', {
        method: 'POST',
        headers: {
          'Access-Token': TestToken
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'XLSX upload failed');
      }

      const result = await response.json();
      toast.success('XLSX uploaded successfully!');
      
      // Refresh products after successful upload
      const fetchResponse = await fetch('https://reedyph.com/api/v1/products/product');
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setProducts(data);
      } else {
        throw new Error('Failed to refresh products after upload');
      }
    } catch (error) {
      console.error('XLSX upload error:', error);
      toast.error(`Error uploading XLSX: ${error.message}`);
    } finally {
      setIsXlsxUploading(false);
      setXlsxFile(null);
      // Reset file input
      if (document.getElementById('xlsx-upload')) {
        document.getElementById('xlsx-upload').value = '';
      }
    }
  };

  // Sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format categories for display
  const formatCategories = (productCategories) => {
    if (!productCategories || productCategories.length === 0) return 'None';
    return productCategories.map(pc => pc.category.nameEn).join(', ');
  };

  // Format tags for display
  const formatTags = (tags) => {
    if (!tags || tags.length === 0) return 'None';
    return tags.map(tag => tag.tag.nameEn).join(', ');
  };

  // Sort and filter products
  const sortedAndFilteredProducts = useMemo(() => {
    let sortableProducts = [...products];
    
    // Normalize search term
    const normalizedSearchTerm = searchTerm ? searchTerm.trim().toLowerCase() : '';
    
    // Filtering
    if (normalizedSearchTerm) {
      sortableProducts = sortableProducts.filter(product => 
        (product.skuId && product.skuId.toLowerCase().includes(normalizedSearchTerm)) ||
        (product.nameEn && product.nameEn.toLowerCase().includes(normalizedSearchTerm)) ||
        (product.nameAr && product.nameAr.toLowerCase().includes(normalizedSearchTerm)) ||
        (product.priceBefore && product.priceBefore.toString().includes(normalizedSearchTerm)) ||
        (product.priceAfter && product.priceAfter.toString().includes(normalizedSearchTerm)) ||
        (product.itemRank && product.itemRank.toString().includes(normalizedSearchTerm)) ||
        (product.productCategories && formatCategories(product.productCategories).toLowerCase().includes(normalizedSearchTerm)) ||
        (product.tags && formatTags(product.tags).toLowerCase().includes(normalizedSearchTerm)) ||
        (product.company && typeof product.company === 'string' && product.company.trim().toLowerCase().includes(normalizedSearchTerm))
      );
    }
    
    // Sorting
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'categories') {
          aValue = formatCategories(a.productCategories);
          bValue = formatCategories(b.productCategories);
        } else if (sortConfig.key === 'tags') {
          aValue = formatTags(a.tags);
          bValue = formatTags(b.tags);
        } else {
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableProducts;
  }, [products, sortConfig, searchTerm]);

  // Pagination logic
  const pageCount = Math.ceil(sortedAndFilteredProducts.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentProducts = sortedAndFilteredProducts.slice(offset, offset + ITEMS_PER_PAGE);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleEdit = (skuId) => {
    setTempSkuID(skuId);
    navigate(`/EditProduct`);
  };

  const handleDelete = async (skuId) => {
    try {
      const response = await fetch(`https://reedyph.com/api/v1/products/product/${skuId}`, {
        method: 'DELETE',
        headers: {
          'Access-Token': TestToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(product => product.skuId !== skuId));
      setDeleteConfirm(null);
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error(`Error deleting product: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className='flex flex-col justify-center p-4 font-alexandria font-light'>
        <ToastContainer position="top-right" autoClose={5000} />
        
        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 mt-[4em]">
          <div className="flex gap-2">
            <Link to="/AdminAddNewPr" className='p-2 bg-blue-600 text-white rounded-lg h-[45px] w-[12em] text-center'>
              Add New Product
            </Link>
            
            {/* Export XLSX Button */}
            <button
              onClick={handleXlsxExport}
              className="p-2 bg-purple-600 text-white rounded-lg h-[45px] w-[12em] text-center hover:bg-purple-700"
            >
              Export XLSX
            </button>
            
            {/* CSV/XLSX Upload Section */}
            <div className="flex flex-col">
              <div className="flex gap-2">
                {/* CSV Upload */}
                <div className="relative">
                  <label className="p-2 bg-blue-600 text-white rounded-lg w-[12em] text-center cursor-pointer hover:bg-blue-700 inline-block">
                    {isUploading ? 'Uploading CSV...' : 'Upload CSV'}
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                
                {/* XLSX Upload */}
                <div className="relative">
                  <label className="p-2 bg-green-600 text-white rounded-lg w-[12em] text-center cursor-pointer hover:bg-green-700 inline-block">
                    {isXlsxUploading ? 'Uploading XLSX...' : 'Upload XLSX'}
                    <input
                      id="xlsx-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleXlsxFileChange}
                      disabled={isXlsxUploading}
                    />
                  </label>
                </div>
              </div>
              
              {/* CSV/XLSX Download Links */}
              <div className="flex gap-2 mt-2">
                <a 
                  href="https://drive.google.com/uc?export=download&id=1Caq5Y0Db3G-GRx7cjLkawnfgfuVkXBQI"
                  className="p-2 bg-blue-600 text-white rounded-lg w-[15em] whitespace-nowrap text-center hover:bg-blue-700"
                >
                  Download CSV Template
                </a>
                <a 
                  href="https://drive.google.com/uc?export=download&id=YOUR_XLSX_TEMPLATE_ID"
                  className="p-2 bg-green-600 text-white rounded-lg w-[15em] whitespace-nowrap text-center hover:bg-green-700"
                >
                  Download XLSX Template
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex-grow md:max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
        </div>

        {/* CSV Upload Confirmation */}
        {csvFile && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Selected CSV file: {csvFile.name}</p>
                <p className="text-sm text-gray-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCsvUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isUploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
                <button
                  onClick={() => {
                    setCsvFile(null);
                    if (document.getElementById('csv-upload')) {
                      document.getElementById('csv-upload').value = '';
                    }
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* XLSX Upload Confirmation */}
        {xlsxFile && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Selected XLSX file: {xlsxFile.name}</p>
                <p className="text-sm text-gray-500">{(xlsxFile.size / 1024).toFixed(2)} KB</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleXlsxUpload}
                  disabled={isXlsxUploading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isXlsxUploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
                <button
                  onClick={() => {
                    setXlsxFile(null);
                    if (document.getElementById('xlsx-upload')) {
                      document.getElementById('xlsx-upload').value = '';
                    }
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Image</th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('skuId')}
                >
                  SKU ID {sortConfig.key === 'skuId' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('nameEn')}
                >
                  Name (EN) {sortConfig.key === 'nameEn' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('company')}
                >
                  Company {sortConfig.key === 'company' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('priceBefore')}
                >
                  Price Before {sortConfig.key === 'priceBefore' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('priceAfter')}
                >
                  Price After {sortConfig.key === 'priceAfter' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('availableStock')}
                >
                  Available Stock {sortConfig.key === 'availableStock' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('itemRank')}
                >
                  Rank {sortConfig.key === 'itemRank' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('categories')}
                >
                  Categories {sortConfig.key === 'categories' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('tags')}
                >
                  Tags {sortConfig.key === 'tags' && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="p-3 text-left">Controls</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.skuId} className="border-t">
                    <td className="p-3">
                      {product.Images && product.Images.length > 0 && product.Images[0].url ? (
                        <img
                          src={product.Images[0].url}
                          alt={`Product ${product.skuId}`}
                          className="w-20 h-20 object-cover mx-auto"
                        />
                      ) : (
                        <span className="text-gray-500">No Image</span>
                      )}
                    </td>
                    <td className="p-3">{product.skuId}</td>
                    <td className="p-3">{product.nameEn}</td>
                    <td className="p-3">{product.company}</td>
                    <td className="p-3">{product.priceBefore}</td>
                    <td className="p-3">{product.priceAfter}</td>
                    <td className={`p-3 ${
                      product.availableStock <= 0 ? 'text-black-500 font-semibold' : 
                      product.availableStock <= 5 ? 'text-black-500 font-semibold' : 'text-black-500 font-semibold'
                    }`}>
                      {product.availableStock}
                    </td>
                    <td className="p-3">{product.itemRank}</td>
                    <td className="p-3">{formatCategories(product.productCategories)}</td>
                    <td className="p-3">{formatTags(product.tags)}</td>
                    <td className="p-3 space-x-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                        onClick={() => handleEdit(product.skuId)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                        onClick={() => setDeleteConfirm({
                          skuId: product.skuId,
                          name: product.nameEn
                        })}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="p-4 text-center text-gray-500">
                    No products found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sortedAndFilteredProducts.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center mt-4">
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={'flex items-center space-x-2'}
              pageClassName={'px-3 py-1 border rounded'}
              pageLinkClassName={'text-white-600'}
              activeClassName={'bg-blue-600 text-white'}
              previousClassName={'px-3 py-1 border rounded'}
              nextClassName={'px-3 py-1 border rounded'}
              disabledClassName={'opacity-50 cursor-not-allowed'}
              forcePage={currentPage}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete Product</h3>
              <p className="mb-4">
                Are you sure you want to delete product "{deleteConfirm.name}" (SKU: {deleteConfirm.skuId})?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.skuId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}