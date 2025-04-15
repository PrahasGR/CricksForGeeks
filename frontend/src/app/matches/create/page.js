"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function CreateMatchPage() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    team1: "",
    team2: "",
    venue: "",
    matchDate: new Date(),
    status: "SCHEDULED",
    battingFirst: "",
    format: "", // Total overs input
  });

  const isLoggedIn = typeof window !== "undefined"
    ? localStorage.getItem("isLoggedIn") === "true"
    : false;

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to create a match");
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
          Authorization: `Bearer ${token}`,
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.team1 === formData.team2) {
      toast.error("A team cannot play against itself");
      return;
    }

    if (!formData.team1 || !formData.team2 || !formData.battingFirst || !formData.format) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const submissionData = { ...formData };
      if (submissionData.matchDate instanceof Date) {
        submissionData.matchDate = submissionData.matchDate.toISOString();
      }

      const response = await fetch("http://localhost:5000/api/create/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create match");
      }

      toast.success("Match created successfully");
      router.push("/matches");
    } catch (error) {
      console.error("Error creating match:", error);
      setError(error.message || "Failed to create match. Please try again.");
      toast.error(error.message || "Failed to create match");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/matches")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Match</h1>
        <p className="text-muted-foreground">Set up a match between two teams</p>
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
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>
              Select two teams and provide match details
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team1">Team 1</Label>
                <Select onValueChange={(value) => handleInputChange("team1", value)} value={formData.team1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={`team1-${team.id}`} value={team.id}>
                        {team.teamName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team2">Team 2</Label>
                <Select onValueChange={(value) => handleInputChange("team2", value)} value={formData.team2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={`team2-${team.id}`} value={team.id}>
                        {team.teamName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="Enter match venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange("venue", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchDate">Match Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.matchDate ? format(formData.matchDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.matchDate}
                      onSelect={(date) => handleInputChange("matchDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Match Status</Label>
                <Select onValueChange={(value) => handleInputChange("status", value)} value={formData.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Total Overs</Label>
                <Input
                  id="format"
                  type="number"
                  min={1}
                  placeholder="Enter total number of overs"
                  value={formData.format}
                  onChange={(e) => handleInputChange("format", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="battingFirst">Batting First</Label>
                <Select
                  onValueChange={(value) => handleInputChange("battingFirst", value)}
                  value={formData.battingFirst}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batting first team" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.team1 && formData.team2 && (
                      <>
                        <SelectItem value={formData.team1}>
                          {teams.find((team) => team.id === formData.team1)?.teamName}
                        </SelectItem>
                        <SelectItem value={formData.team2}>
                          {teams.find((team) => team.id === formData.team2)?.teamName}
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/matches")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Match
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
