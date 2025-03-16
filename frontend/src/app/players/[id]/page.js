"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  UserRound,
  Flag,
  CalendarDays,
  Award,
  BarChart3,
  Loader2,
  Edit,
  Trophy,
} from "lucide-react";

export default function PlayerDetailPage({ params }) {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = use(params);

  const isLoggedIn = typeof window !== "undefined"
    ? localStorage.getItem("isLoggedIn") === "true"
    : false;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to view player details");
      router.push("/login");
      return;
    }

    fetchPlayerDetails();
  }, [id, isLoggedIn, router]);

  const fetchPlayerDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/get/player/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // body: JSON.stringify({ id }),
        credentials: "include",
      });

      // Check response format
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 300));
        console.log(text)
        throw new Error("Server returned an invalid response format");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch player details");
      }

      setPlayer(data.attr);
    } catch (error) {
      console.error("Error fetching player details:", error);
      setError(error.message || "Failed to load player. Please try again.");
      toast.error("Failed to load player details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading player details...</span>
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
          <Link href="/players">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Players
          </Link>
        </Button>
      </div>
    );
  }

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
      <div className="flex items-start mb-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/players">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Players
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-4 lg:col-span-3">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              {/* <div className="relative w-32 h-32 mb-4"> */}
                {/* {player?.playerImage ? (
                  <Image
                    src={player.playerImage}
                    alt={player.playerName}
                    fill
                    className="object-cover rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/128?text=" + encodeURIComponent(player.playerName?.charAt(0) || "P");
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <UserRound className="h-16 w-16 text-gray-400" />
                  </div>
                )} */}
              {/* </div> */}
              <h2 className="text-2xl font-bold text-center">{player?.playerName}</h2>
              <div className="mt-2 flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecializationColor(player?.specialization)}`}>
                  {player?.specialization}
                </span>
              </div>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center text-sm">
                  <Flag className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">Nationality:</span>
                  <span className="ml-auto font-medium">{player?.nationality || "N/A"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="ml-auto font-medium">{formatDate(player?.dateOfBirth)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Trophy className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">Matches:</span>
                  <span className="ml-auto font-medium">{player?.numberOfMatches || 0}</span>
                </div>
              </div>
              
              <div className="mt-6 w-full">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/players/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Player
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          <Tabs defaultValue="batting" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="batting">Batting</TabsTrigger>
              <TabsTrigger value="bowling">Bowling</TabsTrigger>
              <TabsTrigger value="fielding">Fielding</TabsTrigger>
            </TabsList>

            <TabsContent value="batting">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Batting Statistics
                  </CardTitle>
                  <CardDescription>
                    Overall batting performance statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard title="Total Runs" value={player?.totalRuns || 0} />
                    <StatCard title="Highest Score" value={player?.highestScore || 0} />
                    <StatCard title="Average" value={player?.avg?.toFixed(2) || "0.00"} />
                    <StatCard title="Strike Rate" value={player?.strikeRate?.toFixed(2) || "0.00"} />
                    <StatCard title="Centuries" value={player?.Century || 0} />
                    <StatCard title="Half Centuries" value={player?.halfCentury || 0} />
                    <StatCard title="Fours" value={player?.boundry || 0} />
                    <StatCard title="Sixes" value={player?.sixes || 0} />
                    <StatCard title="Balls Faced" value={player?.ballsFaced || 0} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bowling">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Bowling Statistics
                  </CardTitle>
                  <CardDescription>
                    Overall bowling performance statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard title="Wickets" value={player?.wickets || 0} />
                    <StatCard title="Balls Bowled" value={player?.balls || 0} />
                    <StatCard title="Runs Given" value={player?.runsGiven || 0} />
                    <StatCard title="Best Bowling" value={player?.bbm || "0/0"} />
                    <StatCard title="Economy" value={player?.eco?.toFixed(2) || "0.00"} />
                    <StatCard title="Bowling Avg" value={player?.avg?.toFixed(2) || "0.00"} />
                    <StatCard title="Strike Rate" value={player?.bowlstrikerate?.toFixed(2) || "0.00"} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fielding">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Fielding Statistics
                  </CardTitle>
                  <CardDescription>
                    Overall fielding performance statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard title="Catches" value={player?.catchestaken || 0} />
                    <StatCard title="Stumpings" value={player?.Stumpings || 0} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Helper component for stats
function StatCard({ title, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}