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
  Calendar,
  Trophy,
  Users,
  Loader2 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
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
      toast.error("Please login to view matches");
      router.push("/login");
      return;
    }
    
    fetchMatches();
  }, [isLoggedIn, router]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("http://localhost:5000/api/getall/matches", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch matches");
      }

      const matchesData = data.matches || [];
      setMatches(matchesData);
      
      // Fetch team details for each unique team in the matches
      const teamIds = new Set();
      matchesData.forEach(match => {
        if (match.team1) teamIds.add(match.team1);
        if (match.team2) teamIds.add(match.team2);
      });
      
      await fetchTeamDetails(Array.from(teamIds));
      
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError(error.message || "Failed to load matches. Please try again.");
      toast.error("Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTeamDetails = async (teamIds) => {
    try {
      const teamDetailsObj = {};
      
      // For each team ID, fetch the team details
      for (const teamId of teamIds) {
        const response = await fetch(`http://localhost:5000/api/get/team/${teamId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
        });
        
        if (response.ok) {
          const teamData = await response.json();
          teamDetailsObj[teamId] = teamData.attr;
        }
      }
      
      setTeams(teamDetailsObj);
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter matches based on search query
  const filteredMatches = matches.filter(match => {
    const team1Name = teams[match.team1]?.teamName?.toLowerCase() || "";
    const team2Name = teams[match.team2]?.teamName?.toLowerCase() || "";
    const searchLower = searchQuery.toLowerCase();
    
    return team1Name.includes(searchLower) || 
           team2Name.includes(searchLower) ||
           (match.venue && match.venue.toLowerCase().includes(searchLower));
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cricket Matches</h1>
          <p className="text-muted-foreground">View and manage cricket matches</p>
        </div>

        {isLoggedIn && (
          <Button asChild>
            <Link href="/matches/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Match
            </Link>
          </Button>
        )}
      </div>

      {/* Search box */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search matches..."
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
          <span className="ml-2">Loading matches...</span>
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Matches Found</CardTitle>
            <CardDescription>
              There are no cricket matches available yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-6">
              <Button asChild>
                <Link href="/matches/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Match
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <Link key={match.id} href={`/matches/${match.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 text-primary mr-2" />
                    {teams[match.team1]?.teamName || "Team 1"} vs {teams[match.team2]?.teamName || "Team 2"}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(match.matchDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-500">
                        {match.venue || "Venue not specified"}
                      </span>
                    </div>
                    {match.status && (
                      <div className="text-sm font-medium">
                        Status: <span className="text-primary">{match.status}</span>
                      </div>
                    )}
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