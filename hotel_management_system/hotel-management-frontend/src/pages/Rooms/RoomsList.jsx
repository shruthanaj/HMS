import { useState, useEffect } from 'react';
import RoomsTable from '../../components/tables/RoomsTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { roomsAPI } from '../../services/api';
import { Search } from 'lucide-react';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data);
    } catch (err) {
      setError('Failed to fetch rooms data');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (roomData) => {
  try {
    console.log('Adding room:', roomData);
    const response = await roomsAPI.create(roomData);
    fetchRooms(); // Refresh the list
    setError(''); // Clear any previous errors
  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Failed to add room';
    setError(`Error: ${errorMessage}`);
    console.error('Full error adding room:', err);
    console.error('Error response:', err.response?.data);
  }
};

  const handleEditRoom = async (roomId, roomData) => {
    try {
      console.log('Updating room:', roomId, roomData);
      await roomsAPI.update(roomId, roomData);
      fetchRooms(); // Refresh the list
      setError(''); // Clear any previous errors
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update room';
      setError(errorMessage);
      console.error('Error updating room:', err.response?.data || err);
    }
  };

const handleDeleteRoom = async (roomId) => {
  try {
    console.log('Deleting room:', roomId);
    const response = await roomsAPI.delete(roomId);
    fetchRooms(); // Refresh the list
    setError(''); // Clear any previous errors
  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Failed to delete room';
    setError(`Error: ${errorMessage}`);
    console.error('Full error deleting room:', err);
    console.error('Error response:', err.response?.data);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.room_number?.toLowerCase().includes(searchLower) ||
      room.room_type?.toLowerCase().includes(searchLower) ||
      room.status?.toLowerCase().includes(searchLower) ||
      room.floor?.toString().includes(searchLower) ||
      room.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
        <p className="text-gray-600 mt-2">Manage hotel rooms and their availability</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by room number, type, status, or floor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <RoomsTable
        rooms={filteredRooms}
        onAdd={handleAddRoom}
        onEdit={handleEditRoom}
        onDelete={handleDeleteRoom}
      />
    </div>
  );
};

export default RoomsList;