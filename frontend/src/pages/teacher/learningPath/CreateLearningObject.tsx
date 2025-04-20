import React, { useState } from 'react';

interface CreateLearningObjectProps {
  onSave: (title: string) => void;
  onCancel: () => void;
}

const CreateLearningObject: React.FC<CreateLearningObjectProps> = ({
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (title.trim() === '') {
      alert('Title cannot be empty');
      return;
    }
    onSave(title);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Enter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border border-gray-300 rounded"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateLearningObject;
