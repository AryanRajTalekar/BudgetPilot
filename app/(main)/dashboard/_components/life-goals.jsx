"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { updateBudget } from "@/actions/budget";
import { updateGoal } from "@/actions/goals";
import { addFundsToGoal } from "@/actions/goals";
import { createGoal } from "@/actions/goals";

export function LifeGoals({ goal, accountId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(
    goal?.targetAmount?.toString() || "",
  );

  const [isAdding, setIsAdding] = useState(false);
  const [addAmount, setAddAmount] = useState("");

  const [newTitle, setNewTitle] = useState(goal?.title || "");

  const {
    loading: isLoading,
    fn: updateGoalFn,
    data: updatedGoal,
    error,
  } = useFetch(updateGoal);

  const {
    loading: isAddingFunds,
    fn: addFundsFn,
    data: addResult,
    error: addError,
  } = useFetch(addFundsToGoal);

  const percentSaved =
    goal && goal.targetAmount > 0
      ? (goal.savedAmount / goal.targetAmount) * 100
      : 0;

  const handleUpdateGoal = async () => {
    const amount = parseFloat(newTarget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!goal) {
      // create new goal
      const result = await createGoal({
        title: newTitle || "My Goal",
        targetAmount: amount,
        targetDate: new Date(),
        accountId: accountId,
      });

      if (result.success) {
        toast.success("Goal created successfully");
      } else {
        toast.error(result.error);
      }
    } else {
      // update existing goal
      await updateGoalFn(goal.id, {
        title: newTitle,
        targetAmount: amount,
      });
    }
  };

  const handleCancel = () => {
    setNewTarget(goal?.targetAmount?.toString() || "");
    setIsEditing(false);
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    await addFundsFn(goal.id, amount);

    setAddAmount("");
    setIsAdding(false);
  };

  useEffect(() => {
    if (updatedGoal?.success) {
      setIsEditing(false);
      toast.success("Goal updated successfully");
    }
  }, [updatedGoal]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update goal");
    }
  }, [error]);

  useEffect(() => {
    if (addResult?.success) {
      toast.success("Money added to goal");
    }
  }, [addResult]);

  useEffect(() => {
    if (addError) {
      toast.error(addError.message || "Failed to add funds");
    }
  }, [addError]);

  return (
    <Card
      className="bg-white dark:bg-zinc-900/70 
               border border-black/5 dark:border-white/5 
               backdrop-blur-xl 
               transition-all duration-300"
    >
      <CardHeader
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between 
                 space-y-2 sm:space-y-0 pb-4 px-4 sm:px-6"
      >
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full sm:w-48"
            />
          ) : (
            <CardTitle className="text-sm sm:text-base font-medium">
              {goal?.title || "Life Goal"}
            </CardTitle>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {isEditing ? (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full sm:w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateGoal}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription className="text-xs sm:text-sm">
                  {goal
                    ? ` ₹${Number(goal.savedAmount).toFixed(2)} of  ₹${Number(goal.targetAmount).toFixed(2)} saved`
                    : "No goal set"}
                </CardDescription>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-6">
        {goal && (
          <div className="space-y-3">
            <Progress
              value={percentSaved}
              extraStyles={`${
                percentSaved >= 100
                  ? "bg-green-500"
                  : percentSaved >= 75
                    ? "bg-yellow-500"
                    : "bg-blue-500"
              }`}
            />

            <p className="text-xs sm:text-sm text-muted-foreground text-right">
              {percentSaved.toFixed(1)}% saved
            </p>
          </div>
        )}
        {goal && (
          <div className="flex items-center gap-2 mt-3">
            {isAdding ? (
              <>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-28"
                />

                <Button
                  size="sm"
                  onClick={handleAddMoney}
                  disabled={isAddingFunds}
                >
                  Add
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                Add Money
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
