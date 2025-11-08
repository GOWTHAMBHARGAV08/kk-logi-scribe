import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Download, Edit, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { User, Session } from "@supabase/supabase-js";

interface Trip {
  id: string;
  date: string;
  trip_id: string;
  vehicle: string;
  driver_name: string;
  revenue: number;
  fuel: number;
  driver_fee: number;
  handling_fee: number;
  tolls: number;
  petty_cash: number;
  other_expenses: number;
  notes: string;
}

const Trips = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  useEffect(() => {
    filterTrips();
  }, [searchTerm, trips]);

  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user?.id)
      .order("date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load trips",
        variant: "destructive",
      });
    } else {
      setTrips(data || []);
      setFilteredTrips(data || []);
    }
    setLoading(false);
  };

  const filterTrips = () => {
    if (!searchTerm) {
      setFilteredTrips(trips);
      return;
    }

    const filtered = trips.filter(
      (trip) =>
        trip.trip_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.date.includes(searchTerm)
    );
    setFilteredTrips(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("trips").delete().eq("id", deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });
      fetchTrips();
    }
    setDeleteId(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Trip ID",
      "Vehicle",
      "Driver",
      "Revenue",
      "Fuel",
      "Driver Fee",
      "Handling",
      "Tolls",
      "Petty Cash",
      "Other",
      "Total Expenses",
      "Profit",
      "Notes",
    ];

    const csvData = filteredTrips.map((trip) => {
      const totalExpenses =
        Number(trip.fuel) +
        Number(trip.driver_fee) +
        Number(trip.handling_fee) +
        Number(trip.tolls) +
        Number(trip.petty_cash || 0) +
        Number(trip.other_expenses || 0);
      
      const profit = Number(trip.revenue || 0) - totalExpenses;

      return [
        format(new Date(trip.date), "yyyy-MM-dd"),
        trip.trip_id,
        trip.vehicle,
        trip.driver_name,
        trip.revenue || 0,
        trip.fuel,
        trip.driver_fee,
        trip.handling_fee,
        trip.tolls,
        trip.petty_cash || 0,
        trip.other_expenses || 0,
        totalExpenses,
        profit,
        trip.notes || "",
      ];
    });

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trips_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Trips exported successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Trips</h1>
            <p className="text-muted-foreground">Browse and manage trip records</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/add-trip")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trip
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date, trip ID, vehicle, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Trip ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead className="text-right text-success">Revenue</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right font-semibold">Profit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredTrips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No trips found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrips.map((trip) => {
                      const totalExpenses =
                        Number(trip.fuel) +
                        Number(trip.driver_fee) +
                        Number(trip.handling_fee) +
                        Number(trip.tolls) +
                        Number(trip.petty_cash || 0) +
                        Number(trip.other_expenses || 0);
                      
                      const profit = Number(trip.revenue || 0) - totalExpenses;

                      return (
                        <TableRow key={trip.id}>
                          <TableCell>{format(new Date(trip.date), "MMM dd, yyyy")}</TableCell>
                          <TableCell className="font-medium">{trip.trip_id}</TableCell>
                          <TableCell>{trip.vehicle}</TableCell>
                          <TableCell>{trip.driver_name}</TableCell>
                          <TableCell className="text-right text-success font-medium">₹{Number(trip.revenue || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{totalExpenses.toLocaleString()}</TableCell>
                          <TableCell className={`text-right font-semibold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            ₹{profit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/edit-trip/${trip.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(trip.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trip record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Trips;