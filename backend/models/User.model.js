import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, // Clerk's user ID
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },

    // App-specific role
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Financial details
    income: { type: Number, default: 0 }, // Monthly or annual income
    loans: [
      {
        type: { type: String, enum: ["home", "car", "personal", "education", "other"] },
        amount: Number,
        emi: Number,
        remainingTenure: Number, // in months
      }
    ],

    goals: [
      {
        title: String,       // e.g. "Buy a car", "Save for retirement"
        targetAmount: Number,
        currentProgress: { type: Number, default: 0 },
        deadline: Date,
      }
    ],

    // Budgets
    budgets: [
      { category: String, limit: Number, spent: { type: Number, default: 0 } }
    ],

    // Transactions
    transactions: [
      {
        amount: Number,
        category: String,
        description: String,
        date: { type: Date, default: Date.now },
        paymentMethod: { type: String, enum: ["cash", "upi", "card", "bank"] },
        receiptUrl: String,
      }
    ],

    // Investment profile
    investmentProfile: {
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      watchlist: [String],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
