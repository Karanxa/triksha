import { cn } from "@/lib/utils"

export const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2",
        "bg-[#E9E9EB] text-black rounded-tl-sm"
      )}>
        <div className="flex gap-1 py-1">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${dot * 0.2}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}