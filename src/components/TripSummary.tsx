import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    totalRevenue: 0,
    totalFuel: 0,
    totalDriverFee: 0,
    totalHandling: 0,
    totalTolls: 0,
    totalPettyCash: 0,
    totalOther: 0,
    tripCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vehicleBreakdown, setVehicleBreakdown] = useState<Array<{ vehicle: string; total: number }>>([]);

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
          totalRevenue: acc.totalRevenue + Number(trip.revenue || 0),
          totalFuel: acc.totalFuel + Number(trip.fuel || 0),
          totalDriverFee: acc.totalDriverFee + Number(trip.driver_fee || 0),
          totalHandling: acc.totalHandling + Number(trip.handling_fee || 0),
          totalTolls: acc.totalTolls + Number(trip.tolls || 0),
          totalPettyCash: acc.totalPettyCash + Number(trip.petty_cash || 0),
          totalOther: acc.totalOther + Number(trip.other_expenses || 0),
          tripCount: acc.tripCount + 1,
        }),
        {
          totalRevenue: 0,
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

  const fetchVehicleBreakdown = async (category: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("trips")
      .select("vehicle, fuel, driver_fee, handling_fee, tolls, petty_cash, other_expenses")
      .eq("user_id", userId)
      .gte("date", format(dateRange.from, "yyyy-MM-dd"))
      .lte("date", format(dateRange.to, "yyyy-MM-dd"));

    if (error) {
      console.error("Error fetching vehicle breakdown:", error);
      return;
    }

    const fieldMap: Record<string, keyof typeof data[0]> = {
      Fuel: "fuel",
      "Driver Fees": "driver_fee",
      Handling: "handling_fee",
      Tolls: "tolls",
      "Petty Cash": "petty_cash",
      Other: "other_expenses",
    };

    const field = fieldMap[category];
    const vehicleTotals = data.reduce((acc, trip) => {
      const vehicle = trip.vehicle || "Unknown";
      const amount = Number(trip[field] || 0);
      if (!acc[vehicle]) {
        acc[vehicle] = 0;
      }
      acc[vehicle] += amount;
      return acc;
    }, {} as Record<string, number>);

    const breakdown = Object.entries(vehicleTotals)
      .map(([vehicle, total]) => ({ vehicle, total }))
      .sort((a, b) => b.total - a.total);

    setVehicleBreakdown(breakdown);
  };

  const handleCardClick = (category: string) => {
    setSelectedCategory(category);
    fetchVehicleBreakdown(category);
  };

  const totalExpenses =
    summary.totalFuel +
    summary.totalDriverFee +
    summary.totalHandling +
    summary.totalTolls +
    summary.totalPettyCash +
    summary.totalOther;

  const totalProfit = summary.totalRevenue - totalExpenses;

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-success/10 border-success/20">
          <CardHeader>
            <CardTitle className="text-lg text-success">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">₹{summary.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className={totalProfit >= 0 ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
          <CardHeader>
            <CardTitle className="text-lg">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalProfit.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-2">{summary.tripCount} trips</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryItems.map((item) => (
          <Card 
            key={item.label} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(item.label)}
          >
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

      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCategory} - Vehicle Breakdown</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {vehicleBreakdown.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleBreakdown.map((item) => (
                    <TableRow key={item.vehicle}>
                      <TableCell className="font-medium">{item.vehicle}</TableCell>
                      <TableCell className="text-right">₹{item.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">No data available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};