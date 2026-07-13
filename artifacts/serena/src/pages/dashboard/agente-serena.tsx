import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Send, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentChatInputMessagesItem, AgentChatInputMessagesItemRole, getAgentChatUrl } from '@workspace/api-client-react';

export default function AgenteSerena() {
  const [messages, setMessages] = useState<AgentChatInputMessagesItem[]>([
    { role: 'assistant', content: 'Hola. Soy Serena, tu asistente de operaciones institucionales. ¿En qué puedo asistirte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: AgentChatInputMessagesItem = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    const payload = { messages: [...messages, userMessage] };

    try {
      // Usar fetch directo para soportar SSE (Server-Sent Events)
      const response = await fetch(getAgentChatUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessageContent += parsed.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = assistantMessageContent;
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE json', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming chat:', error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = 'Ocurrió un error al procesar la solicitud.';
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Card className="border-border h-[calc(100vh-140px)] flex flex-col shadow-sm">
      <CardHeader className="py-4 border-b border-border/50 shrink-0 bg-card">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-gold" />
          Agente Operativo Serena
        </CardTitle>
        <CardDescription>
          Asistente de inteligencia artificial entrenado en protocolos funerarios institucionales.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative bg-muted/10">
        <ScrollArea className="h-full px-6 py-6" ref={scrollRef}>
          <div className="space-y-6 max-w-3xl mx-auto pb-4">
            {messages.map((msg, index) => {
              if (msg.role === 'system') return null;
              const isUser = msg.role === 'user';
              
              return (
                <div key={index} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm border border-brand-gold/30">
                      <Bot className="w-4 h-4 text-brand-gold" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm' 
                      : 'bg-card border border-border shadow-sm rounded-tl-sm text-card-foreground'
                  }`}>
                    {msg.content ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="flex gap-1 items-center h-5">
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-border shrink-0 bg-card">
        <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto gap-3 relative">
          <Input 
            placeholder="Consulte protocolos, pida redactar un obituario o verificar procedimientos..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-background pr-12 focus-visible:ring-brand-gold"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isStreaming}
            className="absolute right-1 top-1 h-8 w-8 bg-brand-gold hover:bg-brand-gold/90 text-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
