"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Trophy,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
  Clock,
  Award,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id;

  const [match, setMatch] = useState(null);
  const [team1Details, setTeam1Details] = useState(null);
  const [team2Details, setTeam2Details] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [matchStats, setMatchStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = typeof window !== "undefined"
    ? localStorage.getItem("isLoggedIn") === "true"
    : false;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to view match details");
      router.push("/login");
      return;
    }
    
    fetchMatchDetails();
  }, [isLoggedIn, matchId, router]);

  const fetchMatchDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch match details
      const response = await fetch("http://localhost:5000/api/get/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: matchId }),
        credentials: "include",
      });

      const matchData = await response.json();

      if (!response.ok) {
        throw new Error(matchData.message || "Failed to fetch match details");
      }

      setMatch(matchData);
      
      // Fetch details for both teams
      if (matchData.team1) {
        await fetchTeamDetails(matchData.team1, true);
      }
      
      if (matchData.team2) {
        await fetchTeamDetails(matchData.team2, false);
      }
      
      // Fetch match statistics if available
      await fetchMatchStats(matchId);
      
    } catch (error) {
      console.error("Error fetching match details:", error);
      setError(error.message || "Failed to load match details. Please try again.");
      toast.error("Failed to load match details");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTeamDetails = async (teamId, isTeam1) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get/team/${teamId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the appropriate team's data
      if (isTeam1) {
        setTeam1Details(data.attr);
      } else {
        setTeam2Details(data.attr);
      }
      
      // Fetch player details for this team if players exist
      if (data.attr.playerID && data.attr.playerID.length > 0) {
        const players = await fetchPlayerDetails(data.attr.playerID);
        
        // Set player data for the appropriate team
        if (isTeam1) {
          setTeam1Players(players);
        } else {
          setTeam2Players(players);
        }
      }
    } catch (error) {
      console.error(`Error fetching team details for team ${teamId}:`, error);
      setError(prev => prev || `Failed to fetch details for ${isTeam1 ? 'Team 1' : 'Team 2'}`);
    }
  };
  
  const fetchPlayerDetails = async (playerIds) => {
    try {
      const playerPromises = playerIds.map(playerId => 
        fetch(`http://localhost:5000/api/get/player/${playerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
        })
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch player ${playerId}`);
          return res.json();
        })
        .then(data => data.attr)
      );
      
      const playerResults = await Promise.all(playerPromises);
      return playerResults;
    } catch (error) {
      console.error("Error fetching player details:", error);
      setError(prev => prev || "Failed to fetch player details");
      return [];
    }
  };
  
  const fetchMatchStats = async (matchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get/match/stats/${matchId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setMatchStats(statsData.attr || []);
      }
    } catch (error) {
      console.error("Error fetching match statistics:", error);
      // Don't set an error state here as this is optional data
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "Time not specified";
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to determine the status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>
      <Button variant="default" className="mb-6" onClick={() => router.push(`/balls/${matchId}`)}>
        Add Balls
      </Button>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading match details...</span>
        </div>
        
      ) : match ? (
        <>
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-slate-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    {team1Details?.teamName || "Team 1"} vs {team2Details?.teamName || "Team 2"}
                  </CardTitle>
                  <CardDescription className="flex items-center text-base">
                    {/* <Badge className={getStatusBadgeColor(match.status)}>
                      {match.status || "Status not available"}
                    </Badge> */}
                    {/* <span className="mx-2">•</span> */}
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(match.matchDate)}
                    {/* <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(match.matchDate)} */}
                  </CardDescription>
                </div>
                
                {match.matchWinner && (
                  <div className="mt-4 md:mt-0">
                    <Badge variant="outline" className="flex items-center bg-yellow-50 text-yellow-800 border-yellow-300">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
                      Winner: {match.matchWinner === match.team1 
                        ? team1Details?.teamName || "Team 1" 
                        : team2Details?.teamName || "Team 2"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Venue</h3>
                      <p className="text-gray-600">{match.venue || "Venue not specified"}</p>
                    </div>
                  </div>
                  
                  {match.umpires && (
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Umpires</h3>
                        <p className="text-gray-600">{match.umpires}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {match.tossWinner && (
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Toss</h3>
                        <p className="text-gray-600">
                          {match.tossWinner === match.team1 
                            ? team1Details?.teamName || "Team 1" 
                            : team2Details?.teamName || "Team 2"} 
                          {match.tossDecision && ` elected to ${match.tossDecision} first`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {match.matchDescription && (
                    <div className="flex items-start space-x-3">
                      <div>
                        <h3 className="font-medium">Match Description</h3>
                        <p className="text-gray-600">{match.matchDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="scorecard" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scorecard">
  <Card>
    <CardHeader>
      <CardTitle>Match Scorecard</CardTitle>
      <CardDescription>
        Detailed batting and bowling statistics for this match
      </CardDescription>
    </CardHeader>
    <CardContent>
      {matchStats && matchStats.length > 0 ? (
        <div className="space-y-8">
          {/* Team 1 Innings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{team1Details?.teamName || "Team 1"} Innings</h3>
            <Table>
              <TableCaption>Batting</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Batter</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead className="text-right">Balls</TableHead>
                  <TableHead className="text-right">4s</TableHead>
                  <TableHead className="text-right">6s</TableHead>
                  <TableHead className="text-right">SR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchStats
                  .filter(stat => stat.teamId === match.team1)
                  .sort((a, b) => (a.inAt || 999) - (b.inAt || 999))
                  .map((playerStat, index) => {
                    console.log(team1Players)
                    const player = team1Players.find(p => p.id === playerStat.playerId) || {};
                    return (
                      <TableRow key={playerStat.playerId || index}>
                        <TableCell>
                          {player.playerName || "Unknown Player"}
                          {playerStat.notOut && <span className="ml-1">*</span>}
                          {playerStat.outType && <span className="text-xs text-gray-500 block">{playerStat.outType}</span>}
                        </TableCell>
                        <TableCell className="text-right">{playerStat.runs}</TableCell>
                        <TableCell className="text-right">{playerStat.ballsFaced}</TableCell>
                        <TableCell className="text-right">{playerStat.fours}</TableCell>
                        <TableCell className="text-right">{playerStat.sixes}</TableCell>
                        <TableCell className="text-right">
                          {playerStat.ballsFaced > 0
                            ? ((playerStat.runs / playerStat.ballsFaced) * 100).toFixed(2)
                            : "0.00"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {matchStats.filter(stat => stat.teamId === match.team1).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No batting data available for this team
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Extra row for team totals */}
                {matchStats.filter(stat => stat.teamId === match.team1).length > 0 && (
                  <TableRow className="font-medium bg-slate-50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team1)
                        .reduce((sum, stat) => sum + (stat.runs || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team1)
                        .reduce((sum, stat) => sum + (stat.ballsFaced || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team1)
                        .reduce((sum, stat) => sum + (stat.fours || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team1)
                        .reduce((sum, stat) => sum + (stat.sixes || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="mt-6">
              <Table>
                <TableCaption>Bowling</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bowler</TableHead>
                    <TableHead className="text-right">Overs</TableHead>
                    <TableHead className="text-right">Maidens</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Wickets</TableHead>
                    <TableHead className="text-right">Economy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchStats
                    .filter(stat => stat.teamId === match.team2 && stat.ballsBowled > 0)
                    .map((playerStat, index) => {
                      const player = team2Players.find(p => p.id === playerStat.playerId) || {};
                      const overs = Math.floor(playerStat.ballsBowled / 6);
                      const balls = playerStat.ballsBowled % 6;
                      const economy = playerStat.ballsBowled > 0
                        ? ((playerStat.runsGiven / playerStat.ballsBowled) * 6).toFixed(2)
                        : "0.00";
                      
                      return (
                        <TableRow key={playerStat.playerId || index}>
                          <TableCell>{player.playerName || "Unknown Player"}</TableCell>
                          <TableCell className="text-right">{`${overs}.${balls}`}</TableCell>
                          <TableCell className="text-right">{playerStat.maidenOvers || 0}</TableCell>
                          <TableCell className="text-right">{playerStat.runsGiven || 0}</TableCell>
                          <TableCell className="text-right">{playerStat.wicketsTaken || 0}</TableCell>
                          <TableCell className="text-right">{economy}</TableCell>
                        </TableRow>
                      );
                    })}
                  {matchStats.filter(stat => stat.teamId === match.team2 && stat.ballsBowled > 0).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No bowling data available for this team
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <Separator />
          
          {/* Team 2 Innings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{team2Details?.teamName || "Team 2"} Innings</h3>
            <Table>
              <TableCaption>Batting</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Batter</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead className="text-right">Balls</TableHead>
                  <TableHead className="text-right">4s</TableHead>
                  <TableHead className="text-right">6s</TableHead>
                  <TableHead className="text-right">SR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchStats
                  .filter(stat => stat.teamId === match.team2)
                  .sort((a, b) => (a.inAt || 999) - (b.inAt || 999))
                  .map((playerStat, index) => {
                    const player = team2Players.find(p => p.id === playerStat.playerId) || {};
                    return (
                      <TableRow key={playerStat.playerId || index}>
                        <TableCell>
                          {player.playerName || "Unknown Player"}
                          {playerStat.notOut && <span className="ml-1">*</span>}
                          {playerStat.outType && <span className="text-xs text-gray-500 block">{playerStat.outType}</span>}
                        </TableCell>
                        <TableCell className="text-right">{playerStat.runs}</TableCell>
                        <TableCell className="text-right">{playerStat.ballsFaced}</TableCell>
                        <TableCell className="text-right">{playerStat.fours}</TableCell>
                        <TableCell className="text-right">{playerStat.sixes}</TableCell>
                        <TableCell className="text-right">
                          {playerStat.ballsFaced > 0
                            ? ((playerStat.runs / playerStat.ballsFaced) * 100).toFixed(2)
                            : "0.00"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {matchStats.filter(stat => stat.teamId === match.team2).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No batting data available for this team
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Extra row for team totals */}
                {matchStats.filter(stat => stat.teamId === match.team2).length > 0 && (
                  <TableRow className="font-medium bg-slate-50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team2)
                        .reduce((sum, stat) => sum + (stat.runs || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team2)
                        .reduce((sum, stat) => sum + (stat.ballsFaced || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team2)
                        .reduce((sum, stat) => sum + (stat.fours || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {matchStats
                        .filter(stat => stat.teamId === match.team2)
                        .reduce((sum, stat) => sum + (stat.sixes || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="mt-6">
              <Table>
                <TableCaption>Bowling</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bowler</TableHead>
                    <TableHead className="text-right">Overs</TableHead>
                    <TableHead className="text-right">Maidens</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Wickets</TableHead>
                    <TableHead className="text-right">Economy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchStats
                    .filter(stat => stat.teamId === match.team1 && stat.ballsBowled > 0)
                    .map((playerStat, index) => {
                      const player = team1Players.find(p => p._id === playerStat.playerId) || {};
                      const overs = Math.floor(playerStat.ballsBowled / 6);
                      const balls = playerStat.ballsBowled % 6;
                      const economy = playerStat.ballsBowled > 0
                        ? ((playerStat.runsGiven / playerStat.ballsBowled) * 6).toFixed(2)
                        : "0.00";
                      
                      return (
                        <TableRow key={playerStat.playerId || index}>
                          <TableCell>{player.playerName || "Unknown Player"}</TableCell>
                          <TableCell className="text-right">{`${overs}.${balls}`}</TableCell>
                          <TableCell className="text-right">{playerStat.maidenOvers || 0}</TableCell>
                          <TableCell className="text-right">{playerStat.runsGiven || 0}</TableCell>
                          <TableCell className="text-right">{playerStat.wicketsTaken || 0}</TableCell>
                          <TableCell className="text-right">{economy}</TableCell>
                        </TableRow>
                      );
                    })}
                  {matchStats.filter(stat => stat.teamId === match.team1 && stat.ballsBowled > 0).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No bowling data available for this team
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Scorecard is not available for this match yet.
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
            
            <TabsContent value="teams">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team 1 */}
                <Card>
                  <CardHeader>
                    <CardTitle>{team1Details?.teamName || "Team 1"}</CardTitle>
                    <CardDescription>
                      Players and roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team1Players.length > 0 ? (
                          team1Players.map((player, index) => (
                            <TableRow key={player._id || index}>
                              <TableCell>{player.playerName || "Unknown"}</TableCell>
                              <TableCell>{player.specialization || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                              No player information available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Team 2 */}
                <Card>
                  <CardHeader>
                    <CardTitle>{team2Details?.teamName || "Team 2"}</CardTitle>
                    <CardDescription>
                      Players and roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team2Players.length > 0 ? (
                          team2Players.map((player, index) => (
                            <TableRow key={player.id || index}>
                              <TableCell>{player.playerName || "Unknown"}</TableCell>
                              <TableCell>{player.specialization || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                              No player information available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="statistics">
  <Card>
    <CardHeader>
      <CardTitle>Match Statistics</CardTitle>
      <CardDescription>
        Key statistics and performance metrics for this match
      </CardDescription>
    </CardHeader>
    <CardContent>
      {matchStats && matchStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Scorer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Scorer</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // Find player with highest runs
                const topScorer = [...matchStats].sort((a, b) => (b.runs || 0) - (a.runs || 0))[0];
                
                if (!topScorer || topScorer.runs === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      No batting data available
                    </div>
                  );
                }
                
                const player = 
                  topScorer.teamId === match.team1
                    ? team1Players.find(p => p.id === topScorer.playerId)
                    : team2Players.find(p => p.id === topScorer.playerId);
                
                const team = topScorer.teamId === match.team1
                  ? team1Details?.teamName || "Team 1"
                  : team2Details?.teamName || "Team 2";
                  
                return (
                  <div className="space-y-2 pt-2">
                    <div className="font-semibold text-xl">{player?.playerName || "Unknown Player"}</div>
                    <div className="text-gray-600 text-sm">{team}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-3xl font-bold">{topScorer.runs}</div>
                      <div className="text-sm text-gray-500">
                        {topScorer.ballsFaced} balls
                        <span className="block">
                          SR: {topScorer.ballsFaced > 0
                            ? ((topScorer.runs / topScorer.ballsFaced) * 100).toFixed(2)
                            : "0.00"}
                        </span>
                        <span className="block">
                          {topScorer.fours || 0} fours, {topScorer.sixes || 0} sixes
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          
          {/* Best Bowler */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Best Bowler</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // Find bowler with most wickets
                const bowlers = matchStats.filter(stat => (stat.wicketsTaken || 0) >= 0);
                
                // Sort first by wickets (descending), then by runs given (ascending)
                const bestBowler = [...bowlers].sort((a, b) => {
                  if (b.wicketsTaken !== a.wicketsTaken) {
                    return (b.wicketsTaken || 0) - (a.wicketsTaken || 0);
                  }
                  if(b.runsGiven !== a.runsGiven){
                  return (a.runsGiven || 0) - (b.runsGiven || 0);
                  }
                  return (b.ballsBowled || 0) - (a.ballsBowled || 0);
                })[0];
                
                if (!bestBowler || !bestBowler.ballsBowled) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      No bowling data available
                    </div>
                  );
                }
                
                const player = 
                  bestBowler.teamId === match.team1
                    ? team1Players.find(p => p.id === bestBowler.playerId)
                    : team2Players.find(p => p.id === bestBowler.playerId);
                
                const team = bestBowler.teamId === match.team1
                  ? team1Details?.teamName || "Team 1"
                  : team2Details?.teamName || "Team 2";
                  
                const overs = Math.floor(bestBowler.ballsBowled / 6);
                const balls = bestBowler.ballsBowled % 6;
                const economy = bestBowler.ballsBowled > 0
                  ? ((bestBowler.runsGiven / bestBowler.ballsBowled) * 6).toFixed(2)
                  : "0.00";
                
                return (
                  <div className="space-y-2 pt-2">
                    <div className="font-semibold text-xl">{player?.playerName || "Unknown Player"}</div>
                    <div className="text-gray-600 text-sm">{team}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-3xl font-bold">{bestBowler.wicketsTaken}-{bestBowler.runsGiven}</div>
                      <div className="text-sm text-gray-500">
                        {overs}.{balls} overs
                        <span className="block">
                          Economy: {economy}
                        </span>
                        <span className="block">
                          Maidens: {bestBowler.maidenOvers || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          
          {/* Player of the Match - Based on combined performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Player of the Match</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                if (matchStats.length === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      No data available
                    </div>
                  );
                }
                
                // Calculate player scores based on performance
                const playerScores = matchStats.map(stat => {
                  // Algorithm to calculate overall impact
                  const battingScore = (stat.runs || 0) + 
                                      ((stat.fours || 0) * 1) + 
                                      ((stat.sixes || 0) * 2);
                  
                  const bowlingScore = ((stat.wicketsTaken || 0) * 20) - 
                                      ((stat.runsGiven || 0) / 2) +
                                      ((stat.maidenOvers || 0) * 8);
                  
                  const fieldingScore = ((stat.cathcesCaught || 0) * 8) + 
                                       ((stat.stumpingCount || 0) * 12) +
                                       ((stat.runOutBy ? 10 : 0));
                  
                  const totalScore = battingScore + bowlingScore + fieldingScore;
                  
                  return {
                    playerId: stat.playerId,
                    teamId: stat.teamId,
                    score: totalScore,
                    stat: stat
                  };
                });
                
                // Sort by score and get the best player
                const bestPlayer = [...playerScores].sort((a, b) => b.score - a.score)[0];
                
                if (!bestPlayer || bestPlayer.score === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      Insufficient data to determine
                    </div>
                  );
                }
                
                const player = 
                  bestPlayer.teamId === match.team1
                    ? team1Players.find(p => p.id === bestPlayer.playerId)
                    : team2Players.find(p => p.id === bestPlayer.playerId);
                
                const team = bestPlayer.teamId === match.team1
                  ? team1Details?.teamName || "Team 1"
                  : team2Details?.teamName || "Team 2";
                
                const playerStat = bestPlayer.stat;
                
                return (
                  <div className="space-y-2 pt-2">
                    <div className="font-semibold text-xl">{player?.playerName || "Unknown Player"}</div>
                    <div className="text-gray-600 text-sm">{team}</div>
                    <div className="mt-2 text-sm space-y-1">
                      {playerStat.runs > 0 && (
                        <div className="flex justify-between">
                          <span>Batting:</span>
                          <span>{playerStat.runs} runs ({playerStat.ballsFaced} balls)</span>
                        </div>
                      )}
                      {playerStat.wicketsTaken > 0 && (
                        <div className="flex justify-between">
                          <span>Bowling:</span>
                          <span>{playerStat.wicketsTaken}/{playerStat.runsGiven} ({Math.floor(playerStat.ballsBowled / 6)}.{playerStat.ballsBowled % 6} ov)</span>
                        </div>
                      )}
                      {(playerStat.cathcesCaught > 0 || playerStat.stumpingCount > 0) && (
                        <div className="flex justify-between">
                          <span>Fielding:</span>
                          <span>
                            {playerStat.cathcesCaught > 0 ? `${playerStat.cathcesCaught} catch(es)` : ''}
                            {playerStat.cathcesCaught > 0 && playerStat.stumpingCount > 0 ? ', ' : ''}
                            {playerStat.stumpingCount > 0 ? `${playerStat.stumpingCount} stumping(s)` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          
          {/* Additional statistics cards */}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Match Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                if (matchStats.length === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      No data available
                    </div>
                  );
                }
                
                // Calculate team totals
                const team1Total = matchStats
                  .filter(stat => stat.teamId === match.team1)
                  .reduce((sum, stat) => sum + (stat.runs || 0), 0);
                
                const team2Total = matchStats
                  .filter(stat => stat.teamId === match.team2)
                  .reduce((sum, stat) => sum + (stat.runs || 0), 0);
                
                const team1Wickets = matchStats
                  .filter(stat => stat.teamId === match.team1 && stat.outType)
                  .length;
                
                const team2Wickets = matchStats
                  .filter(stat => stat.teamId === match.team2 && stat.outType)
                  .length;
                
                // Calculate team balls faced
                const team1BallsFaced = matchStats
                  .filter(stat => stat.teamId === match.team1)
                  .reduce((sum, stat) => sum + (stat.ballsFaced || 0), 0);
                
                const team2BallsFaced = matchStats
                  .filter(stat => stat.teamId === match.team2)
                  .reduce((sum, stat) => sum + (stat.ballsFaced || 0), 0);
                
                const team1Overs = Math.floor(team1BallsFaced / 6) + (team1BallsFaced % 6) / 10;
                const team2Overs = Math.floor(team2BallsFaced / 6) + (team2BallsFaced % 6) / 10;
                
                const winningMargin = Math.abs(team1Total - team2Total);
                const winningTeam = team1Total > team2Total ? team1Details?.teamName : team2Details?.teamName;
                const losingTeam = team1Total > team2Total ? team2Details?.teamName : team1Details?.teamName;
                
                return (
                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{team1Details?.teamName || "Team 1"}:</span>
                      <span>{team1Total}/{team1Wickets} ({team1Overs.toFixed(1)} ov)</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>{team2Details?.teamName || "Team 2"}:</span>
                      <span>{team2Total}/{team2Wickets} ({team2Overs.toFixed(1)} ov)</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="text-center font-medium">
                      {match.matchWinner ? (
                        <span>
                          {winningTeam} won by {winningMargin} runs
                        </span>
                      ) : (
                        <span>Match result not available</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Boundary Count</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                if (matchStats.length === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      No data available
                    </div>
                  );
                }
                
                // Calculate boundary totals
                const team1Fours = matchStats
                  .filter(stat => stat.teamId === match.team1)
                  .reduce((sum, stat) => sum + (stat.fours || 0), 0);
                
                const team1Sixes = matchStats
                  .filter(stat => stat.teamId === match.team1)
                  .reduce((sum, stat) => sum + (stat.sixes || 0), 0);
                
                const team2Fours = matchStats
                  .filter(stat => stat.teamId === match.team2)
                  .reduce((sum, stat) => sum + (stat.fours || 0), 0);
                
                const team2Sixes = matchStats
                  .filter(stat => stat.teamId === match.team2)
                  .reduce((sum, stat) => sum + (stat.sixes || 0), 0);
                
                return (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">{team1Details?.teamName || "Team 1"}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{team1Fours}</div>
                          <div className="text-xs text-gray-500">Fours</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{team1Sixes}</div>
                          <div className="text-xs text-gray-500">Sixes</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">{team2Details?.teamName || "Team 2"}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{team2Fours}</div>
                          <div className="text-xs text-gray-500">Fours</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{team2Sixes}</div>
                          <div className="text-xs text-gray-500">Sixes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Match statistics are not available for this match yet.
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
          </Tabs>
        </>
      ) : (
        <Alert className="mt-8">
          <AlertDescription>No match data found for this ID.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}