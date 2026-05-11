"use client";

import { useRef, useState } from "react";
import { Camera, CheckCircle2, FileImage, RotateCcw, Send, X } from "lucide-react";
import { submitDriverPhotoReport } from "../actions";

export default function DriverPhotoReportCard({ orderId }: { orderId?: string | null }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reason, setReason] = useState("Restaurant delay");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleFile(nextFile?: File | null) {
    if (!nextFile) return;
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setMessage("");
    setError("");
  }

  async function submit() {
    if (!file) {
      setError("Take or upload a photo first.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    if (orderId) formData.append("orderId", orderId);
    formData.append("reason", reason);
    formData.append("note", note);
    formData.append("photo", file, file.name || "driver-report.jpg");

    const result = await submitDriverPhotoReport(formData);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setMessage("Saved to support. You can keep driving.");
    setFile(null);
    setPreview(null);
    setNote("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section className="driver-photo-card">
      <div className="driver-photo-head">
        <div>
          <p>Route proof</p>
          <h3>Snap a photo for support</h3>
        </div>
        <div className="driver-photo-icon"><Camera size={18} aria-hidden="true" /></div>
      </div>

      <div className="driver-photo-grid">
        <button type="button" className="driver-photo-capture" onClick={() => fileRef.current?.click()}>
          {preview ? (
            <>
              <img src={preview} alt="Driver route report preview" />
              <span><RotateCcw size={14} aria-hidden="true" /> Retake photo</span>
            </>
          ) : (
            <>
              <FileImage size={22} aria-hidden="true" />
              <span>Open camera</span>
              <small>Delay, damaged bag, missing item, unsafe dropoff, or pickup proof.</small>
            </>
          )}
        </button>

        <div className="driver-photo-fields">
          <label>
            Reason
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option>Restaurant delay</option>
              <option>Damaged or unsealed bag</option>
              <option>Missing item concern</option>
              <option>Customer unavailable</option>
              <option>Unsafe location</option>
              <option>Other route note</option>
            </select>
          </label>
          <label>
            Note
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Short note for support..."
              rows={3}
            />
          </label>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {message ? <div className="driver-photo-message ok"><CheckCircle2 size={14} aria-hidden="true" /> {message}</div> : null}
      {error ? <div className="driver-photo-message error"><X size={14} aria-hidden="true" /> {error}</div> : null}

      <button type="button" className="driver-photo-submit" disabled={submitting || !file} onClick={submit}>
        <Send size={14} aria-hidden="true" />
        {submitting ? "Saving..." : "Attach to Support"}
      </button>
    </section>
  );
}
