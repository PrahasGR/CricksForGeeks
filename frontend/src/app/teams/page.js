"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  PlusCircle, 
  Search, 
  Trophy,
  Users,
  Loader2 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const isLoggedIn = typeof window !== "undefined" 
    ? localStorage.getItem("isLoggedIn") === "true" 
    : false;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to view teams");
      router.push("/login");
      return;
    }
    
    fetchTeams();
  }, [isLoggedIn, router]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("http://localhost:5000/api/getall/teams", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch teams");
      }

      setTeams(data.attr || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setError(error.message || "Failed to load teams. Please try again.");
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => 
    team.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cricket Teams</h1>
          <p className="text-muted-foreground">View and manage cricket teams</p>
        </div>

        {isLoggedIn && (
          <Button asChild>
            <Link href="/teams/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        )}
      </div>

      {/* Search box */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading teams...</span>
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Teams Found</CardTitle>
            <CardDescription>
              There are no cricket teams available yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-6">
              <Button asChild>
                <Link href="/teams/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 text-primary mr-2" />
                    {team.teamName}
                  </CardTitle>
                  <CardDescription>
                    {team.playerID?.length || 0} players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">
                      {team.playerID?.length ? "View team details" : "No players in this team"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}