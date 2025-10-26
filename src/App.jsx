import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Youtube, Mic, Book, TrendingUp, Clock, Target, LogOut, User } from 'lucide-react';

export default function ContentLearningTracker() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [skills, setSkills] = useState([]);
  const [contents, setContents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('skills');
  const [newSkill, setNewSkill] = useState({ name: '', category: '', targetLevel: 'Intermediate', currentLevel: 'Beginner' });
  const [newContent, setNewContent] = useState({ title: '', creator: '', type: 'youtube', skillId: '', url: '', status: 'to-watch' });
  const [newSession, setNewSession] = useState({ contentId: '', date: '', duration: '', notes: '' });

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const checkLoggedInUser = () => {
    try {
      const userData = localStorage.getItem('current-user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('No user logged in');
    }
  };

  const loadUserData = () => {
    if (!currentUser) return;
    
    try {
      const skillsData = localStorage.getItem(`skills-${currentUser.username}`);
      const contentsData = localStorage.getItem(`contents-${currentUser.username}`);
      const sessionsData = localStorage.getItem(`sessions-${currentUser.username}`);
      
      if (skillsData) setSkills(JSON.parse(skillsData));
      if (contentsData) setContents(JSON.parse(contentsData));
      if (sessionsData) setSessions(JSON.parse(sessionsData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = (type, data) => {
    if (!currentUser) return;
    
    try {
      localStorage.setItem(`${type}-${currentUser.username}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleLogin = () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      alert('Please enter username and password');
      return;
    }

    try {
      const userKey = `user-${loginForm.username}`;
      const userData = localStorage.getItem(userKey);
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user.password === loginForm.password) {
          const currentUserData = { username: loginForm.username };
          setCurrentUser(currentUserData);
          localStorage.setItem('current-user', JSON.stringify(currentUserData));
          setLoginForm({ username: '', password: '' });
        } else {
          alert('Invalid password');
        }
      } else {
        alert('User not found. Please register.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleRegister = () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      alert('Please enter username and password');
      return;
    }

    try {
      const userKey = `user-${loginForm.username}`;
      const existing = localStorage.getItem(userKey);
      
      if (existing) {
        alert('Username already exists');
        return;
      }

      localStorage.setItem(userKey, JSON.stringify({
        username: loginForm.username,
        password: loginForm.password,
        createdAt: new Date().toISOString()
      }));

      const user = { username: loginForm.username };
      setCurrentUser(user);
      localStorage.setItem('current-user', JSON.stringify(user));
      setLoginForm({ username: '', password: '' });
      setIsRegistering(false);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('current-user');
      setCurrentUser(null);
      setSkills([]);
      setContents([]);
      setSessions([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getYouTubeThumbnail = (url) => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill = { ...newSkill, id: Date.now().toString(), createdAt: new Date().toISOString() };
      const updated = [...skills, skill];
      setSkills(updated);
      saveData('skills', updated);
      setNewSkill({ name: '', category: '', targetLevel: 'Intermediate', currentLevel: 'Beginner' });
    }
  };

  const deleteSkill = (id) => {
    const updated = skills.filter(s => s.id !== id);
    setSkills(updated);
    saveData('skills', updated);
  };

  const updateSkillLevel = (id, level) => {
    const updated = skills.map(s => s.id === id ? { ...s, currentLevel: level } : s);
    setSkills(updated);
    saveData('skills', updated);
  };

  const addContent = () => {
    if (newContent.title.trim() && newContent.skillId) {
      const content = { 
        ...newContent, 
        id: Date.now().toString(), 
        addedAt: new Date().toISOString(),
        thumbnail: newContent.type === 'youtube' && newContent.url ? getYouTubeThumbnail(newContent.url) : null
      };
      const updated = [...contents, content];
      setContents(updated);
      saveData('contents', updated);
      setNewContent({ title: '', creator: '', type: 'youtube', skillId: '', url: '', status: 'to-watch' });
    }
  };

  const deleteContent = (id) => {
    const updated = contents.filter(c => c.id !== id);
    setContents(updated);
    saveData('contents', updated);
  };

  const updateContentStatus = (id, status) => {
    const updated = contents.map(c => c.id === id ? { ...c, status } : c);
    setContents(updated);
    saveData('contents', updated);
  };

  const addSession = () => {
    if (newSession.contentId && newSession.date && newSession.duration) {
      const session = { ...newSession, id: Date.now().toString() };
      const updated = [...sessions, session];
      setSessions(updated);
      saveData('sessions', updated);
      setNewSession({ contentId: '', date: '', duration: '', notes: '' });
    }
  };

  const deleteSession = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveData('sessions', updated);
  };

  const getSkillProgress = (skillId) => {
    const skillContents = contents.filter(c => c.skillId === skillId);
    const completed = skillContents.filter(c => c.status === 'completed').length;
    const total = skillContents.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const getSkillSessions = (skillId) => {
    const skillContents = contents.filter(c => c.skillId === skillId).map(c => c.id);
    return sessions.filter(s => skillContents.includes(s.contentId));
  };

  const getTotalLearningTime = (skillId) => {
    const skillSessions = getSkillSessions(skillId);
    return skillSessions.reduce((total, s) => total + parseInt(s.duration || 0), 0);
  };

  const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
  const categories = ['Programming', 'Design', 'Language', 'Business', 'Creative', 'Science', 'Other'];

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

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            {isRegistering ? (
              <>
                <button
                  onClick={handleRegister}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Create Account
                </button>
                <button
                  onClick={() => setIsRegistering(false)}
                  className="w-full text-gray-600 py-2 hover:text-gray-800"
                >
                  Already have an account? Login
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsRegistering(true)}
                  className="w-full text-gray-600 py-2 hover:text-gray-800"
                >
                  Don't have an account? Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
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
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'skills' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Target size={20} />
            Skills ({skills.length})
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Book size={20} />
            Content ({contents.length})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'sessions' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp size={20} />
            Sessions ({sessions.length})
          </button>
        </div>

        {activeTab === 'skills' && (
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
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select
                  value={newSkill.currentLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, currentLevel: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {levels.map(lvl => <option key={lvl} value={lvl}>Current: {lvl}</option>)}
                </select>
                <select
                  value={newSkill.targetLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, targetLevel: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {levels.map(lvl => <option key={lvl} value={lvl}>Target: {lvl}</option>)}
                </select>
                <button
                  onClick={addSkill}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Skill
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map(skill => {
                const progress = getSkillProgress(skill.id);
                const totalTime = getTotalLearningTime(skill.id);
                const sessionsCount = getSkillSessions(skill.id).length;
                
                return (
                  <div key={skill.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{skill.name}</h3>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mt-2">
                          {skill.category}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="text-red-500 hover:text-red-700 p-2"
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
                        onChange={(e) => updateSkillLevel(skill.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Content Progress</span>
                        <span>{progress.completed}/{progress.total} completed</span>
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
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
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
                  {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
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
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Content
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map(content => {
                const skill = skills.find(s => s.id === content.skillId);
                const contentSessions = sessions.filter(s => s.contentId === content.id);
                
                return (
                  <div key={content.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                    {content.thumbnail ? (
                      <div className="relative">
                        <img 
                          src={content.thumbnail} 
                          alt={content.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2 p-2 bg-black bg-opacity-70 rounded-lg">
                          {content.type === 'youtube' && <Youtube className="text-red-500" size={20} />}
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        {content.type === 'youtube' && <Youtube className="text-white" size={48} />}
                        {content.type === 'podcast' && <Mic className="text-white" size={48} />}
                        {content.type === 'course' && <Book className="text-white" size={48} />}
                        {content.type === 'article' && <Book className="text-white" size={48} />}
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{content.title}</h3>
                        <button
                          onClick={() => deleteContent(content.id)}
                          className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">by {content.creator}</p>
                      
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {skill?.name || 'No skill'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {contentSessions.length} sessions
                        </span>
                      </div>
                      
                      <select
                        value={content.status}
                        onChange={(e) => updateContentStatus(content.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mb-2"
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
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
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
                  {contents.map(content => (
                    <option key={content.id} value={content.id}>
                      {content.title} ({skills.find(s => s.id === content.skillId)?.name})
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Log Session
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sessions.map(session => {
                const content = contents.find(c => c.id === session.contentId);
                const skill = skills.find(s => s.id === content?.skillId);
                
                return (
                  <div key={session.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{content?.title || 'Unknown content'}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                            {skill?.name || 'No skill'}
                          </span>
                          <span className="text-gray-600 text-sm">{session.date}</span>
                          <span className="text-gray-600 text-sm">• {session.duration} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="text-red-500 hover:text-red-700 p-2"
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
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}