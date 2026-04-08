import ChristmasGamesCollection from "@/components/christmas";
import { get } from "@vercel/edge-config";
import { CornerUpLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const Home = async () => {
  const celebration = await get("celebration");
  const christmas = celebration === "christmas";

  return (
    <div className="min-h-screen p-4 container mx-auto max-w-6xl">
      {christmas && (
        <div className="flex flex-col space-y-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CornerUpLeft size={16} /> 
            Back home
          </Link>
          
          <h1 className="text-center font-black text-black bg-clip-text text-4xl sm:text-5xl">
            Merry Christmas
          </h1>

          <div className="flex flex-col items-center gap-6">
            <ChristmasGamesCollection />
          
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;