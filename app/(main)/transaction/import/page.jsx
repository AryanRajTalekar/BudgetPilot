"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { importBankStatement } from "@/actions/importStatement";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImportStatementPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");

 const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;

  setFile(selectedFile);

  // ✅ create preview
  const url = URL.createObjectURL(selectedFile);
  setPreviewUrl(url);
};

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");

    const res = await importBankStatement(file);

    if (res.success) {
      setStatus("queued"); // new state
    } else {
      setStatus("error");
    }
  };

  return (
  <div className="w-full max-w-[1200px] mx-auto space-y-8">

    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold">Import Bank Statement</h1>
      <p className="text-muted-foreground mt-1">
        Upload your monthly bank statement and BudgetPilot will automatically
        extract your transactions.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* 🟦 LEFT: Upload */}
      <Card className="border-dashed h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp size={20} />
            Upload PDF Statement
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 h-full justify-center">

          <label className="cursor-pointer border-2 border-dashed p-10 rounded-lg text-center block w-full">
            <FileUp className="mx-auto mb-3" size={32} />

            {file ? (
              <p className="font-medium">{file.name}</p>
            ) : (
              <p>Select your bank statement PDF</p>
            )}

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={!file || status === "uploading"}
          >
            {status === "uploading" ? "Uploading..." : "Scan Statement"}
          </Button>

          {/* Status */}
          {status === "uploading" && (
            <div className="flex items-center gap-2 text-blue-500">
              <Loader2 className="animate-spin w-4 h-4" />
              Uploading statement...
            </div>
          )}

          {status === "queued" && (
            <div className="flex items-center gap-2 text-blue-500 text-sm font-bold">
              <Loader2 className="animate-spin w-4 h-4" />
              Processing in background...you can leave this page, we&apos;ll notify you once done!
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              Something went wrong
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🟪 RIGHT: PDF Preview */}
      <div className="border rounded-xl flex items-center justify-center min-h-[500px] overflow-hidden">

        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full"
          />
        ) : (
          <p className="text-muted-foreground">
            PDF preview will appear here
          </p>
        )}

      </div>

    </div>
  </div>
);
}
