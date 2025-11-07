import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, FileText, BarChart3, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">KK Logistics</h1>
              <p className="text-sm text-muted-foreground">Trip & Expense Manager</p>
            </div>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Manage Your Logistics Business Digitally
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Replace handwritten books with a simple, secure digital solution to track trips and expenses
          </p>
          <Button size="lg" className="mt-8" onClick={() => navigate("/auth")}>
            Start Managing Trips
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Record Keeping</h3>
            <p className="text-muted-foreground">
              Quickly add trips with all expenses in one place. No more messy books.
            </p>
          </div>

          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Reports</h3>
            <p className="text-muted-foreground">
              View summaries, search records, and export data to CSV anytime.
            </p>
          </div>

          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your data is protected with secure authentication and cloud backup.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 KK Logistics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
