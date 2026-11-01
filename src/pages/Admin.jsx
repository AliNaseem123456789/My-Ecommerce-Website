import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { AuthContext } from "../components/context/AuthContext";
import { adminService } from "../services/admin.service";

const NEXT = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
};

export default function Admin() {
  const { user, loading } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ name: "", price: "", stock: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [counts, catalog, orderRows, people, reviewRows, questionRows] =
        await Promise.all([
          adminService.summary(),
          adminService.products(),
          adminService.orders(statusFilter),
          adminService.customers(),
          adminService.reviews(),
          adminService.questions(),
        ]);
      setSummary(counts);
      setProducts(catalog || []);
      setOrders(orderRows || []);
      setCustomers(people || []);
      setReviews(reviewRows || []);
      setQuestions(questionRows || []);
    } catch (err) {
      setError(err.response?.data?.message || "Admin data could not be loaded.");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, statusFilter]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (!user) return <Typography sx={{ p: 4 }}>Sign in to open admin.</Typography>;
  if (user.role !== "admin") {
    return <Typography sx={{ p: 4 }}>This account is not an admin.</Typography>;
  }

  const saveProduct = async (event) => {
    event.preventDefault();
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock || 0),
    };
    if (editing) await adminService.updateProduct(editing, body);
    else await adminService.createProduct(body);
    setForm({ name: "", price: "", stock: "", description: "" });
    setEditing(null);
    load();
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      <Typography variant="h4" mb={2}>Admin</Typography>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      <Tabs value={tab} onChange={(_event, value) => setTab(value)}>
        <Tab label="Dashboard" />
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Customers" />
        <Tab label="Reviews" />
        <Tab label="Q&A" />
      </Tabs>

      {tab === 0 && summary && (
        <Box mt={3}>
          <Typography>Products: {summary.products}</Typography>
          <Typography>Orders: {summary.orders}</Typography>
          <Typography>Customers: {summary.customers}</Typography>
          {(summary.byStatus || []).map((row) => (
            <Typography key={row.status}>
              {row.status || "unknown"}: {row.count}
            </Typography>
          ))}
        </Box>
      )}

      {tab === 1 && (
        <Box mt={3}>
          <Box component="form" onSubmit={saveProduct} display="flex" gap={1} flexWrap="wrap" mb={2}>
            <TextField size="small" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField size="small" label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <TextField size="small" label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <TextField size="small" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Button type="submit" variant="contained">{editing ? "Update" : "Create"}</Button>
          </Box>
          {products.map((product) => (
            <Box key={product.product_id} display="flex" gap={2} alignItems="center" py={1} borderBottom="1px solid #eee">
              <Typography sx={{ flex: 1 }}>{product.name}</Typography>
              <Typography>${Number(product.price).toFixed(2)}</Typography>
              <Typography>Stock {product.stock}</Typography>
              <Button size="small" onClick={() => {
                setEditing(product.product_id);
                setForm({
                  name: product.name,
                  price: product.price,
                  stock: product.stock ?? 0,
                  description: product.description || "",
                });
              }}>Edit</Button>
              <Button size="small" component="label">
                Image
                <input hidden type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    await adminService.uploadImage(product.product_id, reader.result);
                    load();
                  };
                  reader.readAsDataURL(file);
                }} />
              </Button>
              <Button size="small" color="error" onClick={async () => {
                await adminService.deleteProduct(product.product_id);
                load();
              }}>Delete</Button>
            </Box>
          ))}
        </Box>
      )}

      {tab === 2 && (
        <Box mt={3}>
          <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ mb: 2, minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {["pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
          {orders.map((order) => {
            const options = NEXT[order.status] || [];
            return (
              <Box key={order.order_id} py={1} borderBottom="1px solid #eee">
                <Typography>{order.order_id}</Typography>
                <Typography>Status: {order.status} · Payment: {order.payment_status} · ${Number(order.total).toFixed(2)}</Typography>
                {options.length > 0 && (
                  <TextField select size="small" defaultValue="" label="Move to" onChange={async (e) => {
                    await adminService.updateOrderStatus(order.order_id, e.target.value);
                    load();
                  }} sx={{ mt: 1, minWidth: 160 }}>
                    {options.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </TextField>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {tab === 3 && (
        <Box mt={3}>
          {customers.map((customer) => (
            <Typography key={customer.id} py={0.5}>
              {customer.name} · {customer.email} · {customer.role}
            </Typography>
          ))}
        </Box>
      )}

      {tab === 4 && (
        <Box mt={3}>
          {reviews.map((review) => (
            <Box key={review.review_id} py={1} borderBottom="1px solid #eee">
              <Typography>
                {review.products?.name} · {review.name} · {review.rating}
                {review.verified ? " · verified" : ""}
              </Typography>
              <Typography>{review.title}: {review.review}</Typography>
              <Button
                size="small"
                color="error"
                onClick={async () => {
                  await adminService.deleteReview(review.review_id);
                  load();
                }}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {tab === 5 && (
        <Box mt={3}>
          {questions.map((question) => (
            <Box key={question.question_id} py={1} borderBottom="1px solid #eee">
              <Typography fontWeight={700}>
                {question.products?.name} · {question.name} · {question.email}
              </Typography>
              <Typography>{question.question}</Typography>
              {(question.product_answers || []).map((answer) => (
                <Typography key={answer.id} color="text.secondary">
                  Answer: {answer.answer}
                </Typography>
              ))}
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Write an answer"
                  value={answerDrafts[question.question_id] || ""}
                  onChange={(event) =>
                    setAnswerDrafts({
                      ...answerDrafts,
                      [question.question_id]: event.target.value,
                    })
                  }
                />
                <Button
                  variant="contained"
                  onClick={async () => {
                    const answer = answerDrafts[question.question_id];
                    if (!answer) return;
                    await adminService.answerQuestion(question.question_id, answer);
                    setAnswerDrafts({ ...answerDrafts, [question.question_id]: "" });
                    load();
                  }}
                >
                  Answer
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
