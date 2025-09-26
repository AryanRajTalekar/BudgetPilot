// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import axios from "axios";

const Dashboard = () => {
    const { user } = useUser();
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${user.id}`);
                 console.log("Fetched user data:", res.data);
                setTransactions(res.data.transactions || []);
                setBudgets(res.data.budgets || []);
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };

        if (user) fetchUserData();
    }, [user]);

    return (
        <>
            <SignedIn>
                {user ? (
                    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome, {user.fullName} 👋
                        </h1>

                        {/* Budgets Section */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {budgets.length > 0 ? (
                                budgets.map((b, idx) => (
                                    <div key={idx} className="bg-white shadow-md rounded-lg p-6">
                                        <h2 className="text-xl font-semibold mb-2">{b.category}</h2>
                                        <p className="text-gray-600">Limit: ₹{b.limit}</p>
                                        <p className="text-gray-600">Spent: ₹{b.spent}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white shadow-md rounded-lg p-6 col-span-full">
                                    <p className="text-gray-600">No budgets yet. Add one!</p>
                                </div>
                            )}
                        </div>

                        {/* Transactions Section */}
                        <div className="mt-12 bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Transactions</h2>
                            {transactions.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {transactions.map((t, i) => (
                                        <li
                                            key={i}
                                            className="py-3 flex justify-between items-center"
                                        >
                                            <span className="font-medium text-gray-900">{t.category}</span>
                                            <span className="text-gray-700 font-semibold">₹{t.amount}</span>
                                            <span className="text-gray-500 text-sm">
                                                {new Date(t.date).toLocaleDateString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600">No transactions yet.</p>
                            )}
                        </div>

                    </div>
                ) : (
                    <p className="text-center mt-20 text-gray-700">Loading your data...</p>
                )}
            </SignedIn>

            <SignedOut>
                <p className="text-center mt-20 text-gray-700">Please sign in to view your dashboard.</p>
            </SignedOut>
        </>
    );
};

export default Dashboard;
