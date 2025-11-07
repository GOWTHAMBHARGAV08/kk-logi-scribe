import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar as CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { User, Session } from "@supabase/supabase-js";

const tripSchema = z.object({
  date: z.date(),
  trip_id: z.string().trim().min(1, "Trip ID is required"),
  vehicle: z.string().trim().min(1, "Vehicle number is required"),
  driver_name: z.string().trim().min(1, "Driver name is required"),
  fuel: z.number().min(0, "Fuel cost must be 0 or greater"),
  driver_fee: z.number().min(0, "Driver fee must be 0 or greater"),
  handling_fee: z.number().min(0, "Handling fee must be 0 or greater"),
  tolls: z.number().min(0, "Tolls must be 0 or greater"),
  petty_cash: z.number().min(0, "Petty cash must be 0 or greater").optional(),
  pc_note: z.string().optional(),
  other_expenses: z.number().min(0, "Other expenses must be 0 or greater").optional(),
  other_expenses_description: z.string().optional(),
  notes: z.string().optional(),
});

const AddTrip = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [tripId, setTripId] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driverName, setDriverName] = useState("");
  const [fuel, setFuel] = useState("");
  const [driverFee, setDriverFee] = useState("");
  const [handlingFee, setHandlingFee] = useState("");
  const [tolls, setTolls] = useState("");
  const [pettyCash, setPettyCash] = useState("");
  const [pcNote, setPcNote] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [otherExpensesDescription, setOtherExpensesDescription] = useState("");
  const [notes, setNotes] = useState("");
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
    if (isEdit && user) {
      fetchTrip();
    }
  }, [isEdit, id, user]);

  const fetchTrip = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load trip data",
        variant: "destructive",
      });
      return;
    }

    setDate(new Date(data.date));
    setTripId(data.trip_id);
    setVehicle(data.vehicle);
    setDriverName(data.driver_name);
    setFuel(data.fuel.toString());
    setDriverFee(data.driver_fee.toString());
    setHandlingFee(data.handling_fee.toString());
    setTolls(data.tolls.toString());
    setPettyCash(data.petty_cash?.toString() || "");
    setPcNote(data.pc_note || "");
    setOtherExpenses(data.other_expenses?.toString() || "");
    setOtherExpensesDescription(data.other_expenses_description || "");
    setNotes(data.notes || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tripData = {
      date,
      trip_id: tripId,
      vehicle,
      driver_name: driverName,
      fuel: parseFloat(fuel) || 0,
      driver_fee: parseFloat(driverFee) || 0,
      handling_fee: parseFloat(handlingFee) || 0,
      tolls: parseFloat(tolls) || 0,
      petty_cash: pettyCash ? parseFloat(pettyCash) : 0,
      pc_note: pcNote,
      other_expenses: otherExpenses ? parseFloat(otherExpenses) : 0,
      other_expenses_description: otherExpensesDescription,
      notes,
    };

    const validation = tripSchema.safeParse(tripData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        const formattedDate = format(validation.data.date, "yyyy-MM-dd");
        const { error } = await supabase
          .from("trips")
          .update({
            trip_id: validation.data.trip_id,
            vehicle: validation.data.vehicle,
            driver_name: validation.data.driver_name,
            fuel: validation.data.fuel,
            driver_fee: validation.data.driver_fee,
            handling_fee: validation.data.handling_fee,
            tolls: validation.data.tolls,
            petty_cash: validation.data.petty_cash || 0,
            pc_note: validation.data.pc_note || null,
            other_expenses: validation.data.other_expenses || 0,
            other_expenses_description: validation.data.other_expenses_description || null,
            notes: validation.data.notes || null,
            date: formattedDate,
          })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Trip updated successfully",
        });
      } else {
        const formattedDate = format(validation.data.date, "yyyy-MM-dd");
        const { error } = await supabase.from("trips").insert({
          trip_id: validation.data.trip_id,
          vehicle: validation.data.vehicle,
          driver_name: validation.data.driver_name,
          fuel: validation.data.fuel,
          driver_fee: validation.data.driver_fee,
          handling_fee: validation.data.handling_fee,
          tolls: validation.data.tolls,
          petty_cash: validation.data.petty_cash || 0,
          pc_note: validation.data.pc_note || null,
          other_expenses: validation.data.other_expenses || 0,
          other_expenses_description: validation.data.other_expenses_description || null,
          notes: validation.data.notes || null,
          date: formattedDate,
          user_id: user?.id,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Trip added successfully",
        });
      }

      navigate("/trips");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{isEdit ? "Edit Trip" : "Add New Trip"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trip_id">Trip ID / Route *</Label>
                  <Input
                    id="trip_id"
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle / Truck No. *</Label>
                  <Input
                    id="vehicle"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_name">Driver Name *</Label>
                <Input
                  id="driver_name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel (₹) *</Label>
                  <Input
                    id="fuel"
                    type="number"
                    step="0.01"
                    min="0"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver_fee">Driver Fee (₹) *</Label>
                  <Input
                    id="driver_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={driverFee}
                    onChange={(e) => setDriverFee(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="handling_fee">Handling Fee (₹) *</Label>
                  <Input
                    id="handling_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={handlingFee}
                    onChange={(e) => setHandlingFee(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tolls">Total Gate / Tolls (₹) *</Label>
                  <Input
                    id="tolls"
                    type="number"
                    step="0.01"
                    min="0"
                    value={tolls}
                    onChange={(e) => setTolls(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petty_cash">Petty Cash (₹)</Label>
                  <Input
                    id="petty_cash"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pettyCash}
                    onChange={(e) => setPettyCash(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pc_note">PC Note (if unknown)</Label>
                  <Input
                    id="pc_note"
                    value={pcNote}
                    onChange={(e) => setPcNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="other_expenses">Other Expenses (₹)</Label>
                  <Input
                    id="other_expenses"
                    type="number"
                    step="0.01"
                    min="0"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other_expenses_description">Description</Label>
                  <Input
                    id="other_expenses_description"
                    value={otherExpensesDescription}
                    onChange={(e) => setOtherExpensesDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : isEdit ? "Update Trip" : "Save Trip"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddTrip;