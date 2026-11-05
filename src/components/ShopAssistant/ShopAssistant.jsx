import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Fab,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import CableRoundedIcon from "@mui/icons-material/CableRounded";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import RichText from "./RichText";
import { CartCard, CheckoutCard, Choices, ConfirmCard, OrderCards, ProductCards } from "./Cards";
import {
  conversationId as getConversationId,
  fetchHistory,
  fetchWelcome,
  saveCheckoutPrefill,
  sendImage,
  streamChat,
  streamConfirm,
} from "./chatApi";

const ICONS = {
  search: SearchRoundedIcon,
  sparkles: CompareArrowsRoundedIcon,
  plug: CableRoundedIcon,
  tag: SellOutlinedIcon,
  cart: ShoppingCartOutlinedIcon,
  truck: LocalShippingOutlinedIcon,
};

// Shown if the gateway can't be reached for the welcome payload.
const FALLBACK_WELCOME = {
  title: "Hi there! I'm your shopping assistant.",
  message:
    "I can help you find the right product, compare options, check specs and compatibility, see live prices and stock, fill your cart and walk you through checkout. I can also track orders and help with returns.",
  capabilities: [
    { icon: "search", title: "Find products", text: "Describe what you need in your own words." },
    { icon: "sparkles", title: "Recommend & compare", text: "Picks for your budget, side by side." },
    { icon: "plug", title: "Specs & compatibility", text: "Ask whether something fits or works." },
    { icon: "tag", title: "Live prices & stock", text: "Checked with the store in real time." },
    { icon: "cart", title: "Cart & checkout", text: "Add items and get guided to checkout." },
    { icon: "truck", title: "Orders & support", text: "Tracking, returns, shipping, warranty." },
  ],
  suggestions: [
    "Find me a good laptop under $1000",
    "Compare these two smartphones",
    "Is this product compatible with my laptop?",
    "Add this product to my cart",
    "Where is my order?",
  ],
};

const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;
const dot = keyframes`0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); }`;
const glow = keyframes`0% { box-shadow: 0 0 0 0 rgba(59,130,246,.45); } 70% { box-shadow: 0 0 0 14px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }`;

let seq = 0;
const uid = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

function pageFromPath(pathname) {
  const m = pathname.match(/^\/product\/(\d+)/);
  return m ? { product_id: Number(m[1]), path: pathname } : { path: pathname };
}

export default function ShopAssistant({ title = "Shop Assistant", accent = "#111827" }) {
  const { user } = useContext(AuthContext);
  const { userId: cartOwner, refreshCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [welcome, setWelcome] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(0);
  const [listening, setListening] = useState(false);
  const [convId, setConvId] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const loadedFor = useRef(null);

  const ownerKey = user?.id ? `user_${user.id}` : cartOwner ? `guest_${cartOwner}` : null;
  const page = useMemo(() => pageFromPath(location.pathname), [location.pathname]);
  const onProductPage = Boolean(page.product_id);

  // One conversation per owner; switching account switches conversation.
  useEffect(() => {
    if (!ownerKey) return;
    setConvId(getConversationId(ownerKey));
  }, [ownerKey]);

  // Gentle nudge for first-time visitors.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem("shopassist_seen") === "1";
    } catch {
      /* ignore */
    }
    if (seen) return undefined;
    const t = setTimeout(() => setTeaser(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // Load welcome + history the first time the panel opens for this conversation.
  useEffect(() => {
    if (!open || !convId || loadedFor.current === convId) return;
    loadedFor.current = convId;
    fetchWelcome(onProductPage ? page : null)
      .then(setWelcome)
      .catch(() => setWelcome(FALLBACK_WELCOME));
    fetchHistory(convId)
      .then((rows) => {
        if (rows.length) {
          setMessages(rows.map((r) => ({ id: uid(), role: r.role, text: r.text, cards: [] })));
        }
      })
      .catch(() => {});
  }, [open, convId, onProductPage, page]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openPanel = () => {
    setOpen(true);
    setTeaser(false);
    setUnread(0);
    try {
      localStorage.setItem("shopassist_seen", "1");
    } catch {
      /* ignore */
    }
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const patch = useCallback((id, fn) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)));
  }, []);

  const handleEvent = useCallback(
    (botId) => (type, ev) => {
      if (type === "status") patch(botId, () => ({ status: ev.text }));
      else if (type === "token") patch(botId, (m) => ({ text: (m.text || "") + (ev.text || ""), status: null }));
      else if (type === "ui")
        patch(botId, (m) => ({
          // keep only the newest card of each kind
          cards: [...(m.cards || []).filter((c) => c.kind !== ev.kind), { kind: ev.kind, data: ev.data }],
        }));
      else if (type === "confirm") patch(botId, () => ({ confirm: ev.action }));
      else if (type === "message") patch(botId, () => ({ text: ev.text, status: null }));
      else if (type === "error") patch(botId, () => ({ text: ev.text, error: true, status: null }));
    },
    [patch],
  );

  const finish = useCallback(
    (botId) => {
      patch(botId, (m) => ({ streaming: false, status: null, text: m.text || (m.confirm ? "" : "Sorry, I didn't get a reply. Please try again.") }));
      setBusy(false);
      if (!open) setUnread((n) => n + 1);
      // The bot may have changed the cart through the backend: resync the header/cart UI.
      refreshCart?.();
    },
    [patch, open, refreshCart],
  );

  const run = useCallback(
    async (starter) => {
      const botId = uid();
      setMessages((prev) => [...prev, { id: botId, role: "assistant", text: "", cards: [], streaming: true, status: "Thinking..." }]);
      setBusy(true);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        await starter(handleEvent(botId), ctrl.signal);
      } catch (err) {
        if (err.name !== "AbortError") {
          const msg =
            err.status === 429
              ? "You're sending messages quickly. Give me a few seconds and try again."
              : "I couldn't reach the assistant right now. Please try again in a moment.";
          patch(botId, () => ({ text: msg, error: true }));
        }
      } finally {
        finish(botId);
      }
    },
    [handleEvent, patch, finish],
  );

  const send = useCallback(
    (text) => {
      const message = (text ?? input).trim();
      if (!message || busy || !convId) return;
      setInput("");
      setMessages((prev) => [...prev, { id: uid(), role: "user", text: message, cards: [] }]);
      run((onEvent, signal) => streamChat({ message, conversationId: convId, page, onEvent, signal }));
    },
    [input, busy, convId, page, run],
  );

  const answerConfirm = (msgId, approved) => {
    patch(msgId, () => ({ confirmAnswered: approved ? "yes" : "no" }));
    setMessages((prev) => [...prev, { id: uid(), role: "user", text: approved ? "Yes, go ahead" : "No, cancel that", cards: [] }]);
    run((onEvent, signal) => streamConfirm({ conversationId: convId, approved, onEvent, signal }));
  };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy || !convId) return;
    if (file.size > 6 * 1024 * 1024) {
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: "That image is too large (max 6 MB).", cards: [], error: true }]);
      return;
    }
    const preview = URL.createObjectURL(file);
    const caption = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: uid(), role: "user", text: caption || "Find products like this", image: preview, cards: [] }]);
    run(async (onEvent) => {
      onEvent("status", { text: "Looking at your photo..." });
      const data = await sendImage({ file, message: caption, conversationId: convId });
      (data.ui || []).forEach((c) => onEvent("ui", c));
      if (data.confirm) onEvent("confirm", { action: data.confirm });
      onEvent("message", { text: data.response });
    });
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: "Voice input isn't supported in this browser. Please type your message.", cards: [] }]);
      return;
    }
    const rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (ev) => {
      const said = ev.results?.[0]?.[0]?.transcript?.trim();
      if (said) send(said);
    };
    rec.start();
  };

  const newChat = () => {
    if (!ownerKey) return;
    abortRef.current?.abort();
    const id = getConversationId(ownerKey, { reset: true });
    loadedFor.current = id;
    setConvId(id);
    setMessages([]);
    setBusy(false);
  };

  const goCheckout = (handoff) => {
    saveCheckoutPrefill(handoff.prefill || {});
    setOpen(false);
    navigate("/checkout");
  };

  const openProduct = (p) => {
    navigate(`/product/${p.id}`);
    if (window.matchMedia("(max-width: 600px)").matches) setOpen(false);
  };

  const w = welcome || FALLBACK_WELCOME;
  const suggestions = w.suggestions || FALLBACK_WELCOME.suggestions;
  const lastConfirm = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />

      {/* Launcher */}
      <Zoom in={!open}>
        <Box sx={{ position: "fixed", right: { xs: 16, sm: 24 }, bottom: { xs: 16, sm: 24 }, zIndex: 1300 }}>
          {teaser && !open && (
            <Paper
              elevation={6}
              onClick={openPanel}
              sx={{ position: "absolute", right: 0, bottom: 72, width: 230, p: 1.5, borderRadius: 3, cursor: "pointer", animation: `${rise} .35s ease` }}
            >
              <IconButton
                size="small"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  setTeaser(false);
                  try {
                    localStorage.setItem("shopassist_seen", "1");
                  } catch {
                    /* ignore */
                  }
                }}
                sx={{ position: "absolute", top: 2, right: 2 }}
              >
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="body2" fontWeight={700}>Need a hand? 👋</Typography>
              <Typography variant="caption" color="text.secondary">
                Ask me to find, compare or track anything.
              </Typography>
            </Paper>
          )}
          <Tooltip title="Chat with our shopping assistant" placement="left">
            <Fab
              onClick={openPanel}
              aria-label="Open shopping assistant"
              sx={{ bgcolor: accent, color: "#fff", "&:hover": { bgcolor: accent, filter: "brightness(1.15)" }, animation: teaser ? `${glow} 2s infinite` : "none" }}
            >
              <Badge badgeContent={unread} color="error" overlap="circular">
                <ChatBubbleRoundedIcon />
              </Badge>
            </Fab>
          </Tooltip>
        </Box>
      </Zoom>

      {/* Panel */}
      {open && (
        <Paper
          role="dialog"
          aria-label={title}
          elevation={12}
          sx={{
            position: "fixed",
            zIndex: 1300,
            right: { xs: 0, sm: 24 },
            bottom: { xs: 0, sm: 24 },
            width: { xs: "100vw", sm: 400 },
            height: { xs: "100dvh", sm: "min(680px, calc(100vh - 48px))" },
            borderRadius: { xs: 0, sm: 4 },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f7f7f8",
            animation: `${rise} .25s ease`,
          }}
        >
          {/* Header */}
          <Box sx={{ px: 2, py: 1.5, color: "#fff", background: `linear-gradient(135deg, ${accent} 0%, #374151 100%)`, display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "rgba(255,255,255,.16)" }}>
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>
                {title}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#22c55e" }} />
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {busy ? "Working on it..." : "Online · replies in seconds"}
                </Typography>
              </Stack>
            </Box>
            <Tooltip title="New conversation">
              <IconButton size="small" onClick={newChat} sx={{ color: "#fff" }} aria-label="New conversation">
                <RestartAltRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }} aria-label="Close">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Body */}
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", px: 1.75, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {messages.length === 0 && (
              <Welcome w={w} accent={accent} suggestions={suggestions} onPick={send} signedIn={!!user} />
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <Box key={m.id} sx={{ alignSelf: "flex-end", maxWidth: "85%", animation: `${rise} .2s ease` }}>
                  {m.image && <Box component="img" src={m.image} alt="Your upload" sx={{ display: "block", ml: "auto", mb: 0.5, maxWidth: 180, maxHeight: 140, borderRadius: 2, objectFit: "cover" }} />}
                  <Box sx={{ px: 1.5, py: 1, borderRadius: "16px 16px 4px 16px", bgcolor: accent, color: "#fff" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</Typography>
                  </Box>
                </Box>
              ) : (
                <Box key={m.id} sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1, animation: `${rise} .2s ease` }}>
                  {(m.text || m.status) && (
                    <Box
                      sx={{
                        alignSelf: "flex-start",
                        maxWidth: "92%",
                        px: 1.5,
                        py: 1.1,
                        borderRadius: "16px 16px 16px 4px",
                        bgcolor: m.error ? "#fef2f2" : "#fff",
                        border: "1px solid",
                        borderColor: m.error ? "#fecaca" : "divider",
                      }}
                    >
                      {m.text ? <RichText text={m.text} /> : <Typing label={m.status} />}
                    </Box>
                  )}
                  {(m.cards || []).map((c) => (
                    <CardSwitch
                      key={c.kind}
                      card={c}
                      accent={accent}
                      onAsk={send}
                      onOpen={openProduct}
                      onCheckout={goCheckout}
                      busy={busy}
                    />
                  ))}
                  {m.confirm && !m.confirmAnswered && m === lastConfirm && (
                    <ConfirmCard action={m.confirm} busy={busy} accent={accent} onAnswer={(yes) => answerConfirm(m.id, yes)} />
                  )}
                </Box>
              ),
            )}
          </Box>

          {/* Quick prompts while chatting */}
          {messages.length > 0 && !busy && (
            <Box sx={{ px: 1.75, pb: 0.75, display: "flex", gap: 0.75, overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
              {(onProductPage ? ["Tell me about this product", "Is this compatible with my device?", "Add this product to my cart"] : ["View my cart", "Where is my order?", "Return policy"]).map((s) => (
                <Box
                  key={s}
                  component="button"
                  onClick={() => send(s)}
                  sx={{ flexShrink: 0, border: "1px solid", borderColor: "divider", bgcolor: "#fff", borderRadius: 999, px: 1.25, py: 0.5, fontSize: 12, cursor: "pointer", color: "text.secondary", "&:hover": { borderColor: accent, color: accent } }}
                >
                  {s}
                </Box>
              ))}
            </Box>
          )}

          {/* Composer */}
          <Box sx={{ p: 1.25, pt: 0.75, bgcolor: "#fff", borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, px: 1, py: 0.5, "&:focus-within": { borderColor: accent } }}>
              <Tooltip title="Search with a photo">
                <span>
                  <IconButton size="small" onClick={() => fileRef.current?.click()} disabled={busy} aria-label="Upload a product photo">
                    <ImageOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <InputBase
                inputRef={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={listening ? "Listening..." : "Ask about products, your cart or orders"}
                multiline
                maxRows={4}
                sx={{ flex: 1, fontSize: 14, py: 0.75 }}
                inputProps={{ "aria-label": "Message" }}
              />
              {input.trim() ? (
                <IconButton size="small" onClick={() => send()} disabled={busy} aria-label="Send" sx={{ bgcolor: accent, color: "#fff", "&:hover": { bgcolor: accent }, "&.Mui-disabled": { bgcolor: "grey.300", color: "#fff" } }}>
                  <SendRoundedIcon fontSize="small" />
                </IconButton>
              ) : (
                <Tooltip title="Speak">
                  <span>
                    <IconButton size="small" onClick={startVoice} disabled={busy || listening} aria-label="Voice input" color={listening ? "error" : "default"}>
                      <MicNoneRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 0.5, fontSize: 10.5 }}>
              AI assistant · prices and stock are checked live · payment happens only at checkout
            </Typography>
          </Box>
        </Paper>
      )}
    </>
  );
}

function Typing({ label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Stack direction="row" spacing={0.5}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.500", animation: `${dot} 1.2s ${i * 0.15}s infinite ease-in-out` }} />
        ))}
      </Stack>
      {label && (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
    </Stack>
  );
}

function Welcome({ w, accent, suggestions, onPick, signedIn }) {
  return (
    <Box sx={{ animation: `${rise} .3s ease` }}>
      <Box sx={{ p: 2, borderRadius: 3, bgcolor: "#fff", border: "1px solid", borderColor: "divider", mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.3, mb: 0.75 }}>
          {w.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
          {w.message}
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.75 }}>
        {(w.capabilities || []).map((c) => {
          const Icon = ICONS[c.icon] || SearchRoundedIcon;
          return (
            <Box key={c.title} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ width: 28, height: 28, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: `${accent}12`, color: accent, mb: 0.75 }}>
                <Icon sx={{ fontSize: 17 }} />
              </Box>
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13, lineHeight: 1.25 }}>
                {c.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, display: "block" }}>
                {c.text}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8, fontSize: 11 }}>
        Try asking
      </Typography>
      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
        {suggestions.map((s) => (
          <Box
            key={s}
            component="button"
            onClick={() => onPick(s)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              textAlign: "left",
              width: "100%",
              px: 1.5,
              py: 1.1,
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "#fff",
              cursor: "pointer",
              font: "inherit",
              fontSize: 13.5,
              color: "text.primary",
              transition: "all .15s ease",
              "&:hover": { borderColor: accent, transform: "translateX(2px)" },
              "&:hover svg": { color: accent },
            }}
          >
            <span>“{s}”</span>
            <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
          </Box>
        ))}
      </Stack>
      {!signedIn && w.note && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, textAlign: "center" }}>
          {w.note}
        </Typography>
      )}
    </Box>
  );
}

function CardSwitch({ card, accent, onAsk, onOpen, onCheckout, busy }) {
  switch (card.kind) {
    case "products":
      return <ProductCards products={card.data} onAsk={onAsk} onOpen={onOpen} accent={accent} />;
    case "cart":
      return <CartCard cart={card.data} accent={accent} onCheckout={() => onAsk("I'd like to check out")} />;
    case "orders":
      return <OrderCards orders={card.data} onAsk={onAsk} />;
    case "order":
      return <OrderCards orders={[card.data]} onAsk={onAsk} />;
    case "checkout":
      return <CheckoutCard data={card.data} accent={accent} onContinue={onCheckout} />;
    case "choices":
      return <Choices options={card.data} onPick={onAsk} disabled={busy} />;
    default:
      return null;
  }
}
