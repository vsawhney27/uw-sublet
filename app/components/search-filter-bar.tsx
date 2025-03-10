import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface SearchFilterBarProps {
  onSearch: (filters: {
    query: string
    startDate: Date | undefined
    endDate: Date | undefined
    isRoomOnly: boolean
  }) => void
}

export function SearchFilterBar({ onSearch }: SearchFilterBarProps) {
  const [query, setQuery] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isRoomOnly, setIsRoomOnly] = useState(false)

  const handleSearch = () => {
    onSearch({
      query,
      startDate,
      endDate,
      isRoomOnly,
    })
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-grow min-w-[300px]">
        <Input
          type="text"
          placeholder="Search by keyword, location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 text-lg"
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-12 justify-start text-left font-normal w-[180px]",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-12 justify-start text-left font-normal w-[180px]",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant={isRoomOnly ? "default" : "outline"}
        className="h-12 px-6"
        onClick={() => setIsRoomOnly(!isRoomOnly)}
      >
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mr-2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Room Only
        </span>
      </Button>

      <Button 
        onClick={handleSearch}
        className="h-12 px-8 bg-red-700 hover:bg-red-800 text-white"
      >
        Search
      </Button>
    </div>
  )
} 