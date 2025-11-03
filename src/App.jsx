"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Youtube, Mic, Book, TrendingUp, Clock, Target, LogOut, User } from "lucide-react"
import { meta } from "@eslint/js"
import api from "./service/apiService"

export default function ContentLearningTracker() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [isRegistering, setIsRegistering] = useState(false)
  const [skills, setSkills] = useState([])
  const [contents, setContents] = useState([])
  const [sessions, setSessions] = useState([])
  const [activeTab, setActiveTab] = useState("skills")
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    targetLevel: "Intermediate",
    currentLevel: "Beginner",
  })
  const [newContent, setNewContent] = useState({
    title: "",
    creator: "",
    type: "youtube",
    skillId: "",
    url: "",
    status: "to-watch",
  })
  const [newSession, setNewSession] = useState({ contentId: "", date: "", duration: "", notes: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    checkLoggedInUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadUserData()
    }
  }, [currentUser])

  const checkLoggedInUser = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      if (token) {
        const userData = await api.get("/auth/me")
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      localStorage.removeItem("auth-token")
    }
  }

  const loadUserData = async () => {
    if (!currentUser) return

    try {
      setLoading(true)

      const [skillsData, contentsData, sessionsData] = await Promise.all([
        api.get("/skills"),
        api.get("/contents"),
        api.get("/sessions"),
      ])

      setSkills(skillsData)
      setContents(contentsData)
      setSessions(sessionsData)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setError("Please enter username and password")
      return
    }

    try {
      setLoading(true)
      setError("")
      const data = await api.post("/auth/login", {
        username: loginForm.username,
        password: loginForm.password,
      })

      localStorage.setItem("auth-token", data.token)
      setCurrentUser(data.user)
      setLoginForm({ username: "", password: "" })
    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setError("Please enter username and password")
      return
    }

    try {
      setLoading(true)
      setError("")
      const data = await api.post("/auth/register", loginForm)

      localStorage.setItem("auth-token", data.token)
      setCurrentUser(data.user)
      setLoginForm({ username: "", password: "" })
      setIsRegistering(false)
    } catch (error) {
      console.error("Registration error:", error)
      setError(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
      localStorage.removeItem("auth-token")
      setCurrentUser(null)
      setSkills([])
      setContents([])
      setSessions([])
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear local state even if API call fails
      localStorage.removeItem("auth-token")
      setCurrentUser(null)
      setSkills([])
      setContents([])
      setSessions([])
    }
  }

  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[7].length === 11 ? match[7] : null
  }

  const getYouTubeThumbnail = (url) => {
    const videoId = extractYouTubeId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
  }

  const addSkill = async () => {
    if (newSkill.name.trim()) {
      try {
        setError("")
        const skill = await api.post("/skills", newSkill)
        setSkills([...skills, skill])
        setNewSkill({ name: "", category: "", targetLevel: "Intermediate", currentLevel: "Beginner" })
      } catch (error) {
        console.error("Error adding skill:", error)
        setError("Failed to add skill")
      }
    }
  }

  const deleteSkill = async (id) => {
    try {
      setError("")
      await api.delete(`/skills/${id}`)
      setSkills(skills.filter((s) => s._id !== id))
    } catch (error) {
      console.error("Error deleting skill:", error)
      setError("Failed to delete skill")
    }
  }

  const updateSkillLevel = async (id, level) => {
    try {
      setError("")
      await api.put(`/skills/${id}`, { currentLevel: level })
      const updated = skills.map((s) => (s._id === id ? { ...s, currentLevel: level } : s))
      setSkills(updated)
    } catch (error) {
      console.error("Error updating skill:", error)
      setError("Failed to update skill")
    }
  }

  const addContent = async () => {
    if (newContent.title.trim() && newContent.skillId) {
      try {
        setError("")
        const contentData = {
          ...newContent,
          thumbnail: newContent.type === "youtube" && newContent.url ? getYouTubeThumbnail(newContent.url) : null,
        }

        const content = await api.post("/contents", contentData)
        setContents([...contents, content])
        setNewContent({ title: "", creator: "", type: "youtube", skillId: "", url: "", status: "to-watch" })
      } catch (error) {
        console.error("Error adding content:", error)
        setError("Failed to add content")
      }
    }
  }

  const deleteContent = async (id) => {
    try {
      setError("")
      await api.delete(`/contents/${id}`)
      setContents(contents.filter((c) => c._id !== id))
    } catch (error) {
      console.error("Error deleting content:", error)
      setError("Failed to delete content")
    }
  }

  const updateContentStatus = async (id, status) => {
    try {
      setError("")
      await api.put(`/contents/${id}`, { status })
      const updated = contents.map((c) => (c._id === id ? { ...c, status } : c))
      setContents(updated)
    } catch (error) {
      console.error("Error updating content:", error)
      setError("Failed to update content")
    }
  }

  const addSession = async () => {
    if (newSession.contentId && newSession.date && newSession.duration) {
      try {
        setError("")
        const session = await api.post("/sessions", newSession)
        setSessions([...sessions, session])
        setNewSession({ contentId: "", date: "", duration: "", notes: "" })
      } catch (error) {
        console.error("Error adding session:", error)
        setError("Failed to add session")
      }
    }
  }

  const deleteSession = async (id) => {
    try {
      setError("")
      await api.delete(`/sessions/${id}`)
      setSessions(sessions.filter((s) => s._id !== id))
    } catch (error) {
      console.error("Error deleting session:", error)
      setError("Failed to delete session")
    }
  }

  const getSkillProgress = (skillId) => {
    const skillContents = contents.filter((c) => c.skillId === skillId)
    const completed = skillContents.filter((c) => c.status === "completed").length
    const total = skillContents.length
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }

  const getSkillSessions = (skillId) => {
    const skillContents = contents.filter((c) => c.skillId === skillId).map((c) => c._id)
    return sessions.filter((s) => skillContents.includes(s.contentId))
  }

  const getTotalLearningTime = (skillId) => {
    const skillSessions = getSkillSessions(skillId)
    return skillSessions.reduce((total, s) => total + Number.parseInt(s.duration || 0), 0)
  }

  const levels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Expert"]
  const categories = ["Programming", "Design", "Language", "Business", "Creative", "Science", "Other"]

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
              <Book className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Content Learning Tracker</h1>
            <p className="text-gray-600">Track your learning journey</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && (isRegistering ? handleRegister() : handleLogin())}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && (isRegistering ? handleRegister() : handleLogin())}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />

            {isRegistering ? (
              <>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
                <button
                  onClick={() => setIsRegistering(false)}
                  disabled={loading}
                  className="w-full text-gray-600 py-2 hover:text-gray-800 disabled:opacity-50"
                >
                  Already have an account? Login
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <button
                  onClick={() => setIsRegistering(true)}
                  disabled={loading}
                  className="w-full text-gray-600 py-2 hover:text-gray-800 disabled:opacity-50"
                >
                  Don't have an account? Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                Content Learning Tracker
              </h1>
              <p className="text-gray-600">Track skills, educational content, and measure your learning progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-lg">
                <User size={20} className="text-indigo-600" />
                <span className="font-semibold text-indigo-800">{currentUser.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("skills")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "skills" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Target size={20} />
            Skills ({skills.length})
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "content" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Book size={20} />
            Content ({contents.length})
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "sessions"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <TrendingUp size={20} />
            Sessions ({sessions.length})
          </button>
        </div>

        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Skill</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={newSkill.currentLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, currentLevel: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Current: {lvl}
                    </option>
                  ))}
                </select>
                <select
                  value={newSkill.targetLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, targetLevel: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Target: {lvl}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addSkill}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={20} />
                  Add Skill
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill) => {
                const progress = getSkillProgress(skill._id)
                const totalTime = getTotalLearningTime(skill._id)
                const sessionsCount = getSkillSessions(skill._id).length

                return (
                  <div key={skill._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{skill.name}</h3>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mt-2">
                          {skill.category}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSkill(skill._id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Current: {skill.currentLevel}</span>
                        <span>Target: {skill.targetLevel}</span>
                      </div>
                      <select
                        value={skill.currentLevel}
                        onChange={(e) => updateSkillLevel(skill._id, e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {levels.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Content Progress</span>
                        <span>
                          {progress.completed}/{progress.total} completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {totalTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={16} />
                        {sessionsCount} sessions
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Creator/Channel"
                  value={newContent.creator}
                  onChange={(e) => setNewContent({ ...newContent, creator: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newContent.type}
                  onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="youtube">YouTube</option>
                  <option value="podcast">Podcast</option>
                  <option value="course">Online Course</option>
                  <option value="article">Article</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newContent.skillId}
                  onChange={(e) => setNewContent({ ...newContent, skillId: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select skill</option>
                  {skills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="URL (required for YouTube thumbnails)"
                  value={newContent.url}
                  onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addContent}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={20} />
                  Add Content
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => {
                const skill = skills.find((s) => s._id === content.skillId)
                const contentSessions = sessions.filter((s) => s.contentId === content._id)

                return (
                  <div
                    key={content._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                  >
                    {content.thumbnail ? (
                      <div className="relative">
                        <img
                          src={content.thumbnail || "/placeholder.svg"}
                          alt={content.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.style.display = "none"
                          }}
                        />
                        <div className="absolute top-2 right-2 p-2 bg-black bg-opacity-70 rounded-lg">
                          {content.type === "youtube" && <Youtube className="text-red-500" size={20} />}
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        {content.type === "youtube" && <Youtube className="text-white" size={48} />}
                        {content.type === "podcast" && <Mic className="text-white" size={48} />}
                        {content.type === "course" && <Book className="text-white" size={48} />}
                        {content.type === "article" && <Book className="text-white" size={48} />}
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{content.title}</h3>
                        <button
                          onClick={() => deleteContent(content._id)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">by {content.creator}</p>

                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {skill?.name || "No skill"}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {contentSessions.length} sessions
                        </span>
                      </div>

                      <select
                        value={content.status}
                        onChange={(e) => updateContentStatus(content._id, e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mb-2 disabled:opacity-50"
                      >
                        <option value="to-watch">To Watch</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      {content.url && (
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
                        >
                          Open link →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Log Learning Session</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select
                  value={newSession.contentId}
                  onChange={(e) => setNewSession({ ...newSession, contentId: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select content</option>
                  {contents.map((content) => (
                    <option key={content._id} value={content._id}>
                      {content.title} ({skills.find((s) => s._id === content.skillId)?.name})
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <textarea
                placeholder="Key takeaways and notes..."
                value={newSession.notes}
                onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                rows="3"
              />
              <button
                onClick={addSession}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={20} />
                Log Session
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => {
                const content = contents.find((c) => c._id === session.contentId)
                const skill = skills.find((s) => s._id === content?.skillId)

                return (
                  <div key={session._id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{content?.title || "Unknown content"}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                            {skill?.name || "No skill"}
                          </span>
                          <span className="text-gray-600 text-sm">{session.date}</span>
                          <span className="text-gray-600 text-sm">• {session.duration} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSession(session._id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {session.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{session.notes}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
