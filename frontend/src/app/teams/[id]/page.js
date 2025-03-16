"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trophy,
  Users,
  User,
  Calendar,
  ArrowLeft,
  Loader2,
  Edit,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeamDetailPage({ params }) {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = params;

  const isLoggedIn = typeof window !== "undefined" 
    ? localStorage.getItem("isLoggedIn") === "true" 
    : false;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to view team details");
      router.push("/login");
      return;
    }

    fetchTeamDetails();
  }, [id, isLoggedIn, router]);

  const fetchTeamDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const team_id = await params.id;

      const response = await fetch(`http://localhost:5000/api/get/team/${team_id}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch team details");
      }

      setTeam(data.attr);
      
      // If we have player IDs, fetch player details
      if (data.attr?.playerID?.length) {
        await fetchPlayerDetails(data.attr.playerID);
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
      setError(error.message || "Failed to load team. Please try again.");
      toast.error("Failed to load team details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayerDetails = async (playerIds) => {
    try {
      // This is a placeholder - you'll need to implement the API call to fetch player details
      // Example: GET /api/players?ids=[...playerIds]
      
      // For now, we'll just create dummy player data
      const dummyPlayers = playerIds.map((playerId, index) => ({
        id: playerId,
        playerName: `Player ${index + 1}`,
        specialization: index % 3 === 0 ? "Batsman" : index % 3 === 1 ? "Bowler" : "All-Rounder",
        nationality: "Unknown",
        numberOfMatches: Math.floor(Math.random() * 50) + 1
      }));
      
      setPlayers(dummyPlayers);
    } catch (error) {
      console.error("Error fetching player details:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading team details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="mb-2">
              <Link href="/teams">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Trophy className="h-6 w-6 text-primary mr-2" />
            {team?.teamName || "Team Details"}
          </h1>
          <p className="text-muted-foreground">
            Created on {new Date(team?.createdAt).toLocaleDateString()}
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href={`/teams/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Team
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              Team Players
            </CardTitle>
            <CardDescription>
              {players.length} players in this team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No players in this team yet</p>
                <Button className="mt-4" asChild>
                  <Link href={`/teams/${id}/edit`}>Add Players</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Matches</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <Link href={`/players/${player.id}`} className="hover:underline flex items-center">
                          <User className="h-3 w-3 mr-1 text-gray-500" />
                          {player.playerName}
                        </Link>
                      </TableCell>
                      <TableCell>{player.specialization}</TableCell>
                      <TableCell>{player.nationality}</TableCell>
                      <TableCell>{player.numberOfMatches}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}