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
  User,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function AddBallPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedBatsman, setSelectedBatsman] = useState("");
  const [selectedBowler, setSelectedBowler] = useState("");
  const [selectedBatsmanOut, setSelectedBatsmanOut] = useState("");
  const match = useParams();
  const [ballData, setBallData] = useState({
    ballNo: 0,
    batsman: "",
    match: match,
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

    fetchMatches();
    fetchPlayers();
  }, [isLoggedIn, router]);

  const fetchMatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/getall/matches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare the payload according to the controller's structure
      const payload = {
        ...ballData,
        match: selectedMatch,
        batsman: selectedBatsman,
        bowler: selectedBowler,
        batsmanOut: ballData.wicket ? selectedBatsmanOut : null,
      };

      const response = await fetch(`http://localhost:5000/api/add-ball/${match.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      console.log(match);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to record ball");
      }

      setSuccess(true);
      toast.success("Ball recorded successfully");

      // Reset form for next entry (except match and innings)
      setBallData({
        ...ballData,
        ballNo: parseInt(ballData.ballNo, 10) + 1,
        runs: 0,
        wicket: false,
        byes: 0,
        lb: 0,
        wide: false,
        noBall: false,
        is_four: false,
        is_six: false,
      });
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Ball</h1>
          <p className="text-muted-foreground">
            Enter ball-by-ball data to update match statistics
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/matches">
            <Users className="mr-2 h-4 w-4" />
            View Matches
          </Link>
        </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Ball Information</CardTitle>
          <CardDescription>
            Enter details for the current delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Match Selection */}
              

              {/* Innings */}
              <div className="space-y-2">
                <Label>Innings</Label>
                <Select
                  value={ballData.innings.toString()}
                  onValueChange={(value) =>
                    setBallData({ ...ballData, innings: parseInt(value, 10) })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select innings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Innings</SelectItem>
                    <SelectItem value="2">Second Innings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ball Number */}
              <div className="space-y-2">
                <Label>Ball Number</Label>
                <Input
                  type="number"
                  name="ballNo"
                  value={ballData.ballNo}
                  onChange={handleNumberInput}
                  placeholder="e.g., 1.2 (over.ball)"
                  required
                />
              </div>

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
                    {players.map((player) => (
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
                    {players
                      .filter(
                        (player) =>
                          player.specialization === "Bowler" ||
                          player.specialization === "All-rounder"
                      )
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
                      {players.map((player) => (
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
