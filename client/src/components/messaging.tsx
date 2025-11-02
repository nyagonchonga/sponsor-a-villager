import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Users } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  villagerId: string;
  createdAt: string;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    role: string;
  };
  receiver: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    role: string;
  };
}

interface MessagingProps {
  villagerId: string;
}

export default function Messaging({ villagerId }: MessagingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages", villagerId],
    enabled: !!villagerId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      await apiRequest("POST", "/api/messages", {
        content,
        receiverId: "placeholder", // This would need to be determined based on conversation
        villagerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", villagerId] });
      setMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log("WebSocket connected for messaging");
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat' && data.villagerId === villagerId) {
          // Invalidate messages to fetch latest
          queryClient.invalidateQueries({ queryKey: ["/api/messages", villagerId] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, [villagerId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(message.trim());

    // Send real-time message via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat',
        villagerId,
        content: message.trim(),
        senderId: user?.id,
      }));
    }
  };

  const getDisplayName = (user: Message['sender'] | Message['receiver']) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email?.split('@')[0] || 'Anonymous';
  };

  const getInitials = (user: Message['sender'] | Message['receiver']) => {
    const name = getDisplayName(user);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-600">Please log in to send messages.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96" data-testid="messaging-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Messages
          {ws && (
            <div className="ml-auto flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Connected
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef} data-testid="messages-scroll-area">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg: Message) => {
                const isCurrentUser = msg.senderId === user.id;
                const displayUser = isCurrentUser ? msg.receiver : msg.sender;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <Avatar className="w-8 h-8" data-testid={`avatar-${msg.id}`}>
                      <AvatarImage src={displayUser.profileImageUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(displayUser)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-xs ${isCurrentUser ? 'text-right' : ''}`}>
                      <div className={`rounded-lg px-3 py-2 ${
                        isCurrentUser 
                          ? 'bg-kenya-red text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm" data-testid={`message-content-${msg.id}`}>
                          {msg.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1" data-testid={`message-time-${msg.id}`}>
                        {format(new Date(msg.createdAt), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2" data-testid="message-form">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
              data-testid="input-message"
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-kenya-red hover:bg-red-700"
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
