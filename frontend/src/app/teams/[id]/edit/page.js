"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  Save,
  Search,
  CheckCircle,
  XCircle,
  User,
  Trophy,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";


// Form validation schema
const teamSchema = z.object({
  teamName: z
    .string()
    .min(2, { message: "Team name must be at least 2 characters" })
    .max(50, { message: "Team name must be at most 50 characters" }),
  playerID: z.array(z.string()).optional(),
});

export default function EditTeamPage({ params }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const router = useRouter();
  const { id } = params;

  const isLoggedIn = typeof window !== "undefined" 
    ? localStorage.getItem("isLoggedIn") === "true" 
    : false;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  // Initialize form
  const form = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamName: "",
      playerID: [],
    },
  });

  // Fetch team details and available players
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to edit this team");
      router.push("/login");
      return;
    }

    const fetchTeamAndPlayers = async () => {
      setIsFetching(true);
      try {
        // Fetch team details
        const teamResponse = await fetch(`http://localhost:5000/api/get/team/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
        });

        if (!teamResponse.ok) {
          const teamData = await teamResponse.json();
          throw new Error(teamData.message || "Failed to fetch team details");
        }

        const teamData = await teamResponse.json();
        setTeam(teamData.attr);
        
        // Set form default values from team data
        form.reset({
          teamName: teamData.attr.teamName || "",
          playerID: teamData.attr.playerID || [],
        });

        setSelectedPlayers(teamData.attr.playerID || []);

        // Fetch all available players
        const playersResponse = await fetch("http://localhost:5000/api/getall/players", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
        });

        if (!playersResponse.ok) {
          const playerData = await playersResponse.json();
          throw new Error(playerData.message || "Failed to fetch players");
        }

        const playerData = await playersResponse.json();
        setAvailablePlayers(playerData.attr || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load team data. Please try again.");
        toast.error("Failed to load team data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchTeamAndPlayers();
  }, [id, isLoggedIn, router, token, form]);

  // Handle player selection toggle
  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  // Filter players based on search
  const filteredPlayers = availablePlayers.filter(player => 
    player.playerName?.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update values with selected players
      values.playerID = selectedPlayers;

      const response = await fetch(`http://localhost:5000/api/update/team/${id}`, {
        method: "PUT", // Assuming your backend has a PUT endpoint for updates
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 300));
        throw new Error("Server returned an invalid response format");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to update team");
      }

      toast.success("Team updated successfully!");
      router.push(`/teams/${id}`);
    } catch (error) {
      console.error("Error updating team:", error);
      setError(error.message || "Failed to update team. Please try again.");
      toast.error("Failed to update team");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading team data...</span>
      </div>
    );
  }

  const selectedPlayerObjects = availablePlayers.filter(player => 
    selectedPlayers.includes(player.id)
  );

  const getSpecializationColor = (specialization) => {
    switch (specialization?.toLowerCase()) {
      case 'batsman':
        return 'bg-blue-100 text-blue-800';
      case 'bowler':
        return 'bg-green-100 text-green-800';
      case 'all-rounder':
        return 'bg-purple-100 text-purple-800';
      case 'wicket-keeper':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild className="mb-2">
          <Link href={`/teams/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Team
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Trophy className="h-6 w-6 text-primary mr-2" />
          Edit Team
        </h1>
        <p className="text-muted-foreground">
          Update team details and manage players
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Team Information */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
            <CardDescription>
              Update the details for your cricket team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter team name"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        The official name for your cricket team
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Selected Players ({selectedPlayers.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlayerObjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No players selected</p>
                      ) : (
                        selectedPlayerObjects.map(player => (
                          <Badge 
                            key={player.id} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1"
                          >
                            {player.playerName}
                            <XCircle 
                              className="h-4 w-4 ml-1 cursor-pointer hover:text-destructive" 
                              onClick={() => togglePlayerSelection(player.id)}
                            />
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Player Selection */}
        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Select Players</CardTitle>
            <CardDescription>
              Add players to your cricket team
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search players by name..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-1">
                {filteredPlayers.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No players match your search criteria
                  </p>
                ) : (
                  filteredPlayers.map(player => (
                    <div key={player.id}>
                      <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md cursor-pointer" onClick={() => togglePlayerSelection(player.id)}>
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={selectedPlayers.includes(player.id)} 
                            onCheckedChange={() => togglePlayerSelection(player.id)}
                          />
                          <div>
                            <p className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              {player.playerName}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSpecializationColor(player.specialization)}`}>
                                {player.specialization}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {player.nationality}
                              </span>
                            </div>
                          </div>
                        </div>
                        {player.specialization?.toLowerCase() === 'bowler' ? (
                          <p className="text-sm">{player.wickets || 0} wickets</p>
                        ) : (
                          <p className="text-sm">{player.totalRuns || 0} runs</p>
                        )}
                      </div>
                      {/* <Separator className="my-1" /> */}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}