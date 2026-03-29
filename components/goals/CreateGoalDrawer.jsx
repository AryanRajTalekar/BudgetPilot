"use client";

import { useState, useTransition, useEffect } from "react";
import { createGoal } from "@/actions/goals";
import { getUserAccounts } from "@/actions/dashboard";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function CreateGoalDrawer() {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: "",
    description: "",
    targetAmount: "",
    targetDate: "",
    accountId: "",
  });

  // Load accounts when drawer opens
  useEffect(() => {
    if (open) {
      getUserAccounts().then((data) => {
        setAccounts(data || []);
        // Pre-select default account if available
        const def = data?.find((a) => a.isDefault);
        if (def) setForm((f) => ({ ...f, accountId: def.id }));
      });
    }
  }, [open]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("Goal title is required");
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0)
      return toast.error("Enter a valid target amount");
    if (!form.targetDate) return toast.error("Select a target date");
    if (!form.accountId) return toast.error("Select an account to link");

    // Target date must be in the future
    if (new Date(form.targetDate) <= new Date())
      return toast.error("Target date must be in the future");

    startTransition(async () => {
      const res = await createGoal({
        title: form.title.trim(),
        description: form.description.trim(),
        targetAmount: parseFloat(form.targetAmount),
        targetDate: form.targetDate,
        accountId: form.accountId,
      });

      if (res.success) {
        toast.success(`Goal "${form.title}" created!`);
        setOpen(false);
        setForm({
          title: "",
          description: "",
          targetAmount: "",
          targetDate: "",
          accountId: "",
        });
      } else {
        toast.error(res.error || "Failed to create goal");
      }
    });
  };

  // Min date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a new financial goal</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4 max-w-md mx-auto w-full">

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Goal name</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Emergency fund, New laptop"
              value={form.title}
              onChange={handleChange}
              disabled={pending}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="What's this goal for?"
              value={form.description}
              onChange={handleChange}
              disabled={pending}
            />
          </div>

          {/* Target amount */}
          <div className="space-y-1.5">
            <Label htmlFor="targetAmount">Target amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="1"
                step="1"
                placeholder="50000"
                className="pl-7"
                value={form.targetAmount}
                onChange={handleChange}
                disabled={pending}
              />
            </div>
          </div>

          {/* Target date */}
          <div className="space-y-1.5">
            <Label htmlFor="targetDate">Target date</Label>
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              min={minDateStr}
              value={form.targetDate}
              onChange={handleChange}
              disabled={pending}
            />
          </div>

          {/* Account selector */}
          <div className="space-y-1.5">
            <Label htmlFor="accountId">Link to account</Label>
            <select
              id="accountId"
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              disabled={pending || accounts.length === 0}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              <option value="">
                {accounts.length === 0 ? "Loading accounts…" : "Select account"}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ₹{Number(acc.balance).toLocaleString("en-IN")}
                  {acc.isDefault ? " (default)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={pending}
            >
              {pending ? "Creating…" : "Create goal"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}