import { useEffect, useState } from "react";
import api from "../services/api";
import DocumentVerificationCard from "../components/DocumentVerificationCard";



  export default function DocumentVault({
    currentUser
  }) {
    const canUpload = currentUser?.role === "CITIZEN";
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("PAN");

  const userId = 1;

  const loadDocuments = async () => {
    const res = await api.get(
      `/documents/${userId}`
    );

    setDocuments(res.data);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return;

    try{
    const formData = new FormData();

    formData.append("document_type", documentType);
    formData.append("user_id", userId);
    formData.append("file", file);

      await api.post(
        "/documents/upload",
        formData
      );

      alert("Document uploaded successfully");

      setFile(null);

      loadDocuments();
    }catch(err){
        console.error(err);
        alert("Upload failed");
    }
  };

  const handleDigilockerFetch = async () => {
  try {
    const formData = new FormData();

    formData.append("document_type", documentType);
    formData.append("user_id", "1");

    const res = await api.post(
      "/documents/digilocker-fetch",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

console.log(res.data);

    console.log("DigiLocker response:", res.data);

    alert(`${documentType} fetched from DigiLocker`);

    loadDocuments();
  } catch (err) {
    console.error("DigiLocker error:", err.response?.data || err);
    alert("DigiLocker fetch failed");
  }
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Document Vault
      </h1>

      {canUpload && (
        <div className="bg-white p-4 rounded shadow mb-6">
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label className="block mb-2">
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value)
              }
              className="border p-2 rounded w-full"
            >
              <option>PAN</option>
              <option>GST</option>
              <option>ADDRESS_PROOF</option>
              <option>SHOP_LICENSE</option>
            </select>
          </div>

          <input
            type="file"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            className="mb-4"
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Upload
          </button>

          <button
            type="button"
            onClick={handleDigilockerFetch}
            className="bg-green-600 text-white px-4 py-2 rounded ml-3"
          >
            Fetch from DigiLocker
          </button>

        </form>
      </div>
  )}

    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-4">
        Uploaded Documents
      </h2>

      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">
          No documents uploaded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentVerificationCard
              key={doc.id}
              document={doc}
              onRefresh={loadDocuments}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}