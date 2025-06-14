import React, { useState, useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';

export default function AdminEditBanners() {
  // State management
  const userToken = localStorage.getItem('userToken');
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Form state
  const [newBannerData, setNewBannerData] = useState({
    type: 'slider',
    linkUrl: '',
    rank: '',
    image: null
  });
  const [formErrors, setFormErrors] = useState({});

  // Sorting configuration
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Fetch banners on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('https://reedyph.com/api/v1/banners/banner');
        if (!response.ok) throw new Error('Failed to fetch banners');
        const data = await response.json();
        setBanners(data);
      } catch (err) {
        setError(err.message);
        toast.error(`Error loading banners: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  /**
   * Validates banner form data
   * @param {Object} data - Form data to validate
   * @returns {Object} Validation errors
   */
  const validateForm = (data) => {
    const errors = {};
    if (!data.type) {
      errors.type = 'Type is required';
    }
    if (!data.linkUrl) {
      errors.linkUrl = 'Link URL is required';
    }
    if (data.rank && isNaN(data.rank)) {
      errors.rank = 'Rank must be a number';
      return errors;
    }
  };

  /**
   * Handles column sorting
   * @param {string} key - Column key to sort by
   */
  const requestSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'ascending'
      ? 'descending'
      : 'ascending';
    setSortConfig({ key, direction });
  };

  // CRUD Operations

  /**
   * Creates a new banner
   */
  const createBanner = async () => {
    const errors = validateForm(newBannerData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formData = new FormData();
    formData.append('image', newBannerData.image);
    formData.append('type', newBannerData.type);
    formData.append('url', newBannerData.linkUrl);
    if (newBannerData.rank) formData.append('rank', newBannerData.rank);

    try {
      const response = await fetch('https://reedyph.com/api/v1/banners/banner', {
        method: 'POST',
        headers: { 'Access-Token': userToken },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create banner');

      // Refresh banners list
      const refreshResponse = await fetch('https://reedyph.com/api/v1/banners/banner');
      const updatedBanners = await refreshResponse.json();
      setBanners(updatedBanners);

      // Reset form
      setNewBannerData({ type: 'slider', linkUrl: '', rank: '', image: null });
      setFormErrors({});
      document.getElementById('banner-image-input').value = '';
      toast.success('Banner created successfully');
    } catch (err) {
      toast.error(`Error creating banner: ${err.message}`);
    }
  };

  /**
   * Updates an existing banner
   */
  const updateBanner = async () => {
    if (!editingBanner) return;

    try {
      const response = await fetch('https://reedyph.com/api/v1/banners/banner', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': userToken
        },
        body: JSON.stringify({
          id: editingBanner.id,
          type: editingBanner.type,
          linkUrl: editingBanner.linkUrl,
          rank: editingBanner.rank
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update banner');
      }

      // Update local state
      setBanners(prevBanners =>
        prevBanners.map(banner =>
          banner.id === editingBanner.id ? editingBanner : banner
        )
      );

      setEditingBanner(null);
      toast.success('Banner updated successfully');
    } catch (err) {
      toast.error(`Error updating banner: ${err.message}`);
    }
  };

  /**
   * Deletes a banner
   * @param {number} id - ID of banner to delete
   */
  const deleteBanner = async (id) => {
    try {
      const response = await fetch(`https://reedyph.com/api/v1/banners/banner/${id}`, {
        method: 'DELETE',
        headers: { 'Access-Token': userToken }
      });

      if (!response.ok) throw new Error('Failed to delete banner');

      setBanners(banners.filter(banner => banner.id !== id));
      setDeleteConfirm(null);
      toast.success('Banner deleted successfully');
    } catch (err) {
      toast.error(`Error deleting banner: ${err.message}`);
    }
  };

  // Data processing

  /**
   * Sorts banners based on current sort configuration
   */
  const sortedBanners = useMemo(() => {
    const sortable = [...banners];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortable;
  }, [banners, sortConfig]);

  // Filter banners based on search term
  const filteredBanners = sortedBanners.filter(banner =>
    `${banner.type}${banner.linkUrl}${banner.rank}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const pageCount = Math.ceil(filteredBanners.length / itemsPerPage);
  const currentBanners = filteredBanners.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Loading and error states
  if (loading) return <div className="text-center p-4">Loading banners...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Search and Filters Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow mt-[4em]">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search banners..."
            className="flex-grow p-2 border rounded"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Items per page:</span>
            <select
              className="p-2 border rounded"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              {[5, 10, 20, 50].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Banner Form Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Banner</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Select */}
          <div>
            <select
              className={`w-full p-2 border rounded ${formErrors.type ? 'border-red-500' : ''}`}
              value={newBannerData.type}
              onChange={(e) => setNewBannerData({ ...newBannerData, type: e.target.value })}
            >
              <option value="slider">Slider</option>
              <option value="middle">Middle</option>
              <option value="fixed">Fixed</option>
            </select>
            {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
          </div>

          {/* Link URL Input */}
          <div>
            <input
              type="text"
              placeholder="Link URL"
              className={`w-full p-2 border rounded ${formErrors.linkUrl ? 'border-red-500' : ''}`}
              value={newBannerData.linkUrl}
              onChange={(e) => setNewBannerData({ ...newBannerData, linkUrl: e.target.value })}
            />
            {formErrors.linkUrl && <p className="text-red-500 text-xs mt-1">{formErrors.linkUrl}</p>}
          </div>

          {/* Rank Input */}
          <div>
            <input
              type="number"
              placeholder="Rank (optional)"
              className={`w-full p-2 border rounded ${formErrors.rank ? 'border-red-500' : ''}`}
              value={newBannerData.rank}
              onChange={(e) => setNewBannerData({ ...newBannerData, rank: e.target.value })}
            />
            {formErrors.rank && <p className="text-red-500 text-xs mt-1">{formErrors.rank}</p>}
          </div>

          {/* Image Upload and Submit */}
          <div className="flex gap-2">
            <input
              id="banner-image-input"
              type="file"
              className="flex-grow p-2 border rounded w-2"
              onChange={(e) => setNewBannerData({ ...newBannerData, image: e.target.files[0] })}
              accept="image/*"
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded whitespace-nowrap"
              onClick={createBanner}
              disabled={!newBannerData.image || !newBannerData.type || !newBannerData.linkUrl}
            >
              Add Banner
            </button>
          </div>
        </div>
      </div>

      {/* Banners Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {/* Table Headers with sorting */}
              {[
                { key: 'id', label: 'ID' },
                { key: null, label: 'Image' },
                { key: 'type', label: 'Type' },
                { key: null, label: 'Link' },
                { key: 'rank', label: 'Rank' },
                { key: null, label: 'Actions' }
              ].map((header) => (
                <th
                  key={header.label}
                  className="p-3 text-left cursor-pointer"
                  onClick={() => header.key && requestSort(header.key)}
                >
                  <div className="flex items-center">
                    {header.label}
                    {header.key && sortConfig.key === header.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentBanners.length > 0 ? (
              currentBanners.map(banner => (
                <BannerRow
                  key={banner.id}
                  banner={banner}
                  editingBanner={editingBanner}
                  setEditingBanner={setEditingBanner}
                  setDeleteConfirm={setDeleteConfirm}
                  updateBanner={updateBanner}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No banners found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {pageCount > 1 && (
        <div className="flex justify-center mb-6">
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            breakLabel={'...'}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName={'flex items-center gap-1'}
            pageClassName={'px-3 py-1 border rounded hover:bg-gray-100'}
            pageLinkClassName={'text-gray-700'}
            activeClassName={'bg-blue-500 text-white'}
            activeLinkClassName={'text-white'}
            previousClassName={'px-3 py-1 border rounded hover:bg-gray-100'}
            nextClassName={'px-3 py-1 border rounded hover:bg-gray-100'}
            disabledClassName={'opacity-50 cursor-not-allowed'}
            forcePage={currentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmationModal
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          deleteBanner={deleteBanner}
        />
      )}
    </div>
  );
}

/**
 * Component for individual banner row in table
 */
function BannerRow({ banner, editingBanner, setEditingBanner, setDeleteConfirm, updateBanner }) {
  const isEditing = editingBanner?.id === banner.id;

  return (
    <tr key={banner.id} className="border-t hover:bg-gray-50">
      <td className="p-3">{banner.id}</td>

      {/* Banner Image */}
      <td className="p-3">
        <img
          src={`${banner.imageUrl}?${new Date(banner.updatedAt).getTime()}`}
          alt="Banner"
          className="h-16 object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      </td>

      {/* Banner Type */}
      <td className="p-3">
        {isEditing ? (
          <select
            className="w-full p-1 border rounded"
            value={editingBanner.type}
            onChange={(e) => setEditingBanner({
              ...editingBanner,
              type: e.target.value
            })}
          >
            <option value="slider">Slider</option>
            <option value="middle">Middle</option>
            <option value="fixed">Fixed</option>
          </select>
        ) : (
          <span className="capitalize">{banner.type}</span>
        )}
      </td>

      {/* Banner Link */}
      <td className="p-3">
        {isEditing ? (
          <input
            type="text"
            className="w-full p-1 border rounded"
            value={editingBanner.linkUrl}
            onChange={(e) => setEditingBanner({
              ...editingBanner,
              linkUrl: e.target.value
            })}
          />
        ) : banner.linkUrl === ".." ? (
          <span className="text-gray-400">No link</span>
        ) : (
          <a
            href={
              banner.linkUrl.startsWith('http')
                ? banner.linkUrl
                : `https://reedyph.com/${banner.linkUrl}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {banner.linkUrl}
          </a>
        )}
      </td>

      {/* Banner Rank */}
      <td className="p-3">
        {isEditing ? (
          <input
            type="number"
            className="w-full p-1 border rounded"
            value={editingBanner.rank || ''}
            onChange={(e) => setEditingBanner({
              ...editingBanner,
              rank: e.target.value
            })}
          />
        ) : banner.rank ? banner.rank : 'N/A'}
      </td>

      {/* Action Buttons */}
      <td className="p-3 space-x-2">
        {isEditing ? (
          <>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              onClick={updateBanner}
            >
              Save
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => setEditingBanner(null)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => setEditingBanner(banner)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => setDeleteConfirm(banner)}
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

/**
 * Component for delete confirmation modal
 */
function DeleteConfirmationModal({ deleteConfirm, setDeleteConfirm, deleteBanner }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
        <div className="mb-4">
          <img
            src={deleteConfirm.imageUrl}
            alt="Banner to delete"
            className="w-full h-auto mb-3 rounded"
          />
          <p>Are you sure you want to delete this banner?</p>
          <p className="font-semibold mt-2">ID: {deleteConfirm.id}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => {
              deleteBanner(deleteConfirm.id);
              setDeleteConfirm(null);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}