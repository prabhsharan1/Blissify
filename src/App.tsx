/**
 * @file App.tsx
 * @description Main application entry point for the Blissify platform.
 * * ARCHITECTURE NOTE:
 * This component serves as the central state container and routing hub.
 * In a Human-Robot Interaction (HRI) context, this structure ensures:
 * 1. Seamless transitions between states (Critical for maintaining user immersion)
 * 2. Centralized session management (User/Emotion state)
 * 3. Scalable routing for adding new intervention modules
 * * @author Prabhsharan Singh Sethi
 */

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion"; // Used for fluid UI transitions to enhance user engagement
import { Sparkles } from "lucide-react";

// Component Imports
import { EmotionSelector } from "./components/EmotionSelector";
import { ActivityCard } from "./components/ActivityCard";
import { LoginForm } from "./components/auth/LoginForm";
import { EmotionLogger } from "./components/EmotionLogger";
import { EmotionLogList } from "./components/EmotionLogList";
import { EmergencyAlert } from "./components/alerts/EmergencyAlert";
import { ActivityPage } from "./pages/ActivityPage";

// Data & Type Definitions
import { activities } from "./data/activities";
import type { Emotion, User, EmotionLog } from "./types";

function App() {
  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  
  // User Session State: Manages authentication status. 
  // TODO: Integrate with OAuth2 provider for production security.
  const [user, setUser] = useState<User | null>(null);

  // Interaction State: Tracks the user's current emotional context to drive recommendations.
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  
  // Longitudinal Data: Local cache of emotion logs. 
  // In a full HRI study, this would sync with a SQL/Node.js backend for analysis.
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);

  // ---------------------------------------------------------------------------
  // LOGIC & HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Recommendation Engine
   * Filters available activities based on the user's current emotional state.
   * This mimics a basic "Recommender System" commonly used in affective computing.
   */
  const recommendedActivities = selectedEmotion
    ? activities.filter((activity) => activity.emotions.includes(selectedEmotion))
    : [];

  const handleLogin = (data: { email: string; password: string }) => {
    // Simulating authentication flow
    setUser({ email: data.email, name: data.email.split("@")[0] });
  };

  const handleLogEmotion = (log: EmotionLog) => {
    // Immutable state update pattern to ensure data integrity
    setEmotionLogs((prev) => [...prev, log]);
  };

  // ---------------------------------------------------------------------------
  // VIEW LAYER (Render)
  // ---------------------------------------------------------------------------

  // Auth Guard: Force login if no session exists
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* DASHBOARD ROUTE */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
              <div className="container mx-auto px-4 py-8">
                {/* Safety Mechanism: Critical for mental health applications */}
                <EmergencyAlert />
                
                {/* Header Animation: Reduces cognitive load via smooth entry */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-12"
                >
                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 10 }}
                    >
                      <Sparkles className="w-10 h-10 text-blue-500" />
                    </motion.div>
                    <h1 className="text-5xl font-extrabold text-gray-800 ml-3">
                      Blissify
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg">
                    Welcome, {user.name}! Let's track your emotions and find moments of bliss.
                  </p>
                </motion.div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Interaction Area */}
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg mb-8"
                    >
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                        How are you feeling today?
                      </h2>
                      <EmotionSelector
                        selectedEmotion={selectedEmotion}
                        onSelect={setSelectedEmotion}
                      />
                    </motion.div>

                    {/* Conditional Render: Only show interventions if state is selected */}
                    {selectedEmotion && (
                      <>
                        <EmotionLogger
                          emotion={selectedEmotion}
                          onLog={handleLogEmotion}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <h2 className="text-2xl font-semibold text-gray-800">
                            Recommended Activities
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {recommendedActivities.map((activity) => (
                              <ActivityCard key={activity.id} activity={activity} />
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Right Column: Historical Data Visualization */}
                  <div className="lg:col-span-1">
                    <EmotionLogList logs={emotionLogs} />
                  </div>
                </div>
              </div>
            </div>
          }
        />
        
        {/* DYNAMIC ACTIVITY ROUTE */}
        <Route path="/activity/:type/:id" element={<ActivityPage />} />
      </Routes>
    </Router>
  );
}

export default App;
