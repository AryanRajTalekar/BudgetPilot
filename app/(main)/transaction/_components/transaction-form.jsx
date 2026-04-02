"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";
import { useState } from "react";
import Image from "next/image";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (data) => {
    if (data?.file) {
      const url = URL.createObjectURL(data.file);
      setPreviewUrl(url);
      setFileType(data.file.type);
    }

    if (data?.amount) {
      setValue("amount", data.amount.toString());
      setValue("date", new Date(data.date));
      if (data.description) setValue("description", data.description);
      if (data.category) setValue("category", data.category);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully",
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter(
    (category) => category.type === type,
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4 sm:gap-6">

        {/* 🟦 LEFT BOX (FORM + SCANNER) */}
        <div className="border rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6">
          {!editMode && (
            <ReceiptScanner
              onScanComplete={handleScanComplete}
              setPreviewUrl={setPreviewUrl}
              setFileType={setFileType}
              accountId={getValues("accountId")}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">
                Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={type}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900/70 border border-black/5 dark:border-white/5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount & Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-white dark:bg-zinc-900/70 border border-black/5 dark:border-white/5 focus-visible:ring-1 focus-visible:ring-purple-500"
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  Account
                </label>
                <Select
                  onValueChange={(value) => setValue("accountId", value)}
                  defaultValue={getValues("accountId")}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-900/70 border border-black/5 dark:border-white/5 focus:ring-1 focus:ring-purple-500">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} (₹
                        {parseFloat(account.balance).toFixed(2)})
                      </SelectItem>
                    ))}
                    <CreateAccountDrawer>
                      <Button
                        variant="ghost"
                        className="w-full text-left hover:bg-accent/50 dark:hover:bg-zinc-800/50"
                      >
                        Create Account
                      </Button>
                    </CreateAccountDrawer>
                  </SelectContent>
                </Select>
                {errors.accountId && (
                  <p className="text-sm text-red-500">
                    {errors.accountId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">
                Category
              </label>
              <Select
                onValueChange={(value) => setValue("category", value)}
                defaultValue={getValues("category")}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900/70 border border-black/5 dark:border-white/5 focus:ring-1 focus:ring-purple-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal bg-white dark:bg-zinc-900/70 border border-black/5 dark:border-white/5 hover:bg-accent/50 dark:hover:bg-zinc-800/50",
                      !date && "text-muted-foreground",
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => setValue("date", date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">
                Description
              </label>
              <Input
                placeholder="Enter description"
                className="bg-white dark:bg-zinc-900/70 border border-black/5 dark:border-white/5 focus-visible:ring-1 focus-visible:ring-purple-500"
                {...register("description")}
              />
            </div>

            {/* Recurring */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900/60 backdrop-blur-xl p-4">
              <div>
                <label className="text-base font-medium text-black dark:text-white">
                  Recurring Transaction
                </label>
                <div className="text-sm text-muted-foreground">
                  Set up a recurring schedule
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={transactionLoading} className="w-full sm:w-auto sm:flex-1">
                {transactionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editMode ? "Updating..." : "Creating..."}
                  </>
                ) : editMode ? (
                  "Update Transaction"
                ) : (
                  "Create Transaction"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* 🟪 RIGHT BOX (PREVIEW) */}
        <div className="border rounded-xl p-4 w-full h-[300px] sm:h-[420px] lg:h-[500px] overflow-hidden flex items-center justify-center bg-muted/20">
          {previewUrl ? (
            fileType?.startsWith("image") ? (
              <div className="relative w-full h-full">
                <Image
                  src={previewUrl}
                  alt="receipt"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <iframe src={previewUrl} className="w-full h-full" />
            )
          ) : (
            <p className="text-muted-foreground text-sm">Preview will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
}