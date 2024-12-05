import React from "react";

const OperationStatus = ({ status }) => {
  return (
    <div
      className={`p-3 font-semibold lowercase text-sm text-left ${
        status === "SUCCESS"
          ? "text-green-600"
          : status === "PENDING"
          ? "text-orange-600"
          : status === "FAILED"
          ? "text-red-600"
          : "text-gray-600"
      }`}
    >
      <span
        className={`rounded-xl border p-1 ${
          status === "SUCCESS"
            ? "bg-green-100 border-green-200"
            : status === "PENDING"
            ? "bg-orange-100 border-orange-200"
            : status === "FAILED"
            ? "bg-red-100 border-red-200"
            : "bg-gray-100 border-gray-200"
        }`}
      >
        {status}
      </span>
    </div>
  );
};

export default OperationStatus;
