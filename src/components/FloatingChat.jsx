// components/FloatingChat.jsx
import React, { useState, useRef, useEffect } from "react";

const FloatingChat = ({
  botId = "ecommerce",
  // apiUrl = "http://localhost:8000",
  apiUrl = "https://chatbot-gateway.onrender.com",
  title = "Shop Assistant",
  welcomeMessage = "Hello! How can I help you with your shopping today? 🛒",
  primaryColor = "#3B82F6",
  userId = null,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: "assistant", content: welcomeMessage, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Responsive styles
  const styles = {
    container: {
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: 9999,
      "@media (min-width: 768px)": {
        bottom: "24px",
        right: "24px",
      },
    },
    floatingButton: {
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      backgroundColor: primaryColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow:
        "0 10px 25px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      transition: "transform 0.2s ease",
      border: "none",
      color: "white",
      "@media (max-width: 640px)": {
        width: "48px",
        height: "48px",
      },
    },
    chatWindow: {
      width: "400px",
      height: "550px",
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      "@media (max-width: 640px)": {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        borderRadius: 0,
      },
      "@media (min-width: 641px) and (max-width: 768px)": {
        width: "380px",
        height: "520px",
      },
    },
    header: {
      backgroundColor: primaryColor,
      padding: "12px 16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "white",
      "@media (max-width: 640px)": {
        padding: "16px",
      },
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    headerIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontWeight: "600",
      fontSize: "16px",
    },
    headerStatus: {
      fontSize: "12px",
      opacity: 0.9,
    },
    closeButton: {
      cursor: "pointer",
      padding: "4px",
      borderRadius: "50%",
      background: "transparent",
      border: "none",
      color: "white",
      "@media (max-width: 640px)": {
        padding: "8px",
      },
    },
    messagesContainer: {
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      backgroundColor: "#f9fafb",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      "@media (max-width: 640px)": {
        padding: "12px",
      },
    },
    userMessage: {
      display: "flex",
      justifyContent: "flex-end",
    },
    assistantMessage: {
      display: "flex",
      justifyContent: "flex-start",
    },
    userBubble: {
      backgroundColor: primaryColor,
      color: "white",
      padding: "8px 16px",
      borderRadius: "16px",
      maxWidth: "80%",
      "@media (max-width: 640px)": {
        maxWidth: "85%",
        padding: "10px 14px",
      },
    },
    assistantBubble: {
      backgroundColor: "white",
      color: "#1f2937",
      padding: "8px 16px",
      borderRadius: "16px",
      maxWidth: "80%",
      boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      "@media (max-width: 640px)": {
        maxWidth: "85%",
        padding: "10px 14px",
      },
    },
    errorBubble: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      padding: "8px 16px",
      borderRadius: "16px",
      maxWidth: "80%",
      "@media (max-width: 640px)": {
        maxWidth: "85%",
        padding: "10px 14px",
      },
    },
    timestamp: {
      fontSize: "10px",
      color: "#9ca3af",
      marginTop: "4px",
    },
    userTimestamp: {
      textAlign: "right",
    },
    assistantTimestamp: {
      textAlign: "left",
    },
    typingIndicator: {
      backgroundColor: "white",
      padding: "8px 16px",
      borderRadius: "16px",
      display: "inline-flex",
      gap: "4px",
      boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
    },
    typingDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "#9ca3af",
      animation: "bounce 1.4s infinite ease-in-out",
    },
    quickSuggestions: {
      borderTop: "1px solid #e5e7eb",
      backgroundColor: "white",
      padding: "8px 16px",
      "@media (max-width: 640px)": {
        padding: "10px 12px",
      },
    },
    suggestionsWrapper: {
      display: "flex",
      gap: "8px",
      overflowX: "auto",
      paddingBottom: "8px",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "thin",
    },
    suggestionButton: {
      whiteSpace: "nowrap",
      padding: "4px 12px",
      borderRadius: "9999px",
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
      fontSize: "12px",
      color: "#4b5563",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      "@media (max-width: 640px)": {
        padding: "6px 14px",
        fontSize: "13px",
      },
    },
    inputArea: {
      borderTop: "1px solid #e5e7eb",
      backgroundColor: "white",
      padding: "16px",
      "@media (max-width: 640px)": {
        padding: "12px",
      },
    },
    inputWrapper: {
      display: "flex",
      gap: "8px",
    },
    textarea: {
      flex: 1,
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "12px",
      fontSize: "14px",
      resize: "none",
      fontFamily: "inherit",
      "@media (max-width: 640px)": {
        fontSize: "16px", // Prevents zoom on iOS
        padding: "10px 12px",
      },
    },
    sendButton: {
      padding: "8px 16px",
      backgroundColor: primaryColor,
      border: "none",
      borderRadius: "12px",
      color: "white",
      cursor: "pointer",
      transition: "opacity 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "@media (max-width: 640px)": {
        padding: "8px 20px",
      },
    },
    footerText: {
      textAlign: "center",
      fontSize: "10px",
      color: "#9ca3af",
      marginTop: "8px",
      "@media (max-width: 640px)": {
        fontSize: "9px",
      },
    },
    badge: {
      position: "absolute",
      top: "-4px",
      right: "-4px",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#ef4444",
      color: "white",
      fontSize: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  // Add keyframe animation to document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }
      
      /* Mobile optimizations */
      @media (max-width: 640px) {
        .floating-chat-container {
          touch-action: pan-y pinch-zoom;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    // Prevent body scroll when chat is open on mobile
    if (isOpen && window.innerWidth <= 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat/${botId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          user_id: userId || localStorage.getItem("userId") || "anonymous",
          conversation_history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);

      if (isOpen) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again or contact support.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Apply responsive styles with media query support
  const getResponsiveStyle = (baseStyle) => {
    const style = { ...baseStyle };
    // Remove media query objects as they can't be applied inline
    delete style["@media (max-width: 640px)"];
    delete style["@media (min-width: 641px) and (max-width: 768px)"];
    delete style["@media (min-width: 768px)"];
    return style;
  };

  return (
    <div
      style={getResponsiveStyle(styles.container)}
      className="floating-chat-container"
    >
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          style={getResponsiveStyle(styles.floatingButton)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {unreadCount > 0 && (
            <span style={getResponsiveStyle(styles.badge)}>{unreadCount}</span>
          )}
        </button>
      )}

      {isOpen && (
        <div style={getResponsiveStyle(styles.chatWindow)}>
          {/* Header */}
          <div style={getResponsiveStyle(styles.header)}>
            <div style={getResponsiveStyle(styles.headerLeft)}>
              <div style={getResponsiveStyle(styles.headerIcon)}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div>
                <div style={getResponsiveStyle(styles.headerTitle)}>
                  {title}
                </div>
                <div style={getResponsiveStyle(styles.headerStatus)}>
                  Online • Usually replies instantly
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={getResponsiveStyle(styles.closeButton)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={getResponsiveStyle(styles.messagesContainer)}>
            {messages.map((message, idx) => (
              <div key={idx}>
                <div
                  style={
                    message.role === "user"
                      ? getResponsiveStyle(styles.userMessage)
                      : getResponsiveStyle(styles.assistantMessage)
                  }
                >
                  <div
                    style={
                      message.isError
                        ? getResponsiveStyle(styles.errorBubble)
                        : message.role === "user"
                          ? getResponsiveStyle(styles.userBubble)
                          : getResponsiveStyle(styles.assistantBubble)
                    }
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.content}
                    </p>
                  </div>
                </div>
                <div
                  style={
                    message.role === "user"
                      ? getResponsiveStyle(styles.userTimestamp)
                      : getResponsiveStyle(styles.assistantTimestamp)
                  }
                >
                  <span style={getResponsiveStyle(styles.timestamp)}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={getResponsiveStyle(styles.assistantMessage)}>
                <div style={getResponsiveStyle(styles.typingIndicator)}>
                  <div
                    style={{
                      ...getResponsiveStyle(styles.typingDot),
                      animationDelay: "0s",
                    }}
                  ></div>
                  <div
                    style={{
                      ...getResponsiveStyle(styles.typingDot),
                      animationDelay: "0.2s",
                    }}
                  ></div>
                  <div
                    style={{
                      ...getResponsiveStyle(styles.typingDot),
                      animationDelay: "0.4s",
                    }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={getResponsiveStyle(styles.quickSuggestions)}>
            <div style={getResponsiveStyle(styles.suggestionsWrapper)}>
              {["Best selling items", "Shipping policy", "Track my order"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    style={getResponsiveStyle(styles.suggestionButton)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Input Area */}
          <div style={getResponsiveStyle(styles.inputArea)}>
            <div style={getResponsiveStyle(styles.inputWrapper)}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={getResponsiveStyle(styles.textarea)}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  ...getResponsiveStyle(styles.sendButton),
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                  cursor:
                    isLoading || !input.trim() ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p style={getResponsiveStyle(styles.footerText)}>
              Powered by AI • Responses are generated automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
