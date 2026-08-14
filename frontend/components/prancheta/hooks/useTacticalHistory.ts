"use client"

import { useRef, useState, useEffect } from "react"

export function useTacticalHistory(initialState: any) {
  const historyRef = useRef({
    framesMap: initialState.framesMap,
    activePath: initialState.activePath,
    currentFrameIdx: initialState.currentFrameIdx,
  })

  const [uiTick, setUiTick] = useState(0)

  const saveStateToHistory = () => {
    const s = historyRef.current
    if (s.currentFrameIdx !== historyRef.current.currentFrameIdx) {
      // snapshots taken at the current frame index
    }
    // We need to get the current state from the component state ref
    // This hook works alongside the TacticalBoard main state
    setUiTick((t) => t + 1)
  }

  return { saveStateToHistory, uiTick, setUiTick }
}