import ChristmasCountdown from "@/components/christmascount";
import { YouTubeVideos } from "@/components/youtubevideos";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react"
import { get } from "@vercel/edge-config";
import prisma from "@/db/prisma";
import { Nav } from "@/components/nav";

const Home = async () => {
  const celebration = await get('celebration');
  const christmas = celebration === "christmas";

  const events = await prisma.event.findMany({
    orderBy: {
      date: "asc",
    },
    where: {
      status: "UPCOMING"
    },
    take: 3, // Limit to 3 upcoming events
  });

  return (
    <div className="bg-slate-800/50 backdrop-blur-xs text-foreground min-h-screen">
      <Nav />
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold 
            text-primary 
            bg-gradient-to-r from-primary to-accent 
            bg-clip-text 
            dark:bg-gradient-to-r dark:from-primary-foreground dark:to-accent-foreground 
            animate-fly-in">
            Welcome to <br/>RoNotBroYT&apos;s Official Website
          </h1>
          <p className="text-xl md:text-2xl dark:text-muted-foreground max-w-3xl mx-auto animate-slide-in-right">
            Here we are dediacted to bringing you a fresh look at all things planes. Whether you are here to discover new videos, read our blog, or chat with fans, then you are in the right place.
          </p>
        </header>

        {christmas && (
          <div className="flex justify-center items-center space-x-4 
            bg-secondary/20 backdrop-blur-sm rounded-xl p-6 animate-slide-in-left">
            <ChristmasCountdown />
            <Button variant="outline" className="ml-4">
              <Link href="/christmas">
                Explore Christmas Games
              </Link>
            </Button>
          </div>
        )}
        
        {events.length > 0 && (
          <section className="animate-slide-in-right">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary animate-fly-in">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-card/50 backdrop-blur-sm text-card-foreground border border-border/50 
                  rounded-xl p-6 hover:shadow-lg transition-all duration-300 
                  hover:scale-105 hover:border-primary animate-pulse-glow"
                >
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(event.date).toLocaleDateString()} - {event.type}
                  </p>
                  <p className="text-sm">{event.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          </section>
        )}


        <section className="animate-slide-in-left">
          <YouTubeVideos />
        </section>
      </div>
    </div>
  );
}
export default Home;
