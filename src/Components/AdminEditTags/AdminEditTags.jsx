import React, { useContext } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const TagsTable = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });
  const { setTempTagData } = useContext(UserContext);
  const navigate = useNavigate();
  const TestToken = localStorage.getItem('userToken');

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://reedyph.com/api/v1/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setTags(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort tags
  const sortedTags = useMemo(() => {
    let sortableTags = [...tags];
    if (sortConfig.key) {
      sortableTags.sort((a, b) => {
        // Handle numeric fields differently
        if (sortConfig.key === 'id' || sortConfig.key === 'categoryId' || sortConfig.key === 'rank') {
          return sortConfig.direction === 'ascending' 
            ? a[sortConfig.key] - b[sortConfig.key] 
            : b[sortConfig.key] - a[sortConfig.key];
        }
        
        // Handle boolean field (ishidden)
        if (sortConfig.key === 'ishidden') {
          return sortConfig.direction === 'ascending' 
            ? (a.ishidden === b.ishidden ? 0 : a.ishidden ? -1 : 1)
            : (a.ishidden === b.ishidden ? 0 : a.ishidden ? 1 : -1);
        }
        
        // Default string comparison for other fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTags;
  }, [tags, sortConfig]);

  const handleEdit = (tag, e) => {
    e.preventDefault();
    setTempTagData(tag);
    navigate('/EditTag');
  };

  const handleDelete = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(
        `https://reedyph.com/api/v1/tags/tag/${tagId}`,
        {
          method: 'DELETE',
          headers: {
            'Access-Token': TestToken
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete tag (status: ${response.status})`);
      }

      await fetchTags();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="mt-[10vh]">
        <Link 
          to="/AdminAddNewTag" 
          className='font-alexandria  font-ligh p-8 py-8 bg-blue-500 text-white rounded hover:bg-blue-600 rounded-xl'
        >
          Add new tag
        </Link>
        {error && (
          <div className="font-alexandria font-light bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
            {error}
          </div>
        )}
      </div>
      <div className="relative overflow-x-auto font-alexandria font-light">
        <table className="w-full text-sm text-left text-gray-900 bg-white">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('id')}
              >
                ID {sortConfig.key === 'id' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('nameEn')}
              >
                English Name {sortConfig.key === 'nameEn' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('nameAr')}
              >
                Arabic Name {sortConfig.key === 'nameAr' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('categoryId')}
              >
                Category ID {sortConfig.key === 'categoryId' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('ishidden')}
              >
                Hidden {sortConfig.key === 'ishidden' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('rank')}
              >
                Rank {sortConfig.key === 'rank' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTags.map((tag, index) => (
              <tr key={tag.id} className={`${index !== tags.length - 1 ? 'border-b' : ''} bg-white border-gray-200`}>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {tag.id}
                </td>
                <td className="px-6 py-4">{tag.nameEn}</td>
                <td className="px-6 py-4">{tag.nameAr}</td>
                <td className="px-6 py-4">{tag.categoryId}</td>
                <td className="px-6 py-4">{tag.ishidden ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">{tag.rank}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <Link 
                    to="/EditTag"
                    onClick={(e) => handleEdit(tag, e)}
                    className={`px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={deleteLoading}
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(tag.id)}
                    disabled={deleteLoading}
                    className={`px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TagsTable;