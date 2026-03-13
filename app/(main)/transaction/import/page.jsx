"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { importBankStatement } from "@/actions/importStatement";
import { FileUp, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImportStatementPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Import Bank Statement</h1>
        <p className="text-muted-foreground mt-1">
          Upload your monthly bank statement and BudgetPilot will automatically
          extract your transactions.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp size={20} />
            Upload PDF Statement
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          {/* Upload Area */}
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

          {/* Status Messages */}

          {status === "uploading" && (
            <div className="flex items-center gap-2 text-blue-500">
              <Loader2 className="animate-spin w-4 h-4" />
              Uploading statement...
            </div>
          )}

          {status === "queued" && (
            <div className="flex items-center gap-2 text-blue-500 text-sm font-bold">
              <Loader2 className="animate-spin w-4 h-4" />
              Statement uploaded successfully. Transactions will appear in your
              dashboard shortly.You can safely leave this page.
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              Something went wrong. Please try again.
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Your statement will be processed securely and transactions will be
            added automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
