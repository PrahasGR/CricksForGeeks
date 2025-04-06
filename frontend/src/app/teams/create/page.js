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
  CardFooter,
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema
const teamSchema = z.object({
  teamName: z
    .string()
    .min(2, { message: "Team name must be at least 2 characters" })
    .max(50, { message: "Team name must be at most 50 characters" }),
  playerID: z.array(z.string()).optional(),
});

export default function CreateTeamPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const router = useRouter();

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

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to create a team");
      router.push("/login");
      return;
    }

    // Fetch available players - in a real app, you would implement this
    // For now, we'll skip this part since we don't have the players API endpoint
  }, [isLoggedIn, router]);

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/makeTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create team");
      }

      toast.success("Team created successfully!");
      router.push("/teams");
    } catch (error) {
      console.error("Error creating team:", error);
      setError(error.message || "Failed to create team. Please try again.");
      toast.error("Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild className="mb-2">
          <Link href="/teams">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Teams
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
        <p className="text-muted-foreground">
          Create a new cricket team and add players
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
            <CardDescription>
              Enter the details for your new cricket team
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

                {/* For now, we'll skip the player selection UI since we don't have a player API yet */}
                {/* In a real app, you would add a multi-select component here */}
                <FormField
                  control={form.control}
                  name="playerID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Players</FormLabel>
                      <FormDescription>
                        You can add players to your team later from the team details page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Team
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}