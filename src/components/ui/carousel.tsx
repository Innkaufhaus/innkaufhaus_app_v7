"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  orientation?: "horizontal" | "vertical"
}

interface CarouselState {
  currentIndex: number
  isAnimating: boolean
}

const CarouselContext = React.createContext<{
  state: CarouselState
  dispatch: React.Dispatch<any>
  orientation: "horizontal" | "vertical"
} | null>(null)

function carouselReducer(state: CarouselState, action: any) {
  switch (action.type) {
    case "NEXT":
      return {
        ...state,
        currentIndex: action.nextIndex,
        isAnimating: true,
      }
    case "PREV":
      return {
        ...state,
        currentIndex: action.prevIndex,
        isAnimating: true,
      }
    case "ANIMATION_END":
      return {
        ...state,
        isAnimating: false,
      }
    default:
      return state
  }
}

function Carousel({
  orientation = "horizontal",
  className,
  children,
  ...props
}: CarouselProps) {
  const [state, dispatch] = React.useReducer(carouselReducer, {
    currentIndex: 0,
    isAnimating: false,
  })

  const value = React.useMemo(
    () => ({ state, dispatch, orientation }),
    [state, orientation]
  )

  return (
    <CarouselContext.Provider value={value}>
      <div
        className={cn("relative overflow-hidden", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("CarouselContent must be used within Carousel")

  const { state, orientation } = context
  const style = {
    transform: orientation === "horizontal" 
      ? `translateX(-${state.currentIndex * 100}%)`
      : `translateY(-${state.currentIndex * 100}%)`,
    transition: "transform 0.3s ease-in-out",
  }

  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className
        )}
        style={style}
        {...props}
      />
    </div>
  )
}

function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("CarouselItem must be used within Carousel")

  return (
    <div
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      role="group"
      aria-roledescription="slide"
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("CarouselPrevious must be used within Carousel")

  const { state, dispatch, orientation } = context
  const totalSlides = React.Children.count(
    (context as any).children?.props?.children
  )

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute z-10 size-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={state.currentIndex === 0}
      onClick={() => {
        dispatch({
          type: "PREV",
          prevIndex: Math.max(0, state.currentIndex - 1),
        })
      }}
      {...props}
    >
      <ArrowLeft className="size-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("CarouselNext must be used within Carousel")

  const { state, dispatch, orientation } = context
  const totalSlides = React.Children.count(
    (context as any).children?.props?.children
  )

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute z-10 size-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={state.currentIndex === totalSlides - 1}
      onClick={() => {
        dispatch({
          type: "NEXT",
          nextIndex: Math.min(totalSlides - 1, state.currentIndex + 1),
        })
      }}
      {...props}
    >
      <ArrowRight className="size-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
