import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am SpringBoot Tutor. Ask me anything about Spring Boot.",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
  if (!question.trim() || loading) return;

  const userQuestion = question;

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: userQuestion,
    },
  ]);

  setQuestion("");
  setLoading(true);

  try {
    const response = await fetch(
      "https://spring-tutor.onrender.com/api/chat/stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    // Empty assistant message
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, {
        stream: true,
      });

      fullText += chunk;

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "assistant",
          content: fullText,
        };

        return updated;
      });
    }
  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Failed to connect to backend. Make sure FastAPI is running.",
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <div className="w-72 border-r border-zinc-800 p-5 flex flex-col">
        <h1 className="text-2xl font-bold">
          SpringBoot Tutor
        </h1>

        <p className="mt-2 text-zinc-400">
          Learn Spring Boot with AI
        </p>

        <button
          className="mt-6 bg-zinc-900 border border-zinc-700 rounded-xl p-3 hover:bg-zinc-800"
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content:
                  "Hello! I am SpringBoot Tutor. Ask me anything about Spring Boot.",
              },
            ])
          }
        >
          + New Chat
        </button>

        <div className="mt-auto text-zinc-500">
          Roushan
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-5 py-3 rounded-2xl whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-900 border border-zinc-700 text-white"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-700 px-5 py-3 rounded-2xl">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              value={question}
              disabled={loading}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Ask anything about Spring Boot..."
              className="
                flex-1
                bg-zinc-900
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                disabled:opacity-50
              "
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="
                bg-blue-600
                hover:bg-blue-700
                px-6
                py-3
                rounded-xl
                text-white
                disabled:opacity-50
              "
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;