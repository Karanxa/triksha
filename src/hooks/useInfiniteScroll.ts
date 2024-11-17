import { useEffect, useRef, useState, useCallback } from "react"

export const useInfiniteScroll = (callback: () => void) => {
  const [isFetching, setIsFetching] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isFetching) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isFetching) {
        setIsFetching(true)
        callback()
      }
    })

    if (node) observer.current.observe(node)
  }, [callback, isFetching])

  const resetFetching = () => {
    setIsFetching(false)
  }

  return { lastElementRef, isFetching, resetFetching }
}