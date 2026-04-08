"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

interface Snowflake {
  x: number
  y: number
  size: number
  rotation: number
  speed: number
}

const ChristmasCountdown = () => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    // Calculate time remaining until next Christmas
    const calculateNextChristmas = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      const christmas = new Date(currentYear, 11, 25, 7, 0, 0) // December 25th at 7am
      
      // If Christmas has passed this year, target next year
      if (now > christmas) {
        christmas.setFullYear(currentYear + 1)
      }
      
      return christmas.getTime() - now.getTime()
    }

    // Initial calculation
    setTimeRemaining(calculateNextChristmas())

    // Generate random snowflakes
    const generateSnowflakes = () => {
      const newSnowflakes: Snowflake[] = []
      for (let i = 0; i < 50; i++) {
        newSnowflakes.push({
          x: Math.random() * window.innerWidth,
          y: -Math.random() * window.innerHeight,
          size: Math.random() * 20 + 10,
          rotation: Math.random() * 360,
          speed: Math.random() * 2 + 1,
        })
      }
      setSnowflakes(newSnowflakes)
    }
    generateSnowflakes()

    const interval = setInterval(() => {
      setTimeRemaining(calculateNextChristmas())
      setSnowflakes((prevSnowflakes) =>
        prevSnowflakes.map((snowflake) => ({
          ...snowflake,
          y: snowflake.y + snowflake.speed > window.innerHeight 
            ? -snowflake.size 
            : snowflake.y + snowflake.speed,
        }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  return (
    <Card className="w-full bg-[#0A0A0A] text-white relative overflow-hidden">
      <CardContent className="p-4">
        <h2 className="text-center text-xl font-bold text-red-500 mb-4">
          Time Until Christmas!
        </h2>
        <div className="flex justify-center items-center gap-6">
          <TimeBlock label="DAYS" value={days} />
          <TimeBlock label="HOURS" value={hours} />
          <TimeBlock label="MINUTES" value={minutes} />
          <TimeBlock label="SECONDS" value={seconds} />
        </div>
        <div className="absolute top-2 right-2">
          <Image
            src="/santa.png"
            alt="Santa"
            width={32}
            height={32}
            className="animate-bounce"
          />
        </div>
      </CardContent>
      {snowflakes.map((snowflake, index) => (
        <motion.div
          key={index}
          initial={{
            x: snowflake.x,
            y: snowflake.y,
            rotate: snowflake.rotation,
          }}
          animate={{
            y: window.innerHeight + snowflake.size,
            transition: {
              duration: snowflake.speed * 5,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear',
            },
          }}
          className={cn(
            "absolute rounded-full bg-white/80",
            "pointer-events-none select-none"
          )}
          style={{
            width: snowflake.size,
            height: snowflake.size,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          }}
        />
      ))}
    </Card>
  )
}

const TimeBlock = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center">
    <div className="text-2xl sm:text-3xl font-bold text-red-500">
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
      {label}
    </div>
  </div>
)

export default ChristmasCountdown