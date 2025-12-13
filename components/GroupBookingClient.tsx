'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { formatDateTime } from '@/lib/dateUtils'

type Group = {
  id: string
  name: string
  createdBy: string
  showtimeId: string
  status: string
  creatorName?: string
  memberCount?: number
  joinToken?: string
}

type Member = {
  id: string
  userId: string
  userName: string
  userEmail: string
}

type Message = {
  id: string
  message: string
  userName: string
  userEmail: string
  createdAt: string
}

type Poll = {
  id: string
  question: string
  options: Array<{ id: string; text: string; votes: number }>
  creatorName: string
  status: string
  userVote?: string
}

type Props = {
  showtimeId: string
  movieTitle: string
  showtime: string
}

export default function GroupBookingClient({ showtimeId, movieTitle, showtime }: Props) {
  const { data: session } = useSession()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch groups
  useEffect(() => {
    fetchGroups()
    const interval = setInterval(fetchGroups, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [showtimeId])

  // Fetch group data when selected
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupData()
      const interval = setInterval(fetchGroupData, 2000) // Poll every 2 seconds for real-time updates
      return () => clearInterval(interval)
    }
  }, [selectedGroup?.id])

  // Auto-scroll messages - DISABLED
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }, [messages])

  const fetchGroups = async () => {
    try {
      const res = await fetch(`/api/groups?showtimeId=${showtimeId}`)
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err)
    }
  }

  const fetchGroupData = async () => {
    if (!selectedGroup) return

    try {
      const [groupRes, messagesRes, pollsRes] = await Promise.all([
        fetch(`/api/groups?groupId=${selectedGroup.id}`),
        fetch(`/api/groups/${selectedGroup.id}/messages`),
        fetch(`/api/groups/${selectedGroup.id}/polls`),
      ])

      if (groupRes.ok) {
        const groupData = await groupRes.json()
        setMembers(groupData.members || [])
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        setMessages(messagesData.messages || [])
      }

      if (pollsRes.ok) {
        const pollsData = await pollsRes.json()
        setPolls(pollsData.polls || [])
      }
    } catch (err) {
      console.error('Failed to fetch group data:', err)
    }
  }

  const createGroup = async () => {
    if (!newGroupName.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim(), showtimeId }),
      })

      if (res.ok) {
        const data = await res.json()
        setSelectedGroup(data.group)
        setShowCreateGroup(false)
        setNewGroupName('')
        fetchGroups()
      }
    } catch (err) {
      console.error('Failed to create group:', err)
    } finally {
      setLoading(false)
    }
  }

  const getJoinLink = (group: Group) => {
    if (!group.joinToken) return ''
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/join/${group.joinToken}`
  }

  const copyJoinLink = async (group: Group) => {
    const link = getJoinLink(group)
    if (!link) {
      // Fallback to group page link if joinToken doesn't exist
      const fallbackLink = `${window.location.origin}/booking/${showtimeId}/group?groupId=${group.id}`
      try {
        await navigator.clipboard.writeText(fallbackLink)
        alert('Group link copied! Share this with your friends.')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
      return
    }
    
    try {
      await navigator.clipboard.writeText(link)
      // Show success notification
      alert('Join link copied to clipboard! Share this link with your friends.')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const joinGroup = async (groupId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' })
      if (res.ok) {
        const groupRes = await fetch(`/api/groups?groupId=${groupId}`)
        if (groupRes.ok) {
          const data = await groupRes.json()
          setSelectedGroup(data.group)
          setMembers(data.members || [])
        }
        fetchGroups()
      }
    } catch (err) {
      console.error('Failed to join group:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return

    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })

      if (res.ok) {
        setNewMessage('')
        fetchGroupData()
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const createPoll = async (question: string, options: string[]) => {
    if (!selectedGroup || !question.trim() || options.length < 2) return

    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), options }),
      })

      if (res.ok) {
        fetchGroupData()
      }
    } catch (err) {
      console.error('Failed to create poll:', err)
    }
  }

  const votePoll = async (pollId: string, optionId: string) => {
    if (!selectedGroup) return

    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      })

      if (res.ok) {
        fetchGroupData()
      }
    } catch (err) {
      console.error('Failed to vote:', err)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-8 text-center">
          <p className="text-gray-400 mb-4">Please log in to use group booking</p>
          <a href="/login" className="text-white underline">Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-clash font-bold text-white mb-2">Group Booking</h1>
          <p className="text-gray-400">{movieTitle} - {formatDateTime(showtime)}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="md:col-span-1">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-clash font-semibold text-white">Groups</h2>
                <motion.button
                  onClick={() => setShowCreateGroup(!showCreateGroup)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm"
                >
                  + Create
                </motion.button>
              </div>

              <AnimatePresence>
                {showCreateGroup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createGroup()}
                      placeholder="Group name..."
                      className="w-full px-4 py-2 glass rounded-lg border border-white/10 focus:border-white/30 focus:outline-none text-white mb-2"
                    />
                    <button
                      onClick={createGroup}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm disabled:opacity-50"
                    >
                      Create
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groups.map((group) => (
                  <motion.div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedGroup?.id === group.id
                        ? 'border-white/50 bg-white/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-clash font-semibold text-white mb-1">{group.name}</div>
                        <div className="text-xs text-gray-400">
                          {group.memberCount || 0} members • {group.creatorName}
                        </div>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (group.joinToken) {
                            copyJoinLink(group)
                          } else {
                            const link = `${window.location.origin}/booking/${showtimeId}/group?groupId=${group.id}`
                            navigator.clipboard.writeText(link).then(() => {
                              alert('Group link copied! Share this with your friends.')
                            })
                          }
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="ml-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        title="Copy invite link"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.316-.79-2-2-2H2v4a2 2 0 002 2h4.684M8.684 13.342l-1.368 1.368M8.684 13.342l1.368-1.368m0 0l1.368-1.368M7.316 14.658l-1.368-1.368m0 0l-1.368 1.368m1.368-1.368l1.368 1.368M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </motion.button>
                    </div>
                    {selectedGroup?.id !== group.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          joinGroup(group.id)
                        }}
                        className="mt-2 text-xs text-white underline"
                      >
                        Join
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat & Polls */}
          {selectedGroup && (
            <div className="md:col-span-2 space-y-6">
              {/* Group Header with Share Link */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-clash font-bold text-white mb-1">{selectedGroup.name}</h2>
                    <p className="text-sm text-gray-400">Created by {selectedGroup.creatorName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedGroup.joinToken ? (
                      <motion.button
                        onClick={() => copyJoinLink(selectedGroup)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.316-.79-2-2-2H2v4a2 2 0 002 2h4.684M8.684 13.342l-1.368 1.368M8.684 13.342l1.368-1.368m0 0l1.368-1.368M7.316 14.658l-1.368-1.368m0 0l-1.368 1.368m1.368-1.368l1.368 1.368M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Invite Friends
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => {
                          const link = `${window.location.origin}/booking/${showtimeId}/group?groupId=${selectedGroup.id}`
                          navigator.clipboard.writeText(link).then(() => {
                            alert('Group link copied! Share this with your friends.')
                          })
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.316-.79-2-2-2H2v4a2 2 0 002 2h4.684M8.684 13.342l-1.368 1.368M8.684 13.342l1.368-1.368m0 0l1.368-1.368M7.316 14.658l-1.368-1.368m0 0l-1.368 1.368m1.368-1.368l1.368 1.368M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Invite Friends
                      </motion.button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{members.length} Members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{messages.length} Messages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>{polls.length} Polls</span>
                  </div>
                </div>
              </div>

              {/* Invite Section */}
              <div className="glass rounded-2xl p-6 border-2 border-white/20">
                <h3 className="text-lg font-clash font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.316-.79-2-2-2H2v4a2 2 0 002 2h4.684M8.684 13.342l-1.368 1.368M8.684 13.342l1.368-1.368m0 0l1.368-1.368M7.316 14.658l-1.368-1.368m0 0l-1.368 1.368m1.368-1.368l1.368 1.368M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Invite Friends
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedGroup.joinToken ? (
                    <>
                      <input
                        type="text"
                        value={getJoinLink(selectedGroup)}
                        readOnly
                        className="flex-1 px-4 py-2 glass rounded-lg border border-white/10 text-white text-sm"
                      />
                      <motion.button
                        onClick={() => copyJoinLink(selectedGroup)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm"
                      >
                        Copy Link
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${showtimeId}/group?groupId=${selectedGroup.id}`}
                        readOnly
                        className="flex-1 px-4 py-2 glass rounded-lg border border-white/10 text-white text-sm"
                      />
                      <motion.button
                        onClick={() => {
                          const link = `${window.location.origin}/booking/${showtimeId}/group?groupId=${selectedGroup.id}`
                          navigator.clipboard.writeText(link).then(() => {
                            alert('Group link copied! Share this with your friends.')
                          })
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-white text-black rounded-lg font-clash font-semibold text-sm"
                      >
                        Copy Link
                      </motion.button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Share this link with friends to invite them to join this group
                </p>
              </div>

              {/* Members */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-clash font-semibold text-white mb-4">Members ({members.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const initials = (member.userName || member.userEmail)
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                    return (
                      <motion.div
                        key={member.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-2 glass rounded-lg text-sm text-white flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-xs">
                          {initials}
                        </div>
                        <span>{member.userName || member.userEmail}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Polls */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-clash font-semibold text-white mb-4">Polls</h3>
                <PollCreator onCreate={createPoll} />
                <div className="space-y-4 mt-4">
                  {polls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} onVote={votePoll} />
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div className="glass rounded-2xl p-6 flex flex-col h-96">
                <h3 className="text-lg font-clash font-semibold text-white mb-4">Live Chat</h3>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <div className="font-semibold text-white text-sm">{msg.userName}:</div>
                      <div className="text-gray-300 text-sm">{msg.message}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 glass rounded-lg border border-white/10 focus:border-white/30 focus:outline-none text-white"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-6 py-2 bg-white text-black rounded-lg font-clash font-semibold"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PollCreator({ onCreate }: { onCreate: (question: string, options: string[]) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  const handleCreate = () => {
    if (question.trim() && options.filter(opt => opt.trim()).length >= 2) {
      onCreate(question, options.filter(opt => opt.trim()))
      setQuestion('')
      setOptions(['', ''])
      setShowForm(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-white underline mb-4"
      >
        + Create Poll
      </button>
    )
  }

  return (
    <div className="mb-4 p-4 glass rounded-lg border border-white/10">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll question..."
        className="w-full px-3 py-2 glass rounded border border-white/10 focus:border-white/30 focus:outline-none text-white mb-2 text-sm"
      />
      {options.map((opt, idx) => (
        <input
          key={idx}
          type="text"
          value={opt}
          onChange={(e) => {
            const newOpts = [...options]
            newOpts[idx] = e.target.value
            setOptions(newOpts)
          }}
          placeholder={`Option ${idx + 1}...`}
          className="w-full px-3 py-2 glass rounded border border-white/10 focus:border-white/30 focus:outline-none text-white mb-2 text-sm"
        />
      ))}
      <div className="flex gap-2">
        <button
          onClick={() => setOptions([...options, ''])}
          className="text-xs text-white underline"
        >
          + Add Option
        </button>
        <button
          onClick={handleCreate}
          className="text-xs text-white underline ml-auto"
        >
          Create
        </button>
        <button
          onClick={() => {
            setShowForm(false)
            setQuestion('')
            setOptions(['', ''])
          }}
          className="text-xs text-gray-400 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function PollCard({ poll, onVote }: { poll: Poll; onVote: (pollId: string, optionId: string) => void }) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0)

  return (
    <div className="p-4 glass rounded-lg border border-white/10">
      <div className="font-clash font-semibold text-white mb-2">{poll.question}</div>
      <div className="space-y-2">
        {poll.options.map((opt) => {
          const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0
          return (
            <button
              key={opt.id}
              onClick={() => onVote(poll.id, opt.id)}
              className="w-full text-left p-2 glass rounded border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white">{opt.text}</span>
                <span className="text-xs text-gray-400">{opt.votes} votes</span>
              </div>
              <div className="h-2 glass rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/30 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
      <div className="text-xs text-gray-400 mt-2">Total: {totalVotes} votes</div>
    </div>
  )
}

