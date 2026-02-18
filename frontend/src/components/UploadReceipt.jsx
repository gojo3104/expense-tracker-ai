import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  UploadCloud,
  Sparkles,
  CheckCircle,
  Edit3,
  Save,
  FileText,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export default function UploadReceipt({ onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [result, setResult] = useState(null);
  const [editable, setEditable] = useState(false);
  const [history, setHistory] = useState([]);

  const inputRef = useRef(null);

  /* ================= FILE HANDLING ================= */

  const handleFile = (f) => {
    if (!f) return;

    setFile(f);
    setResult(null);
    setEditable(false);

    if (f.type.startsWith("image")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ================= UPLOAD & OCR ================= */

    const handleUpload = async () => {
    if (!file) {
      toast.warn("Please select a receipt image first");
      return;
    }

    setLoading(true);
    setProgress(10);

    const fakeProgress = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 300);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      clearInterval(fakeProgress);
      setProgress(100);

      // ✅ CORRECT KEY
      const expense = res.data?.data;

      if (!expense || typeof expense !== "object") {
        console.error("UPLOAD RESPONSE:", res.data);
        toast.error("Invalid OCR response from server");
        return;
      }

      setResult(expense);
      setEditable(true);
      setHistory((h) => [expense, ...h.slice(0, 4)]);

      toast.success("Receipt processed successfully ✨");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.error || "Failed to process receipt"
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 600);
    }
  };


  /* ================= SAVE TO DATABASE ================= */

  const handleSave = async () => {
    if (!result) return;

    try {
      await axios.post(`${API_BASE_URL}/expenses`, result);

      toast.success("Expense saved successfully ✅");

      setEditable(false);
      setResult(null);
      setFile(null);
      setPreview(null);

      if (inputRef.current) inputRef.current.value = "";

      // 🔁 REFRESH DASHBOARD + LIST
      onUpload?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save expense");
    }
  };

  return (
    <section className="space-y-10">
      <div className="relative rounded-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              AI Receipt Upload
            </h2>
            <p className="text-sm text-gray-400">
              Upload receipt & let AI extract details
            </p>
          </div>
        </div>

        {/* DROP ZONE */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          className={`rounded-2xl p-10 border-2 border-dashed cursor-pointer transition
            ${
              file
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-white/20 hover:border-indigo-400 hover:bg-white/5"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div className="flex flex-col items-center gap-4 text-center">
            <UploadCloud size={34} className="text-indigo-400" />
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="max-h-32 rounded-lg border border-white/10"
              />
            ) : (
              <>
                <p className="text-gray-200">Drag & drop receipt</p>
                <p className="text-sm text-gray-400">
                  or click to browse (image only)
                </p>
              </>
            )}
          </div>
        </div>

        {/* PROGRESS */}
        {loading && (
          <div className="mt-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              AI extracting receipt data…
            </p>
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r from-indigo-500 to-purple-600
            hover:shadow-lg hover:shadow-indigo-500/30 transition disabled:opacity-60"
        >
          Upload & Extract
        </button>

        {/* RESULT */}
        {result && (
          <div className="mt-8 rounded-xl p-5 bg-emerald-500/10 border border-emerald-400/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle /> Extracted Expense
              </div>
              <button
                onClick={() => setEditable((e) => !e)}
                className="text-xs text-indigo-400 flex items-center gap-1"
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {["merchant", "amount", "date", "category"].map((field) => (
              <div key={field} className="mb-2">
                <label className="text-xs text-gray-400 capitalize">
                  {field}
                </label>
                <input
                  disabled={!editable}
                  value={result[field] || ""}
                  onChange={(e) =>
                    setResult({ ...result, [field]: e.target.value })
                  }
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            ))}

            {editable && (
              <button
                onClick={handleSave}
                className="mt-4 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
              >
                <Save size={16} /> Confirm & Save
              </button>
            )}
          </div>
        )}
      </div>

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText /> Recent Uploads
          </h3>

          <ul className="space-y-3">
            {history.map((h, i) => (
              <li
                key={i}
                className="flex justify-between text-sm text-gray-300 bg-white/5 p-3 rounded-lg"
              >
                <span>{h.merchant || "Unknown"}</span>
                <span>₹{h.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
