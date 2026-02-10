'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FinalPage() {
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [story, setStory] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!loading && !timerCompleted) {
      const interval = setInterval(() => {
        fetchTimerStatus();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [loading, timerCompleted]);

  async function checkAccess() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();

      if (data.success) {
        if (!data.response.locked_to_final) {
          router.push('/');
          return;
        }

        if (data.response.timer_completed) {
          await fetchStory();
        } else {
          await fetchTimerStatus();
        }
      }
    } catch (err) {
      setError('Failed to load. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTimerStatus() {
    try {
      const res = await fetch('/api/timer');
      const data = await res.json();

      if (data.success) {
        setRemainingSeconds(data.remainingSeconds);
        setTimerCompleted(data.timerCompleted);

        if (data.timerCompleted && data.storyRevealed) {
          await fetchStory();
        }
      }
    } catch (err) {
      console.error('Timer fetch error:', err);
    }
  }

  async function fetchStory() {
    try {
      const res = await fetch('/api/story');
      const data = await res.json();

      if (data.success) {
        setStory(data.story);
        setTimerCompleted(true);
      }
    } catch (err) {
      console.error('Story fetch error:', err);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {!timerCompleted ? (
            <>
              <div className="text-center space-y-4">
                <div className="text-7xl mb-4">⏳</div>
                <h1 className="text-3xl font-light text-slate-800">
                  Your story is being prepared...
                </h1>
                <p className="text-slate-600">
                  Please wait while we reveal what was written for you.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="text-6xl font-light text-slate-800 tabular-nums">
                  {formatTime(remainingSeconds)}
                </div>
                <div className="w-full max-w-md bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-800 h-full transition-all duration-1000"
                    style={{
                      width: `${((120 - remainingSeconds) / 120) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-slate-500">
                  This timer cannot be paused or reset.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="text-5xl mb-4">💌</div>
                <h1 className="text-3xl font-light text-slate-800">For You</h1>
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {story}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
