import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";

interface Record {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
}

const expenseCategories = ["Seeds", "Fertilizer", "Labor", "Transport", "Equipment", "Pesticides", "Other"];
const incomeCategories = ["Crop Sales", "Livestock", "Market Sales", "Contract Farming", "Other"];

const FarmRecords = () => {
  const [records, setRecords] = useState<Record[]>([
    { id: "1", type: "expense", category: "Seeds", description: "Maize seeds (10kg)", amount: 15000, date: "2026-01-15" },
    { id: "2", type: "expense", category: "Fertilizer", description: "NPK fertilizer (50kg)", amount: 45000, date: "2026-01-20" },
    { id: "3", type: "income", category: "Crop Sales", description: "Sold groundnuts (50kg)", amount: 75000, date: "2026-02-01" },
    { id: "4", type: "expense", category: "Labor", description: "Hired 3 workers for planting", amount: 12000, date: "2026-02-03" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "expense" as "income" | "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const totalIncome = records.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const totalExpense = records.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatMWK = (amount: number) => `MK ${amount.toLocaleString()}`;

  const addRecord = () => {
    if (!newRecord.category || !newRecord.description || !newRecord.amount) return;
    const record: Record = {
      id: Date.now().toString(),
      type: newRecord.type,
      category: newRecord.category,
      description: newRecord.description,
      amount: parseInt(newRecord.amount),
      date: newRecord.date,
    };
    setRecords([record, ...records]);
    setNewRecord({ type: "expense", category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="Farm Records" subtitle="Track expenses and manage your farm budget" />

      <div className="px-4 -mt-3 relative z-10 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-3 shadow-card border border-border text-center">
            <TrendingUp size={18} className="text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground font-medium">Income</p>
            <p className="text-sm font-bold text-primary">{formatMWK(totalIncome)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl p-3 shadow-card border border-border text-center">
            <TrendingDown size={18} className="text-destructive mx-auto mb-1" />
            <p className="text-xs text-muted-foreground font-medium">Expenses</p>
            <p className="text-sm font-bold text-destructive">{formatMWK(totalExpense)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-3 shadow-card border border-border text-center">
            <Wallet size={18} className={`mx-auto mb-1 ${balance >= 0 ? "text-primary" : "text-destructive"}`} />
            <p className="text-xs text-muted-foreground font-medium">Balance</p>
            <p className={`text-sm font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>{formatMWK(balance)}</p>
          </motion.div>
        </div>

        {/* Add Record Button */}
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full gradient-earth text-primary-foreground border-0 font-bold"
        >
          <Plus size={18} className="mr-2" />
          {showForm ? "Cancel" : "Add New Record"}
        </Button>

        {/* Add Record Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border space-y-3 overflow-hidden"
            >
              <div className="flex gap-2">
                <Button
                  variant={newRecord.type === "expense" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRecord({ ...newRecord, type: "expense", category: "" })}
                  className={newRecord.type === "expense" ? "gradient-earth text-primary-foreground border-0" : ""}
                >
                  Expense
                </Button>
                <Button
                  variant={newRecord.type === "income" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRecord({ ...newRecord, type: "income", category: "" })}
                  className={newRecord.type === "income" ? "gradient-harvest text-accent-foreground border-0" : ""}
                >
                  Income
                </Button>
              </div>

              <Select value={newRecord.category} onValueChange={(v) => setNewRecord({ ...newRecord, category: v })}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {(newRecord.type === "expense" ? expenseCategories : incomeCategories).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Description (e.g., Bought 10kg maize seeds)"
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                className="bg-background"
              />
              <Input
                type="number"
                placeholder="Amount (MK)"
                value={newRecord.amount}
                onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                className="bg-background"
              />
              <Input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                className="bg-background"
              />
              <Button onClick={addRecord} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
                Save Record
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Records List */}
        <div className="space-y-2 pb-6">
          <h3 className="text-base font-bold text-foreground font-serif">Recent Records</h3>
          {records.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-3.5 shadow-soft border border-border flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                record.type === "income" ? "bg-primary/10" : "bg-destructive/10"
              }`}>
                {record.type === "income" ? (
                  <TrendingUp size={18} className="text-primary" />
                ) : (
                  <TrendingDown size={18} className="text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{record.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag size={10} /> {record.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} /> {record.date}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold text-sm ${record.type === "income" ? "text-primary" : "text-destructive"}`}>
                  {record.type === "income" ? "+" : "-"}{formatMWK(record.amount)}
                </p>
              </div>
              <button onClick={() => deleteRecord(record.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmRecords;
