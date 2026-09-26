import React from 'react';
import axios from 'axios';
import {
  CheckCircle2,
  XCircle,
  Clock3,
  FileText
} from 'lucide-react';

export default function DocumentVerificationCard({
  document,
  onRefresh
}) {
  const verifyDocument = async (status) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/documents/${document.id}/verify`,
        {
          status,
          remarks:
            status === "VERIFIED"
              ? "Document verified successfully"
              : "Document rejected by officer"
        }
      );

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }
  };

  const getStatusBadge = () => {
    switch (document.verification_status) {
      case 'VERIFIED':
        return (
          <span className="px-2 py-1 text-[10px] rounded-full bg-green-100 text-green-700 font-bold">
            VERIFIED
          </span>
        );

      case 'REJECTED':
        return (
          <span className="px-2 py-1 text-[10px] rounded-full bg-red-100 text-red-700 font-bold">
            REJECTED
          </span>
        );

      default:
        return (
          <span className="px-2 py-1 text-[10px] rounded-full bg-yellow-100 text-yellow-700 font-bold">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-govblue-600" />

          <div>
            <p className="font-semibold text-sm">
              {document.document_type?.toUpperCase()}
            </p>

            <p className="text-xs text-slate-500">
              {document.file_name}
            </p>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a
          href={`http://localhost:8000/${document.file_path.replace(/\\/g, "/")}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 text-xs bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          View Document
        </a>

        {document.verification_status !== 'VERIFIED' && (
          <button
            onClick={() => verifyDocument('VERIFIED')}
            className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            Verify
          </button>
        )}

        {document.verification_status !== 'REJECTED' && (
          <button
            onClick={() => verifyDocument('REJECTED')}
            className="px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
          >
            <XCircle className="w-3 h-3" />
            Reject
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500">
        <Clock3 className="w-3 h-3" />
        Status tracked through middleware verification layer
      </div>
    </div>
  );
}