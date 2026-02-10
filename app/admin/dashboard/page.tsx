'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Response {
  id: number;
  name_input: string;
  sender_guess: string;
  feelings_answer: boolean;
  is_name_match: boolean;
  is_qualified: boolean;
  timer_started_at: string;
  timer_completed: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [story, setStory] = useState('');
  const [newStory, setNewStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'responses' | 'story'>('responses');
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [responsesRes, storyRes] = await Promise.all([
        fetch('/api/admin/responses'),
        fetch('/api/admin/story'),
      ]);

      if (responsesRes.status === 401 || storyRes.status === 401) {
        router.push('/admin');
        return;
      }

      const responsesData = await responsesRes.json();
      const storyData = await storyRes.json();

      if (responsesData.success) {
        setResponses(responsesData.responses);
      }

      if (storyData.success) {
        setStory(storyData.story);
        setNewStory(storyData.story);
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStory() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newStory }),
      });

      const data = await res.json();
      if (data.success) {
        setStory(newStory);
        alert('Story updated successfully!');
      }
    } catch (err) {
      alert('Failed to update story');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        alert('All data has been reset!');
        await loadData();
      }
    } catch (err) {
      alert('Failed to reset data');
    } finally {
      setResetting(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage responses and story content
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('responses')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'responses'
                    ? 'text-slate-800 border-b-2 border-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Responses ({responses.length})
              </button>
              <button
                onClick={() => setActiveTab('story')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'story'
                    ? 'text-slate-800 border-b-2 border-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Story
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'responses' && (
              <div className="space-y-4">
                {responses.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">No responses yet</p>
                ) : (
                  <div className="space-y-4">
                    {responses.map((response) => (
                      <div
                        key={response.id}
                        className="border border-slate-200 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">
                            {response.name_input || 'No name'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(response.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Sender Guess:</span>{' '}
                            <span className="text-slate-800">
                              {response.sender_guess || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Feelings:</span>{' '}
                            <span className="text-slate-800">
                              {response.feelings_answer === null
                                ? 'N/A'
                                : response.feelings_answer
                                ? 'Yes'
                                : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Name Match:</span>{' '}
                            <span
                              className={
                                response.is_name_match
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {response.is_name_match ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Qualified:</span>{' '}
                            <span
                              className={
                                response.is_qualified
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {response.is_qualified ? 'Yes' : 'No'}
                            </span>
                          </div>
                          {response.timer_started_at && (
                            <>
                              <div>
                                <span className="text-slate-600">Timer Started:</span>{' '}
                                <span className="text-slate-800">
                                  {new Date(response.timer_started_at).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">Timer Completed:</span>{' '}
                                <span className="text-slate-800">
                                  {response.timer_completed ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'story' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Story Content
                  </label>
                  <textarea
                    value={newStory}
                    onChange={(e) => setNewStory(e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition font-mono text-sm"
                    placeholder="Enter the story that will be revealed..."
                  />
                </div>
                <button
                  onClick={handleUpdateStory}
                  disabled={saving || newStory === story}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white rounded-lg transition font-medium"
                >
                  {saving ? 'Saving...' : 'Update Story'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h2 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h2>
          <p className="text-sm text-slate-600 mb-4">
            Reset all data including responses, sessions, and timer states. This action
            cannot be undone.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition font-medium"
          >
            {resetting ? 'Resetting...' : 'Reset All Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
