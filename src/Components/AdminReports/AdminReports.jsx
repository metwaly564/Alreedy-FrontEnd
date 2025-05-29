import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  DocumentArrowDownIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalReports: 0
  });
  const TestToken = localStorage.getItem('userToken');

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://reedyph.com/api/v1/reports/?page=${pagination.page}&limit=${pagination.limit}`, {
        method: 'GET',
        headers: {
          'Access-Token': TestToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.reports);
      setPagination({
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        totalReports: data.totalReports
      });
    } catch (error) {
      toast.error(`Error fetching reports: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate product report
  const generateProductReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch('https://reedyph.com/api/v1/reports/gen/product', {
        method: 'POST',
        headers: {
          'Access-Token': TestToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      toast.success('Product report generation started successfully');
      // Refresh reports after generation
      setTimeout(fetchReports, 2000); // Give some time for generation to complete
    } catch (error) {
      toast.error(`Error generating report: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Download report
  const downloadReport = async (reportId) => {
    try {
      const response = await fetch(`https://reedyph.com/api/v1/reports/${reportId}`, {
        method: 'GET',
        headers: {
          'Access-Token': TestToken
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Report not found');
        }
        throw new Error('Failed to download report');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error(`Error downloading report: ${error.message}`);
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`https://reedyph.com/api/v1/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Access-Token': TestToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      toast.success('Report deleted successfully');
      fetchReports(); // Refresh the list
    } catch (error) {
      toast.error(`Error deleting report: ${error.message}`);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [pagination.page]);

  return (
    <div className=" mx-auto px-4 py-8 font-alexandria font-light">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 mt-[10vh]">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Reports Management</h1>
        
        <button
          onClick={generateProductReport}
          disabled={generating}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {generating ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Generate Product Report
            </>
          )}
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <ArrowPathIcon className="h-8 w-8 text-gray-500 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reports found. Generate a report to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.type || 'Product Report'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${report.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            report.status === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {report.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadReport(report._id)}
                            disabled={report.status !== 'completed'}
                            className={`flex items-center px-2 py-1 rounded ${report.status === 'completed' ? 
                              'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
                            title={report.status === 'completed' ? 'Download report' : 'Report not ready for download'}
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                            Download
                          </button>
                          <button
                            onClick={() => deleteReport(report._id)}
                            className="flex items-center px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete report"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalReports)}</span> of{' '}
                      <span className="font-medium">{pagination.totalReports}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}