/**
 * ============================================================================
 * ORUS BUILDER - CHAT COMPONENT
 * ============================================================================
 *
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-10T09:44:00-03:00
 * COMPONENT_HASH: orus.frontend.component.chat.20261007.v2
 *
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: WorkspaceCommunicationAgent
 * - COGNITIVE_LEVEL: Intermediate
 * - AUTONOMY_DEGREE: 78
 * - TRINITY_INTEGRATED: None
 * ============================================================================
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@components/common/Button';
import collaborationService, {
  type CollaborationMessage,
  type CollaborationSession,
} from '@services/collaboration.service';

export interface ChatProps {
  channelId: string;
  userId: string;
  userName?: string;
  projectId?: string;
  maxHeight?: string;
}

export const Chat: React.FC<ChatProps> = ({
  userId,
  projectId,
  maxHeight = '600px',
}) => {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (sessionId: string) => {
    const next = await collaborationService.getMessages(sessionId);
    setMessages(next);
  }, []);

  useEffect(() => {
    let active = true;
    if (!projectId) {
      setError('Projeto não disponível para o chat.');
      setIsLoading(false);
      return () => { active = false; };
    }
    void collaborationService.ensureSession(projectId)
      .then(async nextSession => {
        if (!active) return;
        setSession(nextSession);
        await collaborationService.updatePresence(nextSession.sessionId, 'active');
        if (active) await loadMessages(nextSession.sessionId);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar as mensagens do projeto.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [loadMessages, projectId]);

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => {
      void Promise.all([
        loadMessages(session.sessionId),
        collaborationService.getSession(session.sessionId).then(setSession),
      ]).catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadMessages, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || !session || isSending) return;
    setIsSending(true);
    setError('');
    try {
      const message = await collaborationService.sendMessage(session.sessionId, content);
      setMessages(current => current.some(item => item.messageId === message.messageId) ? current : [...current, message]);
      setInputValue('');
    } catch {
      setError('A mensagem não foi enviada. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-primary/20 bg-background-surface">
      <div className="flex items-center justify-between border-b border-primary/20 bg-background-elevated px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Decisões do projeto</h3>
          <p className="text-xs text-foreground-muted">
            {session ? `${session.participants.length} participante${session.participants.length === 1 ? '' : 's'}` : 'Conectando ao workspace'}
          </p>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${session ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight }}>
        {isLoading && (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!isLoading && messages.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-primary/20 p-5 text-center text-sm text-foreground-muted">
            Registre aqui decisões, pendências e contexto para manter o projeto rastreável.
          </div>
        )}
        {messages.map(message => (
          <motion.div
            key={message.messageId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.userId === userId ? 'flex-row-reverse' : ''}`}
          >
            <Avatar name={message.username} size="sm" />
            <div className={`max-w-[78%] ${message.userId === userId ? 'text-right' : ''}`}>
              <div className="mb-1 flex items-center gap-2 text-xs text-foreground-muted">
                <span className="font-medium text-foreground">{message.username}</span>
                <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
              </div>
              <div className="whitespace-pre-wrap rounded-2xl bg-background-elevated px-3 py-2 text-left text-sm text-foreground">
                {message.message}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 text-xs text-red-300">{error}</p>}
      <div className="border-t border-primary/20 bg-background p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={event => setInputValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSendMessage();
              }
            }}
            placeholder="Registre uma decisão ou mensagem..."
            className="max-h-28 min-h-11 flex-1 resize-none rounded-lg border border-primary/20 bg-background-elevated px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground-muted focus:border-primary"
            rows={1}
            disabled={!session || isSending}
          />
          <Button
            onClick={() => void handleSendMessage()}
            disabled={!session || !inputValue.trim() || isSending}
            size="sm"
            leftIcon={isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};
