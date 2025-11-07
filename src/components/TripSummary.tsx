import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Fuel, Users, Truck, CreditCard, Wallet } from "lucide-react";
import { format } from "date-fns";

interface TripSummaryProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  userId?: string;
}

export const TripSummary = ({ dateRange, userId }: TripSummaryProps) => {
  const [summary, setSummary] = useState({
    totalFuel: 0,
    totalDriverFee: 0,
    totalHandling: 0,
    totalTolls: 0,
    totalPettyCash: 0,
    totalOther: 0,
    tripCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!userId) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", userId)
        .gte("date", format(dateRange.from, "yyyy-MM-dd"))
        .lte("date", format(dateRange.to, "yyyy-MM-dd"));

      if (error) {
        console.error("Error fetching summary:", error);
        setLoading(false);
        return;
      }

      const totals = data.reduce(
        (acc, trip) => ({
          totalFuel: acc.totalFuel + Number(trip.fuel || 0),
          totalDriverFee: acc.totalDriverFee + Number(trip.driver_fee || 0),
          totalHandling: acc.totalHandling + Number(trip.handling_fee || 0),
          totalTolls: acc.totalTolls + Number(trip.tolls || 0),
          totalPettyCash: acc.totalPettyCash + Number(trip.petty_cash || 0),
          totalOther: acc.totalOther + Number(trip.other_expenses || 0),
          tripCount: acc.tripCount + 1,
        }),
        {
          totalFuel: 0,
          totalDriverFee: 0,
          totalHandling: 0,
          totalTolls: 0,
          totalPettyCash: 0,
          totalOther: 0,
          tripCount: 0,
        }
      );

      setSummary(totals);
      setLoading(false);
    };

    fetchSummary();
  }, [dateRange, userId]);

  const grandTotal =
    summary.totalFuel +
    summary.totalDriverFee +
    summary.totalHandling +
    summary.totalTolls +
    summary.totalPettyCash +
    summary.totalOther;

  const summaryItems = [
    { label: "Fuel", value: summary.totalFuel, icon: Fuel, color: "text-orange-600" },
    { label: "Driver Fees", value: summary.totalDriverFee, icon: Users, color: "text-blue-600" },
    { label: "Handling", value: summary.totalHandling, icon: Truck, color: "text-green-600" },
    { label: "Tolls", value: summary.totalTolls, icon: CreditCard, color: "text-purple-600" },
    { label: "Petty Cash", value: summary.totalPettyCash, icon: Wallet, color: "text-yellow-600" },
    { label: "Other", value: summary.totalOther, icon: DollarSign, color: "text-red-600" },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">₹{grandTotal.toLocaleString()}</p>
          <p className="text-sm opacity-90 mt-2">{summary.tripCount} trips recorded</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryItems.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{item.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};