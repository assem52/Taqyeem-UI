import { useEffect, useRef, useState } from 'react';
import { useSendChatMessageMutation } from '../aiApi';

function errorMessage(error, fallback) {
  const value =
    error?.data?.message ??
    error?.data?.errors ??
    error?.error;
  if (Array.isArray(value)) return value.join(' ');
  return value || fallback;
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi — ask me anything about studying, quizzes, or the platform.',
    },
  ]);
  const [sendChat, sendState] = useSendChatMessageMutation();
  const listRef = useRef(null);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const submit = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sendState.isLoading) return;

    const history = messages
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');

    try {
      const result = await sendChat({ message, history }).unwrap();
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: result.answer || 'No response received.' },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: errorMessage(error, 'Sorry — I could not answer right now.'),
        },
      ]);
    }
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <section className="pointer-events-auto border-border bg-surface shadow-soft flex h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-dialog border">
          <header className="border-border flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="font-display text-heading text-base">Taqyem Assistant</p>
              <p className="text-muted text-xs">Ask anything — hidden during graded attempts</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted hover:text-heading rounded-button px-2 py-1 text-sm"
              aria-label="Close assistant"
            >
              Close
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-card px-3 py-2 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-primary text-white ml-auto'
                    : 'bg-background text-body border-border border'
                }`}
              >
                {message.content}
              </div>
            ))}
            {sendState.isLoading ? (
              <p className="text-muted text-xs">Thinking…</p>
            ) : null}
          </div>

          <form onSubmit={submit} className="border-border flex gap-2 border-t p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question…"
              className="border-border bg-background text-heading placeholder:text-muted focus:border-primary focus:ring-primary/20 flex-1 rounded-input border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <button
              type="submit"
              disabled={!input.trim() || sendState.isLoading}
              className="bg-primary hover:bg-primary-hover rounded-button px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto bg-primary hover:bg-primary-hover shadow-soft rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? 'Hide chat' : 'Ask AI'}
      </button>
    </div>
  );
}
