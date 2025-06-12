// client/src/components/Alert.jsx
import React from "react";

export default function Alert({ type = "info", message, onClose }) {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 text-white rounded shadow ${bgColor}`}>
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="font-bold">×</button>
      </div>
    </div>
  );
}

