"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  RefreshCcw,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function AddBallPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [players, setPlayers] = useState([]);
  const [selectedBatsman, setSelectedBatsman] = useState("");
  const [selectedBowler, setSelectedBowler] = useState("");
  const [selectedBatsmanOut, setSelectedBatsmanOut] = useState("");
  const params = useParams();
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [matchDetails, setMatchDetails] = useState(null);
  const [battingTeamPlayers, setBattingTeamPlayers] = useState([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([]);
  const [lastBallData, setLastBallData] = useState(null);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(1);
  const [maxOvers, setMaxOvers] = useState(20); // Default, will be updated from match format

  const [ballData, setBallData] = useState({
    ballNo: 0.1,
    batsman: "",
    match: params.id,
    bowler: "",
    runs: 0,
    wicket: false,
    batsmanOut: "",
    byes: 0,
    lb: 0,
    wide: false,
    noBall: false,
    is_four: false,
    is_six: false,
    innings: 1,
  });
  
  const router = useRouter();
  
  const isLoggedIn =
    typeof window !== "undefined"
      ? localStorage.getItem("isLoggedIn") === "true"
      : false;
      
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to record ball data");
      router.push("/login");
      return;
    }

    fetchMatchDetails();
    fetchPlayers();
    fetchLastBallData();
  }, [isLoggedIn, router, params.id]);

  // Update batting and bowling teams whenever innings changes
  useEffect(() => {
    updateTeamsBasedOnInnings(ballData.innings);
  }, [ballData.innings, team1Players, team2Players, matchDetails]);

  // Update ball number display
  useEffect(() => {
    const formattedBallNo = currentOver + (currentBall / 10);
    setBallData(prev => ({
      ...prev,
      ballNo: formattedBallNo
    }));
  }, [currentOver, currentBall]);

  const updateTeamsBasedOnInnings = (innings) => {
    // First innings: team1 bats, team2 bowls
    // Second innings: team2 bats, team1 bowls
    if (innings === 1) {
      setBattingTeamPlayers(team1Players);
      setBowlingTeamPlayers(team2Players);
    } else {
      setBattingTeamPlayers(team2Players);
      setBowlingTeamPlayers(team1Players);
    }
    
    // Reset selected players when innings changes
    setSelectedBatsman("");
    setSelectedBowler("");
  };

  const fetchLastBallData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/get/last-ball/${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch last ball data");
      }

      const data = await response.json();
      
      if (data && data.ballNo) {
        setLastBallData(data);
        
        // Parse the ball number to set current over and ball
        const ballNum = parseFloat(data.ballNo);
        const over = Math.floor(ballNum);
        const ball = Math.round((ballNum - over) * 10);
        
        // Determine next ball number based on whether last ball was a wide/no-ball
        if (data.wide || data.noBall) {
          // If last ball was wide or no-ball, use the same ball number
          setCurrentOver(over);
          setCurrentBall(ball);
        } else {
          // Normal progression
          if (ball === 6) {
            // Move to next over
            setCurrentOver(over + 1);
            setCurrentBall(1);
          } else {
            // Increment ball within same over
            setCurrentOver(over);
            setCurrentBall(ball + 1);
          }
        }
        
        // Set innings based on last ball
        setBallData(prev => ({
          ...prev,
          innings: data.innings || 1
        }));
        
        // Check if we need to move to next innings
        if (data.innings === 1 && over >= (maxOvers - 1) && ball === 6 && !data.wide && !data.noBall) {
          // First innings complete, move to second innings
          setBallData(prev => ({
            ...prev,
            innings: 2
          }));
          setCurrentOver(0);
          setCurrentBall(1);
        }
      } else {
        // No last ball data, start from the beginning
        setCurrentOver(0);
        setCurrentBall(1);
        setBallData(prev => ({
          ...prev,
          ballNo: 0.1,
          innings: 1
        }));
      }
    } catch (error) {
      console.error("Error fetching last ball data:", error);
      // If we can't get last ball, default to start of the match
      setCurrentOver(0);
      setCurrentBall(1);
    }
  };

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
        body: JSON.stringify({ id: params.id }),
        credentials: "include",
      });

      const matchData = await response.json();

      if (!response.ok) {
        throw new Error(matchData.message || "Failed to fetch match details");
      }

      setMatchDetails(matchData);
      
      // Set max overs from match format
      if (matchData.format) {
        setMaxOvers(parseInt(matchData.format, 10));
      }
      
      // Fetch details for both teams
      if (matchData.team1) {
        await fetchTeamDetails(matchData.team1, true);
      }
      
      if (matchData.team2) {
        await fetchTeamDetails(matchData.team2, false);
      }
      
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

  const fetchPlayers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/getall/players", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch players");
      }

      setPlayers(data.attr || []);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBallData({
      ...ballData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? "" : parseInt(value, 10);
    setBallData({
      ...ballData,
      [name]: numValue,
    });
  };

  const updateBallNumber = (isExtras) => {
    // Only increment ball number for legal deliveries
    if (!isExtras) {
      if (currentBall === 6) {
        // End of over, move to next over
        setCurrentOver(currentOver + 1);
        setCurrentBall(1);
      } else {
        // Increment ball within current over
        setCurrentBall(currentBall + 1);
      }
    }
    
    // Check if innings should change (end of allotted overs)
    if (currentOver >= maxOvers - 1 && currentBall === 6 && !isExtras && ballData.innings === 1) {
      // First innings complete, reset for second innings
      setBallData(prev => ({
        ...prev,
        innings: 2
      }));
      setCurrentOver(0);
      setCurrentBall(1);
      toast.info("First innings complete! Starting second innings.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if current innings is over
      if (ballData.innings === 1 && currentOver >= maxOvers && !ballData.wide && !ballData.noBall) {
        toast.error(`First innings is limited to ${maxOvers} overs. Please start second innings.`);
        setIsLoading(false);
        return;
      }
      
      if (ballData.innings === 2 && currentOver >= maxOvers && !ballData.wide && !ballData.noBall) {
        toast.error(`Match is limited to ${maxOvers} overs per innings. The match is complete.`);
        setIsLoading(false);
        return;
      }

      // Prepare the payload according to the controller's structure
      const payload = {
        ...ballData,
        match: params.id,
        batsman: selectedBatsman,
        bowler: selectedBowler,
        batsmanOut: ballData.wicket ? selectedBatsmanOut : null,
      };

      const response = await fetch(`http://localhost:5000/api/add-ball/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to record ball");
      }

      setSuccess(true);
      toast.success("Ball recorded successfully");

      // Determine if this was an extra (wide or no-ball)
      const isExtras = ballData.wide || ballData.noBall;
      
      // Update ball number for next delivery
      updateBallNumber(isExtras);

      // Reset form for next entry (except match and innings)
      setBallData(prev => ({
        ...prev,
        runs: 0,
        wicket: false,
        byes: 0,
        lb: 0,
        wide: false,
        noBall: false,
        is_four: false,
        is_six: false,
      }));
      setSelectedBatsmanOut("");
    } catch (error) {
      console.error("Error recording ball:", error);
      setError(error.message || "Failed to record ball. Please try again.");
      toast.error("Failed to record ball");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerSpecializationColor = (specialization) => {
    switch (specialization?.toLowerCase()) {
      case "batsman":
        return "bg-blue-100 text-blue-800";
      case "bowler":
        return "bg-green-100 text-green-800";
      case "all-rounder":
        return "bg-purple-100 text-purple-800";
      case "wicket-keeper":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to refresh and get the latest ball data
  const refreshLastBall = () => {
    fetchLastBallData();
    toast.info("Ball data refreshed");
  };

  // Calculate current match status
  const getCurrentMatchStatus = () => {
    if (!matchDetails) return "";
    
    let status = "";
    if (ballData.innings === 1) {
      status = `1st Innings: ${currentOver}.${currentBall} overs`;
    } else {
      status = `2nd Innings: ${currentOver}.${currentBall} overs`;
    }
    
    return status;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Ball</h1>
          <p className="text-muted-foreground">
            Enter ball-by-ball data to update match statistics
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshLastBall}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Ball Data
          </Button>
          <Button asChild variant="outline">
            <Link href="/matches">
              <Users className="mr-2 h-4 w-4" />
              View Matches
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Ball recorded successfully! Match statistics have been updated.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle>Current Match Status</CardTitle>
            <Badge variant="outline" className="text-sm">
              {matchDetails?.format || "0"} Overs Match
            </Badge>
          </div>
          <CardDescription>
            {matchDetails ? (
              <>
                <div className="font-medium">{matchDetails.title || "Match #" + params.id}</div>
                <div className="mt-1 text-sm">
                  {getCurrentMatchStatus()}
                </div>
              </>
            ) : (
              "Loading match details..."
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ball Information</CardTitle>
          <CardDescription>
            Enter details for the current delivery
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="text-lg py-1 px-3">
              Ball {currentOver}.{currentBall}
            </Badge>
            <Badge variant="outline" className="text-lg py-1 px-3">
              Innings {ballData.innings}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Automatic Ball Numbering</AlertTitle>
              <AlertDescription>
                Ball numbers are automatically tracked. Wide balls and no balls don't increment the ball count.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hidden read-only ball number field */}
              <input 
                type="hidden" 
                name="ballNo" 
                value={ballData.ballNo}
                readOnly
              />

              {/* Batsman */}
              <div className="space-y-2">
                <Label>Batsman</Label>
                <Select
                  value={selectedBatsman}
                  onValueChange={setSelectedBatsman}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batsman" />
                  </SelectTrigger>
                  <SelectContent>
                    {battingTeamPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        <div className="flex items-center">
                          {player.playerName}
                          {player.specialization && (
                            <span
                              className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlayerSpecializationColor(
                                player.specialization
                              )}`}
                            >
                              {player.specialization}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bowler */}
              <div className="space-y-2">
                <Label>Bowler</Label>
                <Select
                  value={selectedBowler}
                  onValueChange={setSelectedBowler}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bowler" />
                  </SelectTrigger>
                  <SelectContent>
                    {bowlingTeamPlayers
                      .map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          <div className="flex items-center">
                            {player.playerName}
                            {player.specialization && (
                              <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlayerSpecializationColor(
                                  player.specialization
                                )}`}
                              >
                                {player.specialization}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Runs */}
              <div className="space-y-2">
                <Label>Runs Scored</Label>
                <Input
                  type="number"
                  name="runs"
                  value={ballData.runs}
                  onChange={handleNumberInput}
                  min="0"
                  max="6"
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Extras and Boundaries */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wide"
                  name="wide"
                  checked={ballData.wide}
                  onCheckedChange={(checked) =>
                    setBallData({ ...ballData, wide: checked })
                  }
                />
                <label
                  htmlFor="wide"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Wide
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noBall"
                  name="noBall"
                  checked={ballData.noBall}
                  onCheckedChange={(checked) =>
                    setBallData({ ...ballData, noBall: checked })
                  }
                />
                <label
                  htmlFor="noBall"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  No Ball
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_four"
                  name="is_four"
                  checked={ballData.is_four}
                  onCheckedChange={(checked) =>
                    setBallData({
                      ...ballData,
                      is_four: checked,
                      is_six: checked ? false : ballData.is_six,
                    })
                  }
                />
                <label
                  htmlFor="is_four"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Four
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_six"
                  name="is_six"
                  checked={ballData.is_six}
                  onCheckedChange={(checked) =>
                    setBallData({
                      ...ballData,
                      is_six: checked,
                      is_four: checked ? false : ballData.is_four,
                    })
                  }
                />
                <label
                  htmlFor="is_six"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Six
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Byes</Label>
                <Input
                  type="number"
                  name="byes"
                  value={ballData.byes}
                  onChange={handleNumberInput}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Leg Byes</Label>
                <Input
                  type="number"
                  name="lb"
                  value={ballData.lb}
                  onChange={handleNumberInput}
                  min="0"
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Wicket Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wicket"
                  name="wicket"
                  checked={ballData.wicket}
                  onCheckedChange={(checked) =>
                    setBallData({ ...ballData, wicket: checked })
                  }
                />
                <label
                  htmlFor="wicket"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Wicket
                </label>
              </div>

              {ballData.wicket && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-md">
                  <Label>Batsman Out</Label>
                  <Select
                    value={selectedBatsmanOut}
                    onValueChange={setSelectedBatsmanOut}
                    required={ballData.wicket}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batsman out" />
                    </SelectTrigger>
                    <SelectContent>
                      {battingTeamPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          <div className="flex items-center">
                            {player.playerName}
                            {player.specialization && (
                              <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlayerSpecializationColor(
                                  player.specialization
                                )}`}
                              >
                                {player.specialization}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoading ? "Recording Ball..." : "Record Ball"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <div className="flex items-center text-sm text-muted-foreground">
            Ball data will automatically update batsman and bowler statistics
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}