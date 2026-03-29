"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <Card
      className="hover:shadow-md transition-all duration-300 group relative 
                   bg-white dark:bg-zinc-900/70 
                   border border-black/5 dark:border-white/5 
                   backdrop-blur-xl"
    >
      <Link href={`/account/${id}`} className="block h-full">
        <CardHeader
          className="flex flex-row items-center justify-between 
                             space-y-0 pb-2 px-4 sm:px-6"
        >
          <CardTitle className="text-sm sm:text-base font-medium capitalize">
            {name}
          </CardTitle>

          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="text-xl sm:text-2xl font-bold">
             ₹{parseFloat(balance).toFixed(2)}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter
          className="flex justify-between 
                             text-xs sm:text-sm 
                             text-muted-foreground 
                             px-4 sm:px-6 pb-4"
        >
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>

          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
