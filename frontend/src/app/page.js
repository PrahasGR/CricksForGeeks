"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User, Trophy, LineChart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 space-y-4 md:space-y-6 mb-8 md:mb-0 md:pr-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Cricket Stats & Analysis Like Never Before
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-[600px]">
                CricksForGeeks brings you comprehensive cricket statistics, player profiles, 
                and team analyses in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" asChild>
                  <Link href="/players">Explore Players</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/teams">View Teams</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/matches">View Matches</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full aspect-video md:aspect-square max-w-[500px] mx-auto">
                <Image
                  src="/cricket-hero.jpg" 
                  alt="Cricket player in action"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  priority
                  onError={(e) => {
                    e.target.style.display = 'none'; 
                    // Fallback for missing image
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Everything Cricket in One Place
            </h2>
            <p className="text-muted-foreground max-w-[700px] mx-auto">
              Discover comprehensive statistics, player profiles, and team analyses for cricket enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="border border-border bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <User className="h-10 w-10 text-primary" />
                <CardTitle>Player Profiles</CardTitle>
                <CardDescription>
                  Comprehensive statistics and information about your favorite cricket players.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-border bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <Trophy className="h-10 w-10 text-primary" />
                <CardTitle>Team Analyses</CardTitle>
                <CardDescription>
                  Detailed team statistics, performance metrics, and historical data.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-border bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <LineChart className="h-10 w-10 text-primary" />
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Advanced statistics and visualizations for deeper cricket insights.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-border bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <Search className="h-10 w-10 text-primary" />
                <CardTitle>Search & Compare</CardTitle>
                <CardDescription>
                  Easily search and compare statistics between players and teams.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border border-border rounded-lg bg-card p-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Ready to dive deeper?</h2>
              <p className="text-muted-foreground max-w-[500px]">
                Create an account to save your favorite players, teams, and get personalized cricket insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Register Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} CricksForGeeks. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}