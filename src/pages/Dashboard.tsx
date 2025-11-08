import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, LogOut, Plus, List, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { TripSummary } from "@/components/TripSummary";
import { DateRangePicker } from "@/components/DateRangePicker";
import { startOfMonth, endOfMonth } from "date-fns";
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
      navigate("/auth");
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Truck className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive rounded-lg">
              <Truck className="h-6 w-6 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-destructive">KK LOGISTICS</h1>
              <p className="text-sm text-destructive">Trip & Expense Manager, AMALESH</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your trips and expenses</p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filter by Date Range
              </CardTitle>
              <CardDescription>Select a date range to view summary</CardDescription>
            </CardHeader>
            <CardContent>
              <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
            </CardContent>
          </Card>
        </div>

        <TripSummary dateRange={dateRange} userId={user?.id} />

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/add-trip")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Trip
              </CardTitle>
              <CardDescription>Record a new trip with all expenses</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/trips")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                View All Trips
              </CardTitle>
              <CardDescription>Browse, search, and export trip records</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>;
};
export default Dashboard;