import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const { edit: editId } = await searchParams;


  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
  <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-6">

    {/* Heading */}
    <div className="max-w-[1400px] mx-auto mb-8">
      <h1 className="text-5xl gradient-title">
        Add Transaction
      </h1>
    </div>

    {/* Form */}
    <div className="max-w-[1400px] mx-auto">
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>

  </div>
);
}
