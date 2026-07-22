'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { MessageCircle, X, Send, User, Bot, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
}

interface ChatWidgetProps {
  onClose?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose: _onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis l\'assistant OneFive. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      timestamp: new Date(),
      status: 'delivered'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();

    // Vrai canal de support : on ouvre un email pré-rempli vers l'équipe
    // (pas de bot simulé). Fait dans le geste utilisateur pour éviter le blocage.
    try {
      window.location.href = `mailto:support@onefive.app?subject=${encodeURIComponent(
        'Support OneFive',
      )}&body=${encodeURIComponent(text)}`;
    } catch {
      /* mailto indisponible */
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg,
        ),
        {
          id: (Date.now() + 1).toString(),
          text: "Merci ! On a ouvert un email pré-rempli vers support@onefive.app — envoie-le et notre équipe te répond sous 24h.",
          isUser: false,
          timestamp: new Date(),
          status: 'delivered' as const,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              color="primary"
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-[#5E6AD2] hover:bg-[#5E6AD2]/90 shadow-lg relative"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96"
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-[#5E6AD2] to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">Support OneFive</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        Réponse sous 24h
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      color="tertiary"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="h-8 w-8 text-white hover:bg-white/20"
                      iconLeading={isMinimized ? <Maximize2 data-icon /> : <Minimize2 data-icon />}
                    />
                    <Button
                      color="tertiary"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-white hover:bg-white/20"
                      iconLeading={<X data-icon />}
                    />
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="h-96 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-end gap-2 max-w-[75%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                {message.isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                              </div>
                              <div className={`px-3 py-2 rounded-lg ${
                                message.isUser 
                                  ? 'bg-[#5E6AD2] text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.text}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className={`text-xs ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {message.isUser && message.status === 'sending' && (
                                    <div className="h-2 w-2 bg-white/50 rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* Typing indicator */}
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="flex items-end gap-2">
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <Bot className="h-3 w-3" />
                              </div>
                              <div className="px-3 py-2 rounded-lg bg-gray-100">
                                <div className="flex gap-1">
                                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Input */}
                      <div className="border-t p-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tapez votre message..."
                            value={inputMessage}
                            onChange={setInputMessage}
                            onKeyDown={handleKeyPress}
                            className="flex-1"
                          />
                          <Button
                            color="primary"
                            onClick={handleSendMessage}
                            isDisabled={!inputMessage.trim()}
                            className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
                            iconLeading={<Send data-icon />}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget; 