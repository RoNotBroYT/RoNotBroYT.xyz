import { Nav } from "@/components/nav";
import prisma from "@/db/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EventsPage() {
  const pastEvents = await prisma.event.findMany({
    where: {
      OR: [
        { status: "COMPLETED" },
        { 
          date: {
            lt: new Date() 
          }
        }
      ]
    },
    orderBy: {
      date: "desc"
    }
  });

  return (
    <div>
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Past Events</h1>
        
        {pastEvents.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No past events to display
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div 
                key={event.id} 
                className="border p-4 rounded-lg bg-background hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(event.date).toLocaleDateString()} - {event.type}
                </p>
                <p className="text-sm mb-2">{event.description}</p>
                <div className="text-xs text-muted-foreground">
                  Status: {event.status}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 