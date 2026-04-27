import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FarmRecord {
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
  const { user } = useAuth();
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "expense" as "income" | "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("farm_records")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setRecords((data || []) as FarmRecord[]);
        setLoading(false);
      });
  }, [user]);

  const totalIncome = records.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = records.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
  const balance = totalIncome - totalExpense;
  const formatMWK = (a: number) => `MK ${a.toLocaleString()}`;

  const addRecord = async () => {
    if (!user || !newRecord.category || !newRecord.description || !newRecord.amount) {
      toast.error("Fill in all fields"); return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("farm_records")
      .insert({
        user_id: user.id,
        type: newRecord.type,
        category: newRecord.category,
        description: newRecord.description.slice(0, 200),
        amount: parseFloat(newRecord.amount),
        date: newRecord.date,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setRecords([data as FarmRecord, ...records]);
    setNewRecord({ type: "expense", category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    toast.success("Record saved");
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("farm_records").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto">
      <PageHeader title="Farm Records" subtitle="Track expenses and manage your farm budget" />
      <div className="px-4 sm:px-0 mt-6 space-y-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 shadow-card border border-border text-center">
            <TrendingUp size={20} className="text-primary mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground font-medium">Income</p>
            <p className="text-sm font-bold text-primary mt-0.5">{formatMWK(totalIncome)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl p-4 shadow-card border border-border text-center">
            <TrendingDown size={20} className="text-destructive mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground font-medium">Expenses</p>
            <p className="text-sm font-bold text-destructive mt-0.5">{formatMWK(totalExpense)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-4 shadow-card border border-border text-center">
            <Wallet size={20} className={`mx-auto mb-1.5 ${balance >= 0 ? "text-primary" : "text-destructive"}`} />
            <p className="text-xs text-muted-foreground font-medium">Balance</p>
            <p className={`text-sm font-bold mt-0.5 ${balance >= 0 ? "text-primary" : "text-destructive"}`}>{formatMWK(balance)}</p>
          </motion.div>
        </div>

        <Button onClick={() => setShowForm(!showForm)} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
          <Plus size={18} className="mr-2" /> {showForm ? "Cancel" : "Add New Record"}
        </Button>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-card rounded-xl p-4 shadow-card border border-border space-y-3 overflow-hidden">
              <div className="flex gap-2">
                <Button variant={newRecord.type === "expense" ? "default" : "outline"} size="sm" onClick={() => setNewRecord({ ...newRecord, type: "expense", category: "" })} className={newRecord.type === "expense" ? "gradient-earth text-primary-foreground border-0" : ""}>Expense</Button>
                <Button variant={newRecord.type === "income" ? "default" : "outline"} size="sm" onClick={() => setNewRecord({ ...newRecord, type: "income", category: "" })} className={newRecord.type === "income" ? "gradient-harvest text-accent-foreground border-0" : ""}>Income</Button>
              </div>
              <Select value={newRecord.category} onValueChange={(v) => setNewRecord({ ...newRecord, category: v })}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {(newRecord.type === "expense" ? expenseCategories : incomeCategories).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Description" maxLength={200} value={newRecord.description} onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })} className="bg-background" />
              <Input type="number" placeholder="Amount (MK)" value={newRecord.amount} onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })} className="bg-background" />
              <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} className="bg-background" />
              <Button onClick={addRecord} disabled={saving} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
                {saving ? <Loader2 className="animate-spin" size={16} /> : "Save Record"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-foreground font-serif">Recent Records</h3>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" /></div>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No records yet. Add your first one above.</p>
          ) : (
            records.map((record, index) => (
              <motion.div key={record.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.03, 0.3) }} className="bg-card rounded-xl p-4 shadow-soft border border-border flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                  {record.type === "income" ? <TrendingUp size={18} className="text-primary" /> : <TrendingDown size={18} className="text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{record.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Tag size={10} /> {record.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={10} /> {record.date}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${record.type === "income" ? "text-primary" : "text-destructive"}`}>
                    {record.type === "income" ? "+" : "-"}{formatMWK(Number(record.amount))}
                  </p>
                </div>
                <button onClick={() => deleteRecord(record.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmRecords;