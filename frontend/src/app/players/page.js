"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Search,
  User,
  Users,
  Loader2,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const router = useRouter();

  const isLoggedIn = typeof window !== "undefined"
    ? localStorage.getItem("isLoggedIn") === "true"
    : false;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to view players");
      router.push("/login");
      return;
    }

    fetchPlayers();
  }, [isLoggedIn, router]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/getall/players", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });

      // Check response format
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 300));
        throw new Error("Server returned an invalid response format");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch players");
      }

      const fetchedPlayers = data.attr || [];
      setPlayers(fetchedPlayers);

      // Extract unique specializations
      const uniqueSpecializations = [...new Set(fetchedPlayers.map(player => 
        player.specialization
      ))].filter(Boolean);
      
      setSpecializations(uniqueSpecializations);

    } catch (error) {
      console.error("Error fetching players:", error);
      setError(error.message || "Failed to load players. Please try again.");
      toast.error("Failed to load players");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpecialization = (specialization) => {
    setSelectedSpecializations(prev => 
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    );
  };

  // Filter players based on search query and selected specializations
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.playerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecializations.length === 0 || 
      selectedSpecializations.includes(player.specialization);
    
    return matchesSearch && matchesSpecialization;
  });

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cricket Players</h1>
          <p className="text-muted-foreground">View and manage cricket players</p>
        </div>

        {isLoggedIn && (
          <Button asChild>
            <Link href="/players/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Player
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {specializations.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {selectedSpecializations.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedSpecializations.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Specialization</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {specializations.map((specialization) => (
                <DropdownMenuCheckboxItem
                  key={specialization}
                  checked={selectedSpecializations.includes(specialization)}
                  onCheckedChange={() => toggleSpecialization(specialization)}
                >
                  {specialization}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading players...</span>
        </div>
      ) : players.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Players Found</CardTitle>
            <CardDescription>
              There are no cricket players available yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-6">
              <Button asChild>
                <Link href="/players/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Player
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead className="text-right">Matches</TableHead>
                  <TableHead className="text-right">Runs/Wickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">
                      <Link href={`/players/${player.id}`} className="flex items-center hover:text-primary">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {player.playerName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecializationColor(player.specialization)}`}>
                        {player.specialization}
                      </span>
                    </TableCell>
                    <TableCell>{player.nationality}</TableCell>
                    <TableCell className="text-right">{player.numberOfMatches || 0}</TableCell>
                    <TableCell className="text-right">
                      {player.specialization?.toLowerCase() === 'bowler' 
                        ? `${player.wickets || 0} wickets` 
                        : `${player.totalRuns || 0} runs`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No players match your search criteria
            </div>
          )}
        </>
      )}
    </div>
  );
}