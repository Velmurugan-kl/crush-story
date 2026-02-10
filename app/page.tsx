'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [nameInput, setNameInput] = useState('');
  const [senderGuess, setSenderGuess] = useState('');
  const [feelings, setFeelings] = useState<boolean | null>(null);
  const [isQualified, setIsQualified] = useState(false);
  const [lockedToFinal, setLockedToFinal] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    initSession();
  }, []);

  async function initSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();

      if (data.success) {
        // If locked to final, redirect
        if (data.response.locked_to_final) {
          router.push('/final');
          return;
        }

        setPage(data.response.current_page);
        setIsQualified(data.response.is_qualified);
        setLockedToFinal(data.response.locked_to_final);
      }
    } catch (err) {
      setError('Failed to load. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitName() {
    if (!nameInput.trim()) {
      setError('Please enter your name');
      return;
    }

    setError('');
    try {
      const res = await fetch('/api/submit-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput }),
      });

      const data = await res.json();
      if (data.success) {
        setPage(2);
      } else {
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  }

  async function handleSubmitSender() {
    if (!senderGuess.trim()) {
      setError('Please make a guess');
      return;
    }

    setError('');
    try {
      const res = await fetch('/api/submit-sender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderGuess }),
      });

      const data = await res.json();
      if (data.success) {
        setPage(3);
      } else {
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  }

  async function handleSubmitFeelings(answer: boolean) {
    setFeelings(answer);
    setError('');

    try {
      const res = await fetch('/api/submit-feelings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feelings: answer }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.qualified) {
          router.push('/final');
        } else {
          setPage(4);
        }
      } else {
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Page 1: Name Input */}
          {page === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-light text-slate-800">Welcome</h1>
                <p className="text-slate-600">This is for you.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm text-slate-700">What is your name?</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitName()}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition"
                  placeholder="Your name"
                  autoFocus
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={handleSubmitName}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg transition font-medium"
              >
                Next
              </button>
            </div>
          )}

          {/* Page 2: Sender Guess */}
          {page === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-light text-slate-800">One question</h1>
                <p className="text-slate-600">Before we continue...</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm text-slate-700">
                  Who do you think sent this gift?
                </label>
                <input
                  type="text"
                  value={senderGuess}
                  onChange={(e) => setSenderGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitSender()}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition"
                  placeholder="Your guess"
                  autoFocus
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={handleSubmitSender}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg transition font-medium"
              >
                Next
              </button>
            </div>
          )}

          {/* Page 3: Feelings Question */}
          {page === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-light text-slate-800">Final question</h1>
                <p className="text-slate-600">Please be honest.</p>
              </div>

              <div className="space-y-4">
                <p className="text-center text-slate-700">
                  Did you truly have feelings for him?
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSubmitFeelings(true)}
                    className="py-4 rounded-lg border-2 border-slate-300 hover:border-slate-800 hover:bg-slate-50 transition font-medium text-slate-800"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleSubmitFeelings(false)}
                    className="py-4 rounded-lg border-2 border-slate-300 hover:border-slate-800 hover:bg-slate-50 transition font-medium text-slate-800"
                  >
                    No
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
          )}

          {/* Page 4: Not Qualified */}
          {page === 4 && !isQualified && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="text-6xl">✉️</div>
                <h1 className="text-2xl font-light text-slate-800">Thank you</h1>
                <p className="text-slate-600 leading-relaxed">
                  You know whom to contact.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
