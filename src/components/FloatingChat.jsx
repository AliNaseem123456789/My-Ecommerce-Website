// components/FloatingChat.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Typography,
  Fab,
  Badge,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  Snackbar,
  Zoom,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ChatIcon from "@mui/icons-material/Chat";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
`;

const slideInAnimation = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const FloatingButton = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: 24,
  right: 24,
  backgroundColor: theme.palette.primary.main,
  color: "white",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.1)",
  },
  transition: "transform 0.2s ease",
  zIndex: 1000,
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 24,
  right: 24,
  width: 420,
  height: 600,
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: theme.shadows[10],
  zIndex: 1000,
  animation: `${slideInAnimation} 0.3s ease`,
  [theme.breakpoints.down("sm")]: {
    width: "100vw",
    height: "100vh",
    bottom: 0,
    right: 0,
    borderRadius: 0,
  },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

const MessageBubble = styled(Paper)(({ theme, isuser }) => ({
  padding: theme.spacing(1.5),
  maxWidth: "80%",
  width: "fit-content",
  borderRadius: isuser === "true" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
  backgroundColor: isuser === "true" ? theme.palette.primary.main : "white",
  color: isuser === "true" ? "white" : theme.palette.text.primary,
  animation: `${slideInAnimation} 0.2s ease`,
  boxShadow: theme.shadows[1],
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: "white",
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "flex-end",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: 24,
  },
}));

const RecordingIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.error.light,
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  animation: `${pulseAnimation} 1s infinite`,
}));

const QuickSuggestionButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  textTransform: "none",
  fontSize: "0.75rem",
  padding: "4px 12px",
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
  },
}));

const FloatingChat = ({
  botId = "ecommerce",
  apiUrl = "https://chatbot-gateway-production-208c.up.railway.app",
  title = "Shop Assistant",
  welcomeMessage = "Hello! How can I help you with your shopping today?\n\nI can help you with:\n- Product questions\n- Voice commands\n- Product images\n- PDF documents",
  primaryColor = "#1976d2",
  userId = null,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [uploadProgress, setUploadProgress] = useState({
    show: false,
    type: "",
    fileName: "",
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const showSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const startBrowserSpeech = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showSnackbar(
        "Your browser doesn't support voice input. Please type your message.",
        "warning",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      setTimeout(() => {
        if (transcript.trim()) {
          sendTextMessage();
        }
      }, 100);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      let errorMsg = "Could not recognize speech. ";
      if (event.error === "not-allowed") {
        errorMsg += "Please allow microphone access.";
      } else if (event.error === "no-speech") {
        errorMsg += "No speech detected. Please try again.";
      } else {
        errorMsg += "Please try again.";
      }
      showSnackbar(errorMsg, "warning");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleAttachClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAttachClose = () => {
    setAnchorEl(null);
  };

  const handleFileSelect = (type) => {
    fileInputRef.current.click();
    handleAttachClose();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      await sendImageMessage(file);
    } else if (file.type === "application/pdf") {
      await sendPDFMessage(file);
    } else {
      showSnackbar(
        "Unsupported file type. Please upload an image or PDF.",
        "warning",
      );
    }

    event.target.value = null;
  };

  const sendImageMessage = async (imageFile) => {
    setUploadProgress({
      show: true,
      type: "image",
      fileName: imageFile.name,
    });

    const userMessage = {
      role: "user",
      content: "Processing your image...",
      timestamp: new Date(),
      type: "image",
      isProcessing: true,
      imagePreview: URL.createObjectURL(imageFile),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("message", input || "What product is this?");
      formData.append(
        "user_id",
        userId || localStorage.getItem("userId") || "anonymous",
      );

      const response = await fetch(`${apiUrl}/api/chat/${botId}/image`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const imageUrl = URL.createObjectURL(imageFile);

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex].isProcessing) {
          newMessages[lastIndex] = {
            role: "user",
            content: "Image uploaded",
            imageUrl: imageUrl,
            imagePreview: imageUrl,
            analysis: data.image_analysis,
            timestamp: new Date(),
            type: "image",
            isProcessing: false,
          };
        }
        return newMessages;
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          type: "text",
        },
      ]);

      setInput("");
    } catch (error) {
      console.error("Image message error:", error);
      showSnackbar("Failed to process image. Please try again.", "error");
      setMessages((prev) => prev.filter((msg) => !msg.isProcessing));
    } finally {
      setIsLoading(false);
      setUploadProgress({ show: false, type: "", fileName: "" });
    }
  };

  const sendPDFMessage = async (pdfFile) => {
    setUploadProgress({
      show: true,
      type: "pdf",
      fileName: pdfFile.name,
    });

    const userMessage = {
      role: "user",
      content: `Processing PDF: ${pdfFile.name}`,
      timestamp: new Date(),
      type: "pdf",
      isProcessing: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append(
        "message",
        input || "What information is in this document?",
      );
      formData.append(
        "user_id",
        userId || localStorage.getItem("userId") || "anonymous",
      );

      const response = await fetch(`${apiUrl}/api/chat/${botId}/pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex].isProcessing) {
          newMessages[lastIndex] = {
            role: "user",
            content: `${pdfFile.name}`,
            pdfSummary: data.pdf_summary,
            pageCount: data.page_count,
            timestamp: new Date(),
            type: "pdf",
            isProcessing: false,
          };
        }
        return newMessages;
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          type: "text",
        },
      ]);

      setInput("");
    } catch (error) {
      console.error("PDF message error:", error);
      showSnackbar("Failed to process PDF. Please try again.", "error");
      setMessages((prev) => prev.filter((msg) => !msg.isProcessing));
    } finally {
      setIsLoading(false);
      setUploadProgress({ show: false, type: "", fileName: "" });
    }
  };

  const sendTextMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat/${botId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
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
          type: "text",
        },
      ]);

      if (isOpen) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Chat error:", error);
      showSnackbar(
        "Sorry, I'm having trouble connecting. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />

      {!isOpen ? (
        <Zoom in={!isOpen}>
          <FloatingButton
            color="primary"
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ "& .MuiBadge-badge": { right: -4, top: -4 } }}
            >
              <ChatIcon />
            </Badge>
          </FloatingButton>
        </Zoom>
      ) : (
        <ChatWindow elevation={3}>
          <ChatHeader>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 32, height: 32 }}
              >
                <SmartToyIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Online • Multimodal AI
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </ChatHeader>

          <MessagesContainer>
            {uploadProgress.show && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  padding: 2,
                  backgroundColor: "white",
                  borderRadius: 2,
                  boxShadow: 1,
                  marginBottom: 1,
                }}
              >
                <CircularProgress size={24} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {uploadProgress.type === "image"
                      ? "Uploading Image..."
                      : "Uploading PDF..."}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {uploadProgress.fileName}
                  </Typography>
                </Box>
                <Typography variant="caption" color="primary">
                  Processing...
                </Typography>
              </Box>
            )}

            {messages.map((message, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box sx={{ maxWidth: "80%" }}>
                  <MessageBubble
                    isuser={(message.role === "user").toString()}
                    elevation={0}
                  >
                    {(message.type === "image" || message.imagePreview) && (
                      <Box sx={{ mb: 1 }}>
                        <img
                          src={message.imageUrl || message.imagePreview}
                          alt="Uploaded"
                          style={{
                            maxWidth: "100%",
                            borderRadius: 8,
                            maxHeight: 150,
                          }}
                        />
                        {message.isProcessing && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <CircularProgress size={16} />
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Analyzing image...
                            </Typography>
                          </Box>
                        )}
                        {message.analysis && !message.isProcessing && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mt: 1, opacity: 0.8 }}
                          >
                            {message.analysis.substring(0, 150)}...
                          </Typography>
                        )}
                      </Box>
                    )}

                    {message.type === "pdf" && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PictureAsPdfIcon color="error" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                          {message.pageCount && (
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {message.pageCount} pages
                            </Typography>
                          )}
                        </Box>
                        {message.isProcessing && <CircularProgress size={16} />}
                      </Box>
                    )}

                    {message.type === "voice" && !message.isProcessing && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <MicIcon fontSize="small" />
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                      </Box>
                    )}

                    {message.type === "text" && (
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {message.content}
                      </Typography>
                    )}

                    {message.isProcessing && message.type !== "image" && (
                      <CircularProgress size={20} />
                    )}
                  </MessageBubble>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      textAlign: message.role === "user" ? "right" : "left",
                      color: "text.secondary",
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}

            {isLoading && !messages.some((m) => m.isProcessing) && (
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Paper
                  elevation={0}
                  sx={{
                    padding: 2,
                    borderRadius: "4px 18px 18px 18px",
                    backgroundColor: "white",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <CircularProgress size={12} />
                    <CircularProgress
                      size={12}
                      sx={{ animationDelay: "0.2s" }}
                    />
                    <CircularProgress
                      size={12}
                      sx={{ animationDelay: "0.4s" }}
                    />
                  </Box>
                </Paper>
              </Box>
            )}

            {isRecording && (
              <RecordingIndicator>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "error.main",
                    animation: `${pulseAnimation} 1s infinite`,
                  }}
                />
                <Typography variant="body2" color="error">
                  Listening... Speak now
                </Typography>
              </RecordingIndicator>
            )}

            <div ref={messagesEndRef} />
          </MessagesContainer>

          <Box
            sx={{
              padding: "0 16px",
              borderTop: 1,
              borderColor: "divider",
              pt: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}>
              {[
                "Best selling items",
                "Show me laptop deals",
                "Track my order",
                "Return policy",
              ].map((suggestion) => (
                <QuickSuggestionButton
                  key={suggestion}
                  size="small"
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => sendTextMessage(), 100);
                  }}
                >
                  {suggestion}
                </QuickSuggestionButton>
              ))}
            </Box>
          </Box>

          <InputWrapper>
            <IconButton size="small" onClick={handleAttachClick}>
              <AttachFileIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleAttachClose}
            >
              <MenuItem onClick={() => handleFileSelect("image")}>
                <ListItemAvatar>
                  <ImageIcon />
                </ListItemAvatar>
                <ListItemText primary="Upload Image" />
              </MenuItem>
              <MenuItem onClick={() => handleFileSelect("pdf")}>
                <ListItemAvatar>
                  <PictureAsPdfIcon />
                </ListItemAvatar>
                <ListItemText primary="Upload PDF" />
              </MenuItem>
            </Menu>

            <StyledTextField
              size="small"
              placeholder="Type a message or click the mic to speak..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && sendTextMessage()
              }
              multiline
              maxRows={3}
              variant="outlined"
            />

            {input.trim() ? (
              <IconButton
                color="primary"
                onClick={sendTextMessage}
                disabled={isLoading}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <SendIcon />
              </IconButton>
            ) : (
              <IconButton
                color={isRecording ? "error" : "default"}
                onClick={startBrowserSpeech}
                disabled={isRecording}
                sx={{
                  animation: isRecording
                    ? `${pulseAnimation} 1s infinite`
                    : "none",
                }}
              >
                {isRecording ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            )}
          </InputWrapper>

          <Box
            sx={{
              padding: "8px 16px",
              borderTop: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Text • Voice • Images • PDFs
            </Typography>
          </Box>
        </ChatWindow>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FloatingChat;
