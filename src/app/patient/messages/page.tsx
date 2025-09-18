'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Send,
  Search,
  Paperclip,
  User,
  Stethoscope,
  Calendar,
  CheckCheck,
  Check,
  AlertCircle,
  Star,
} from 'lucide-react';
import { DemoDisclaimer } from '@/components/DemoDisclaimer';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'patient' | 'provider';
  read: boolean;
  delivered: boolean;
}

interface Conversation {
  id: string;
  provider: {
    name: string;
    role: string;
    avatar?: string;
    department: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isUrgent: boolean;
  isStarred: boolean;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    provider: {
      name: 'Dr. Sarah Johnson',
      role: 'Primary Physician',
      department: 'Internal Medicine'
    },
    lastMessage: 'Your test results look good. Continue with the current medication.',
    lastMessageTime: '2024-01-18T10:30:00',
    unreadCount: 1,
    isUrgent: false,
    isStarred: true,
    messages: [
      {
        id: 'm1',
        content: 'Good morning! I wanted to check in on how you\'re feeling today with the new medication.',
        timestamp: '2024-01-18T09:00:00',
        sender: 'provider',
        read: true,
        delivered: true
      },
      {
        id: 'm2',
        content: 'Hi Dr. Johnson, I\'m feeling much better. The coughing has reduced significantly and I can breathe easier.',
        timestamp: '2024-01-18T09:45:00',
        sender: 'patient',
        read: true,
        delivered: true
      },
      {
        id: 'm3',
        content: 'That\'s excellent to hear! Your test results also came back this morning.',
        timestamp: '2024-01-18T10:15:00',
        sender: 'provider',
        read: true,
        delivered: true
      },
      {
        id: 'm4',
        content: 'Your test results look good. Continue with the current medication. We\'ll reassess at your follow-up appointment next week.',
        timestamp: '2024-01-18T10:30:00',
        sender: 'provider',
        read: false,
        delivered: true
      }
    ]
  },
  {
    id: '2',
    provider: {
      name: 'Dr. Emily Rodriguez',
      role: 'Pulmonologist',
      department: 'Pulmonology'
    },
    lastMessage: 'Please schedule a follow-up appointment for next week.',
    lastMessageTime: '2024-01-17T15:45:00',
    unreadCount: 0,
    isUrgent: true,
    isStarred: false,
    messages: [
      {
        id: 'm5',
        content: 'I\'ve reviewed your chest X-ray and spirometry results.',
        timestamp: '2024-01-17T15:30:00',
        sender: 'provider',
        read: true,
        delivered: true
      },
      {
        id: 'm6',
        content: 'The good news is that your lung function is improving. The mild obstruction we noticed is responding well to treatment.',
        timestamp: '2024-01-17T15:35:00',
        sender: 'provider',
        read: true,
        delivered: true
      },
      {
        id: 'm7',
        content: 'That\'s great news! Should I continue with the breathing exercises?',
        timestamp: '2024-01-17T15:40:00',
        sender: 'patient',
        read: true,
        delivered: true
      },
      {
        id: 'm8',
        content: 'Yes, definitely continue with the exercises. Please schedule a follow-up appointment for next week so we can monitor your progress.',
        timestamp: '2024-01-17T15:45:00',
        sender: 'provider',
        read: true,
        delivered: true
      }
    ]
  },
  {
    id: '3',
    provider: {
      name: 'Nurse Patricia Davis',
      role: 'Care Coordinator',
      department: 'Nursing'
    },
    lastMessage: 'Your discharge paperwork is ready for review.',
    lastMessageTime: '2024-01-18T08:00:00',
    unreadCount: 2,
    isUrgent: false,
    isStarred: false,
    messages: [
      {
        id: 'm9',
        content: 'Good morning! I hope you\'re feeling better today.',
        timestamp: '2024-01-18T07:45:00',
        sender: 'provider',
        read: false,
        delivered: true
      },
      {
        id: 'm10',
        content: 'Your discharge paperwork is ready for review. I\'ll stop by your room this afternoon to go over everything.',
        timestamp: '2024-01-18T08:00:00',
        sender: 'provider',
        read: false,
        delivered: true
      }
    ]
  },
  {
    id: '4',
    provider: {
      name: 'Dr. Michael Chen',
      role: 'Radiologist',
      department: 'Radiology'
    },
    lastMessage: 'Your X-ray results have been sent to Dr. Johnson.',
    lastMessageTime: '2024-01-17T11:20:00',
    unreadCount: 0,
    isUrgent: false,
    isStarred: false,
    messages: [
      {
        id: 'm11',
        content: 'I\'ve completed the review of your chest X-ray from this morning.',
        timestamp: '2024-01-17T11:00:00',
        sender: 'provider',
        read: true,
        delivered: true
      },
      {
        id: 'm12',
        content: 'The infiltrates in your lower lobes are consistent with bronchitis, as Dr. Johnson suspected.',
        timestamp: '2024-01-17T11:10:00',
        sender: 'provider',
        read: true,
        delivered: true
      },
      {
        id: 'm13',
        content: 'Thank you for the quick review, Dr. Chen.',
        timestamp: '2024-01-17T11:15:00',
        sender: 'patient',
        read: true,
        delivered: true
      },
      {
        id: 'm14',
        content: 'Your X-ray results have been sent to Dr. Johnson. She\'ll discuss the treatment plan with you.',
        timestamp: '2024-01-17T11:20:00',
        sender: 'provider',
        read: true,
        delivered: true
      }
    ]
  },
  {
    id: '5',
    provider: {
      name: 'Pharmacy Team',
      role: 'Hospital Pharmacy',
      department: 'Pharmacy'
    },
    lastMessage: 'Your medications are ready for pickup.',
    lastMessageTime: '2024-01-16T14:00:00',
    unreadCount: 0,
    isUrgent: false,
    isStarred: false,
    messages: [
      {
        id: 'm15',
        content: 'Your prescription for Amoxicillin has been filled.',
        timestamp: '2024-01-16T13:45:00',
        sender: 'provider',
        read: true,
        delivered: true
      },
      {
        id: 'm16',
        content: 'Your medications are ready for pickup at the hospital pharmacy.',
        timestamp: '2024-01-16T14:00:00',
        sender: 'provider',
        read: true,
        delivered: true
      }
    ]
  }
];

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'starred'>('all');

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    switch (filter) {
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'urgent':
        return matchesSearch && conv.isUrgent;
      case 'starred':
        return matchesSearch && conv.isStarred;
      default:
        return matchesSearch;
    }
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTotalUnread = () => mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    // In a real app, this would send to the backend
    setMessageInput('');
  };

  const getProviderIcon = (role: string) => {
    if (role.toLowerCase().includes('physician') || role.toLowerCase().includes('doctor')) {
      return <Stethoscope className="h-4 w-4" />;
    }
    return <User className="h-4 w-4" />;
  };

  return (
    <div>
      <DemoDisclaimer />
      <div className="container mx-auto p-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="w-1/3 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Messages</CardTitle>
                  {getTotalUnread() > 0 && (
                    <Badge variant="destructive">{getTotalUnread()} new</Badge>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {(['all', 'unread', 'urgent', 'starred'] as const).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(f)}
                    >
                      {f === 'starred' && <Star className="h-3 w-3 mr-1" />}
                      {f === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="bg-primary/10 rounded-full p-2">
                            {getProviderIcon(conversation.provider.role)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {conversation.provider.name}
                              </h3>
                              {conversation.isStarred && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                              {conversation.isUrgent && (
                                <Badge variant="destructive" className="text-xs">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{conversation.provider.role}</p>
                            <p className="text-sm mt-1 line-clamp-1">{conversation.lastMessage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessageTime)}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="mt-1">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <Card className="flex-1 flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        {getProviderIcon(selectedConversation.provider.role)}
                      </div>
                      <div>
                        <h2 className="font-semibold">{selectedConversation.provider.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.provider.role} • {selectedConversation.provider.department}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Conversation started {new Date(selectedConversation.messages[0].timestamp).toLocaleDateString()}
                    </Badge>
                  </div>

                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'patient'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          message.sender === 'patient' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'patient' && (
                            message.read ? (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            ) : message.delivered ? (
                              <Check className="h-3 w-3 opacity-70" />
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Messages are secure and HIPAA compliant
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a conversation to view messages</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}