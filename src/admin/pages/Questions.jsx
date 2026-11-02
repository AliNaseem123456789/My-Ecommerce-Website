import { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import PageHeader from "../components/PageHeader";
import { adminService } from "../../services/admin.service";
import useAdminData from "../hooks/useAdminData";
import { dateTime } from "../format";

export default function Questions() {
  const fetcher = useCallback(() => adminService.questions(), []);
  const { data, loading, error, reload } = useAdminData(fetcher);
  const questions = data || [];

  const [filter, setFilter] = useState("unanswered");
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");

  const answered = (row) => (row.product_answers?.length || 0) > 0;
  const visible = questions.filter((row) => {
    if (filter === "unanswered") return !answered(row);
    if (filter === "answered") return answered(row);
    return true;
  });

  const submitAnswer = async (row) => {
    const answer = (drafts[row.question_id] || "").trim();
    if (!answer) return;
    setSavingId(row.question_id);
    setActionError("");
    try {
      await adminService.answerQuestion(row.question_id, answer);
      setDrafts((current) => ({ ...current, [row.question_id]: "" }));
      setToast("Answer published");
      await reload();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "The answer could not be saved.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const unansweredCount = questions.filter((row) => !answered(row)).length;

  return (
    <Box>
      <PageHeader
        title="Questions & answers"
        subtitle={`${questions.length} question${
          questions.length === 1 ? "" : "s"
        } · ${unansweredCount} waiting for a reply`}
        actions={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filter}
            onChange={(_event, value) => value && setFilter(value)}
          >
            <ToggleButton value="unanswered">Unanswered</ToggleButton>
            <ToggleButton value="answered">Answered</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && visible.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <QuestionAnswerOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
          <Typography sx={{ mt: 1, fontWeight: 600 }}>
            {filter === "unanswered" ? "Everything is answered" : "Nothing here"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Customer questions from product pages show up here.
          </Typography>
        </Paper>
      )}

      {!loading && !error && (
        <Box sx={{ display: "grid", gap: 2 }}>
          {visible.map((row) => (
            <Paper key={row.question_id} sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  variant="outlined"
                  label={row.products?.name || `Product #${row.product_id}`}
                />
                <Chip
                  size="small"
                  color={answered(row) ? "success" : "warning"}
                  variant="outlined"
                  label={answered(row) ? "Answered" : "Waiting"}
                />
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {dateTime(row.created_at)}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                {row.question}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.5 }}>
                asked by {row.name} · {row.email}
              </Typography>

              {answered(row) && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  {row.product_answers.map((reply) => (
                    <Box
                      key={reply.id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <Typography sx={{ fontSize: 13.5 }}>{reply.answer}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.5 }}>
                        {dateTime(reply.created_at)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 2, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <TextField
                  placeholder={answered(row) ? "Add another reply…" : "Write a reply…"}
                  value={drafts[row.question_id] || ""}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [row.question_id]: event.target.value,
                    }))
                  }
                  multiline
                  minRows={2}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={() => submitAnswer(row)}
                  disabled={
                    savingId === row.question_id ||
                    !(drafts[row.question_id] || "").trim()
                  }
                  sx={{ mt: 0.25, flexShrink: 0 }}
                >
                  {savingId === row.question_id ? "Sending…" : "Reply"}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
