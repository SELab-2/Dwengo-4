import React, { useState } from 'react';

interface DeleteNodeButtonProps {
  onDelete: () => void;
}

const DeleteNodeButton: React.FC<DeleteNodeButtonProps> = ({ onDelete }) => {
  // use to conditionally render the inline delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="flex items-center gap-2 relative">
      {/* delete button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className={`${
          showDeleteConfirm ? 'bg-dwengo-red-dark' : 'bg-dwengo-red-200'
        } hover:bg-dwengo-red-dark text-white rounded p-1 flex-shrink-0`}
        title="Delete node"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={`m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16
            19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456
            0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0
            0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32
            0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0`}
          />
        </svg>
      </button>

      {/* deletion confirmation inline dialog */}
      {showDeleteConfirm && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 z-50 w-[min(85vw,8rem)] sm:left-auto sm:translate-x-0 sm:right-0">
          {/* arrow pointing to delete button */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 sm:left-auto sm:right-3 w-2 h-2 bg-white border-l border-t rotate-45" />

          {/* confirmation dialog */}
          <div className="flex flex-col border border-gray-300 rounded shadow-md bg-white overflow-hidden">
            <span className="px-1 py-1.5 text-sm text-center border-b border-gray-200">
              Are you sure?
            </span>
            <div className="flex flex-col sm:flex-row">
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="w-full sm:flex-1 bg-dwengo-red-200 hover:bg-dwengo-red-dark text-white p-1.5 text-xs border-b sm:border-b-0 sm:border-r border-gray-200"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 p-1.5 text-xs"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteNodeButton;
