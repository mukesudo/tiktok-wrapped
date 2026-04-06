"use client";

import { useDropzone } from "react-dropzone";
import clsx from "clsx";

type UploadCardProps = {
  onFile: (file: File) => void;
  fileName?: string | null;
  error?: string | null;
  loading?: boolean;
};

export default function UploadCard({
  onFile,
  fileName,
  error,
  loading = false
}: UploadCardProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { "application/json": [".json"] },
    disabled: loading,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        onFile(file);
      }
    }
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "w-full rounded-[2rem] border border-white/10 border-dashed bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_45%),linear-gradient(145deg,_rgba(236,72,153,0.18),_rgba(14,165,233,0.1),_rgba(8,8,8,0.95))] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition",
        !loading && "cursor-pointer",
        isDragActive && "border-cyan-300/80 bg-pink-900/40",
        loading && "opacity-90"
      )}
    >
      <input {...getInputProps()} />
      <p className="text-lg font-semibold text-white">
        Drop your TikTok export JSON here
      </p>
      <p className="mt-2 text-sm text-white/70">
        We analyze your file in the browser, then enrich replay cards with public
        TikTok preview metadata.
      </p>
      <button
        type="button"
        className="mt-5 rounded-full bg-[#1ed760] px-6 py-2 text-sm font-semibold text-black transition hover:bg-[#3be477] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
      >
        {loading ? "Analyzing export..." : "Upload JSON"}
      </button>
      {loading && (
        <div className="mt-5 flex justify-center gap-1">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className="h-8 w-1.5 origin-bottom rounded-full bg-pink-400 animate-bar-dance"
              style={{ animationDelay: `${idx * 0.12}s` }}
            />
          ))}
        </div>
      )}
      {fileName && (
        <p className="mt-4 text-sm text-cyan-200">Loaded: {fileName}</p>
      )}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
    </div>
  );
}
