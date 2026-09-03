import { useState, useRef, useEffect } from 'react'

function AudioPlayer({ src }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('loadedmetadata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = (e) => {
    const audio = audioRef.current
    audio.currentTime = e.target.value
    setCurrentTime(e.target.value)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 shadow-sm">
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-gray-500 font-medium">{formatTime(currentTime)}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{formatTime(duration)}</span>
          </div>
          
          {/* Waveform Visualization (Decorative) */}
          <div className="flex items-center justify-center gap-1 h-6">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-rose-300 to-pink-400 rounded-full transition-all duration-300"
                style={{
                  height: isPlaying ? `${Math.random() * 20 + 8}px` : '8px',
                  opacity: isPlaying ? 1 : 0.5
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Range Input for Scrubbing */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleTimeUpdate}
        className="w-full mt-4 opacity-0 absolute"
        style={{ position: 'absolute', pointerEvents: 'none' }}
      />
    </div>
  )
}

export default AudioPlayer
