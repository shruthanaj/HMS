import { useState, useEffect } from 'react';

const RoomForm = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Single',
    price_per_night: '',
    max_occupancy: '',
    size: '',
    description: '',
    amenities: '',
    status: 'Available',
    floor_number: '',
    staff_id: ''
  });

  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number || '',
        room_type: room.room_type || 'Single',
        price_per_night: room.price_per_night || '',
        max_occupancy: room.max_occupancy || '',
        size: room.size || '',
        description: room.description || '',
        amenities: room.amenities || '',
        status: room.status || 'Available',
        floor_number: room.floor_number || '',
        staff_id: room.staff_id || ''
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for submission - ensure numbers are properly formatted
    const submitData = {
      ...formData,
      price_per_night: parseFloat(formData.price_per_night) || 0,
      max_occupancy: parseInt(formData.max_occupancy) || 1,
      floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
      staff_id: formData.staff_id ? parseInt(formData.staff_id) : null
    };

    console.log('Submitting room data:', submitData);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Number *
          </label>
          <input
            type="text"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 101"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Type *
          </label>
          <select
            name="room_type"
            value={formData.room_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Presidential">Presidential</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per Night (₹) *
          </label>
          <input
            type="number"
            name="price_per_night"
            value={formData.price_per_night}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="99.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Occupancy *
          </label>
          <input
            type="number"
            name="max_occupancy"
            value={formData.max_occupancy}
            onChange={handleChange}
            min="1"
            max="20"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="e.g., 250 sq ft"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Floor Number
          </label>
          <input
            type="number"
            name="floor_number"
            value={formData.floor_number}
            onChange={handleChange}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="1"
          />
        </div>

        {room && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Cleaning">Cleaning</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Staff ID (Optional)
          </label>
          <input
            type="number"
            name="staff_id"
            value={formData.staff_id}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Staff ID number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Room description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amenities
        </label>
        <textarea
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          rows={2}
          placeholder="List amenities separated by commas"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {room ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  );
};

export default RoomForm;