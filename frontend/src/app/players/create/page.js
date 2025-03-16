"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Loader2, UserRound } from "lucide-react";

// Form validation schema - only for mandatory fields
const playerSchema = z.object({
  playerName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  specialization: z.string().min(1, "Specialization is required"),
  // Optional fields
  numberOfMatches: z.coerce.number().int().nonnegative().optional(),
  playerImage: z.string().optional().or(z.literal("")),
});

export default function CreatePlayerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const isLoggedIn = typeof window !== "undefined" 
    ? localStorage.getItem("isLoggedIn") === "true" 
    : false;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      playerName: "",
      dateOfBirth: "",
      nationality: "",
      specialization: "",
      numberOfMatches: 0,
      playerImage: "",
    },
  });

  const onSubmit = async (values) => {
    if (!isLoggedIn) {
      toast.error("Please login to create a player");
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/addPlayer", {
        method: "POST",
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
        throw new Error(data.message || data.error || "Failed to create player");
      }

      toast.success("Player created successfully!");
      router.push("/players");
    } catch (error) {
      console.error("Error creating player:", error);
      setError(error.message || "Failed to create player. Please try again.");
      toast.error("Failed to create player");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild className="mb-2">
          <Link href="/players">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Players
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Player</h1>
        <p className="text-muted-foreground">
          Create a new cricket player profile
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Player Information</CardTitle>
            <CardDescription>
              Enter the basic information for the new player
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Player Name */}
                  <FormField
                    control={form.control}
                    name="playerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter player name" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>
                          Full name of the cricket player
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date of Birth */}
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            disabled={isLoading} 
                          />
                        </FormControl>
                        <FormDescription>
                          Player&apos;s date of birth
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Nationality */}
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter nationality" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>
                          Country the player represents
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Specialization */}
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Batsman">Batsman</SelectItem>
                            <SelectItem value="Bowler">Bowler</SelectItem>
                            <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                            <SelectItem value="Wicket-Keeper">Wicket-Keeper</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Player&apos;s primary playing role
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number of Matches - Optional */}
                  <FormField
                    control={form.control}
                    name="numberOfMatches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Matches</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Total matches played (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Player Image URL - Optional */}
                  <FormField
                    control={form.control}
                    name="playerImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/player-image.jpg" 
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          URL to player&apos;s image (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/players')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserRound className="mr-2 h-4 w-4" />
                        Create Player
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