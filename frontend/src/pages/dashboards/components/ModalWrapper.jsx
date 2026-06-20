// import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none p-4">
      {/* 1. Backdrop Overlay using your design tokens */}
      <div 
        className="fixed inset-0 bg-bg-main/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* 2. Modal Box Content */}
      <div className="relative w-full max-w-2xl mx-auto my-6 z-50">
        <div className="relative flex flex-col w-full bg-surface border border-main rounded-xl shadow-xl outline-none focus:outline-none">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-main rounded-t">
            <h3 className="text-xl font-bold font-display text-main">{title}</h3>
            <button
              className="p-1 rounded-md hover:bg-main text-muted hover:text-main text-2xl leading-none transition-colors outline-none focus:outline-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="relative p-6 flex-auto max-h-[70vh] overflow-y-auto bg-surface text-main">
            {children} 
          </div>

        </div>
      </div>
    </div>
  );
};

export default Modal;