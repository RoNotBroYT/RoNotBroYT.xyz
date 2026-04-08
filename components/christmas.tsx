"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Snowflake, 
  Gift, 
  MapPin, 
  Clock, 
  Rocket, 
  Star,
  Candy
} from "lucide-react";
import SantaTracker  from "./santa"
import { cn } from "@/lib/utils";
import ChristmasCountdown from './christmascount';
// Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  city: string;
  region: string;
  coordinates: Coordinates;
}

interface TimeToChristmas {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface SantaStop {
  id: string;
  arrival: number;
  departure: number;
  location: {
    lat: number;
    lng: number;
  };
  city: string;
  region: string;
  presentsDelivered: number;
}

interface SantaRouteData {
  destinations: SantaStop[];
  santa: {
    status: string;
    lastStop?: SantaStop;
    nextStop?: SantaStop;
    presentsDelivered: number;
  };
}

interface SantaData {
  currentLocation: {
    city: string;
    region: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  presentsDelivered: number;
  totalPresents: number;
  travelSpeed: number;
  timeToChristmas: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  nextStop?: {
    city: string;
    region: string;
    arrival: number;
  };
}

interface GiftType {
  name: string;
  icon: string;
  points: number;
}

interface Gift {
  id: string;
  type: GiftType;
  wrapped: boolean;
}

interface PowerUp {
  type: 'speedBoost' | 'timeFreeze' | 'multiWrap';
  icon: string;
  duration: number;
  active: boolean;
}

interface GameState {
  isActive: boolean;
  score: number;
  timeLeft: number;
  highScore: number;
  combo: number;
  powerUps: PowerUp[];
  level: number;
}

// Constants
const INITIAL_SANTA_DATA: SantaData = {
  currentLocation: {
    city: "North Pole",
    region: "Arctic",
    coordinates: { lat: 90, lng: 0 }
  },
  presentsDelivered: 0,
  totalPresents: 7_000_000_000,
  travelSpeed: 0,
  timeToChristmas: {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  }
};

const GIFT_TYPES: GiftType[] = [
  { name: "Teddy Bear", icon: "🧸", points: 10 },
  { name: "Toy Car", icon: "🚗", points: 15 },
  { name: "Doll", icon: "🎎", points: 20 },
  { name: "LEGO Set", icon: "🧩", points: 25 },
  { name: "Book", icon: "📖", points: 30 }
];

const INITIAL_GAME_STATE: GameState = {
  isActive: false,
  score: 0,
  timeLeft: 30,
  highScore: 0,
  combo: 1,
  powerUps: [],
  level: 1
}

const POWER_UPS: PowerUp[] = [
  { type: 'speedBoost', icon: '⚡', duration: 10, active: false },
  { type: 'timeFreeze', icon: '❄️', duration: 5, active: false },
  { type: 'multiWrap', icon: '✨', duration: 8, active: false }
]

// Utility functions
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateTimeToChristmas = (): TimeToChristmas => {
  const now = new Date();
  const christmas = new Date(now.getFullYear(), 11, 25);
  if (now > christmas) christmas.setFullYear(christmas.getFullYear() + 1);
  
  const difference = christmas.getTime() - now.getTime();
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
};

const generateNewGifts = (count: number): Gift[] => {
  return Array.from({ length: count }, () => ({
    id: crypto.randomUUID(),
    type: GIFT_TYPES[Math.floor(Math.random() * GIFT_TYPES.length)],
    wrapped: false
  }));
};

// Components
const SantaLocationInfo: React.FC<{ location: Location }> = ({ location }) => (
  <div className="flex items-center gap-2">
    <MapPin className="text-green-500" />
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">Current Location</span>
      <span className="font-bold">{location.city}</span>
      <span className="text-sm text-gray-600">{location.region}</span>
    </div>
  </div>
);

const TimeToChristmasDisplay: React.FC<{ time: TimeToChristmas }> = ({ time }) => (
  <div className="flex items-center gap-2">
    <Clock className="text-blue-500" />
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">Time to Christmas</span>
      <span className="font-bold">
        {time.days}d {time.hours}h {time.minutes}m
      </span>
    </div>
  </div>
);

const AdvancedSantaTracker: React.FC = () => {
  const [santaData, setSantaData] = useState<SantaData>(INITIAL_SANTA_DATA);
  const [routeData, setRouteData] = useState<SantaRouteData | null>(null);

  useEffect(() => {
    const fetchSantaRoute = async () => {
      try {
        const response = await fetch('https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b');
        const data = await response.json();
        setRouteData(data);
      } catch (error) {
        console.error('Error fetching Santa route:', error);
      }
    };

    fetchSantaRoute();
  }, []);

  useEffect(() => {
    if (!routeData) return;

    const updateSantaStatus = () => {
      const now = Date.now();
      const countdown = calculateTimeToChristmas();

      const currentStop = routeData.destinations.find(stop => 
        stop.arrival <= now && stop.departure >= now
      );

      const nextStop = routeData.destinations.find(stop =>
        stop.arrival > now
      );

      const speed = currentStop && nextStop
        ? Math.round((calculateDistance(
            currentStop.location.lat,
            currentStop.location.lng,
            nextStop.location.lat,
            nextStop.location.lng
          ) / (nextStop.arrival - now)) * 3600)
        : 0;

      setSantaData(prev => ({
        ...prev,
        timeToChristmas: countdown,
        currentLocation: currentStop ? {
          city: currentStop.city,
          region: currentStop.region,
          coordinates: currentStop.location
        } : prev.currentLocation,
        presentsDelivered: currentStop
          ? routeData.destinations
              .filter(stop => stop.departure < now)
              .reduce((sum, stop) => sum + stop.presentsDelivered, 0)
          : prev.presentsDelivered,
        travelSpeed: speed,
        nextStop: nextStop ? {
          city: nextStop.city,
          region: nextStop.region,
          arrival: nextStop.arrival
        } : undefined
      }));
    };

    const interval = setInterval(updateSantaStatus, 1000);
    return () => clearInterval(interval);
  }, [routeData]);

  return (
    <Card className="w-full bg-[#0A0A0A] text-white">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="text-red-500 h-5 w-5" />
          Live Santa Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
        

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="text-purple-500" />
                  <span>Presents Delivered</span>
                </div>
                <span className="font-bold">
                  {Math.floor((santaData.presentsDelivered / santaData.totalPresents) * 100)}%
                </span>
              </div>
              <Progress value={(santaData.presentsDelivered / santaData.totalPresents) * 100} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Rocket className="text-orange-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Current Speed</span>
                <span className="font-bold">{santaData.travelSpeed.toLocaleString()} km/h</span>
              </div>
            </div>

            {santaData.nextStop && (
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Next Stop</span>
                  <span className="font-bold">{santaData.nextStop.city}</span>
                  <span className="text-sm">
                    in {Math.ceil((santaData.nextStop.arrival - Date.now()) / 60000)}m
                  </span>
                </div>
              </div>
            )}
          </div>
          <SantaTracker />
        </div>
      </CardContent>
    </Card>
  );
};

const ElfGiftWrappingChallenge: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [shake, setShake] = useState(false)

  const startGame = useCallback(() => {
    setGifts(generateNewGifts(12))
    setGameState({
      ...INITIAL_GAME_STATE,
      isActive: true,
      powerUps: POWER_UPS.map(p => ({ ...p, active: false }))
    })
  }, [])

  // Add power-up logic
  const activatePowerUp = useCallback((type: PowerUp['type']) => {
    setGameState(prev => ({
      ...prev,
      powerUps: prev.powerUps.map(p =>
        p.type === type ? { ...p, active: true } : p
      )
    }))

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        powerUps: prev.powerUps.map(p =>
          p.type === type ? { ...p, active: false } : p
        )
      }))
    }, POWER_UPS.find(p => p.type === type)!.duration * 1000)
  }, [])

  const wrapGift = useCallback((giftId: string) => {
    if (!gameState.isActive) return

    setGifts(prev => {
      const gift = prev.find(g => g.id === giftId)
      if (!gift || gift.wrapped) return prev

      const multiWrapActive = gameState.powerUps.find(p => p.type === 'multiWrap')?.active
      const updatedGifts = prev.map(g =>
        multiWrapActive ? { ...g, wrapped: true } : 
        g.id === giftId ? { ...g, wrapped: true } : g
      )

      // Update score with combo multiplier
      setGameState(prevState => {
        const newCombo = prevState.combo + 0.1
        const comboBonus = Math.floor(gift.type.points * newCombo)
        
        return {
          ...prevState,
          score: prevState.score + comboBonus,
          combo: newCombo,
          level: Math.floor(prevState.score / 1000) + 1
        }
      })

      // Shake effect
      setShake(true)
      setTimeout(() => setShake(false), 200)

      // Random power-up chance
      if (Math.random() < 0.1) {
        const randomPowerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)]
        activatePowerUp(randomPowerUp.type)
      }

      // Generate new gifts if all are wrapped, but don't increase time
      if (updatedGifts.every(g => g.wrapped)) {
        return generateNewGifts(12)
      }

      return updatedGifts
    })
  }, [gameState.isActive, gameState.powerUps, activatePowerUp])

  // Update the game over logic in useEffect
  useEffect(() => {
    if (!gameState.isActive || gameState.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // Update high score when game ends
          return {
            ...prev,
            isActive: false,
            timeLeft: 0,
            highScore: Math.max(prev.highScore, prev.score)
          };
        }
        // Simply decrease time
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isActive, gameState.timeLeft]);

  // Update the return JSX with new UI elements
  return (
    <Card className={cn(
      "w-full bg-[#0A0A0A] text-white", 
      shake && "animate-shake"
    )}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="text-red-500 h-5 w-5" />
          Elf Gift Wrapping Challenge
        </CardTitle>
        <CardDescription className="text-gray-400">
          Level {gameState.level} - Combo x{gameState.combo.toFixed(1)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-xl font-bold">{gameState.score}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">High Score</div>
              <div className="text-xl font-bold">{gameState.highScore}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Time Left</div>
              <div className="text-xl font-bold">{gameState.timeLeft}s</div>
            </div>
          </div>

          {/* Power-ups with reduced size */}
          {gameState.isActive && (
            <div className="flex gap-2 justify-center">
              {gameState.powerUps.map(powerUp => (
                <div
                  key={powerUp.type}
                  className={cn(
                    "p-1.5 rounded-full text-sm",
                    powerUp.active 
                      ? "bg-green-500 animate-pulse" 
                      : "bg-gray-800"
                  )}
                >
                  {powerUp.icon}
                </div>
              ))}
            </div>
          )}

          {/* Gift grid with smaller buttons */}
          <div className="grid grid-cols-3 gap-2">
            {gifts.map(gift => (
              <Button
                key={gift.id}
                variant={gift.wrapped ? "secondary" : "default"}
                onClick={() => wrapGift(gift.id)}
                disabled={!gameState.isActive || gift.wrapped}
                className={cn(
                  "h-12 w-full text-lg relative",
                  gift.wrapped && "bg-green-900/20",
                  !gift.wrapped && "hover:scale-105"
                )}
              >
                {gift.wrapped ? "🎁" : gift.type.icon}
                {!gift.wrapped && (
                  <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-black/50 rounded px-1">
                    +{gift.type.points}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {!gameState.isActive && (
            <Button 
              onClick={startGame} 
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {gameState.score > 0 ? "Play Again" : "Start Wrapping"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Christmas Games Collection
export const ChristmasGamesCollection: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="w-full max-w-2xl">
        <ChristmasCountdown />
      </div>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdvancedSantaTracker />
        <ElfGiftWrappingChallenge />
      </div>
    </div>
  );
};

export default ChristmasGamesCollection;