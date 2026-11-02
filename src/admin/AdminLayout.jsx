import { Suspense, useContext, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import CollectionsBookmarkOutlinedIcon from "@mui/icons-material/CollectionsBookmarkOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import WebOutlinedIcon from "@mui/icons-material/WebOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import adminTheme from "./adminTheme";
import { AuthContext } from "../components/context/AuthContext";

const SIDEBAR_WIDTH = 248;

const NAV = [
  { to: "/admin", label: "Dashboard", icon: DashboardOutlinedIcon, end: true },
  { to: "/admin/products", label: "Products", icon: Inventory2OutlinedIcon },
  { to: "/admin/categories", label: "Categories", icon: CategoryOutlinedIcon },
  { to: "/admin/brands", label: "Brands", icon: LabelOutlinedIcon },
  { to: "/admin/collections", label: "Collections", icon: CollectionsBookmarkOutlinedIcon },
  { to: "/admin/promotions", label: "Promotions", icon: CampaignOutlinedIcon },
  { to: "/admin/landing", label: "Landing page", icon: WebOutlinedIcon },
  { to: "/admin/orders", label: "Orders", icon: ReceiptLongOutlinedIcon },
  { to: "/admin/customers", label: "Customers", icon: PeopleAltOutlinedIcon },
  { to: "/admin/reviews", label: "Reviews", icon: RateReviewOutlinedIcon },
  { to: "/admin/questions", label: "Q&A", icon: QuestionAnswerOutlinedIcon },
  { to: "/admin/coupons", label: "Coupons", icon: LocalOfferOutlinedIcon },
];

function titleFor(pathname) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/categories")) return "Categories";
  if (pathname.startsWith("/admin/brands")) return "Brands";
  if (pathname.startsWith("/admin/collections")) return "Collections";
  if (pathname.startsWith("/admin/promotions")) return "Promotions";
  if (pathname.startsWith("/admin/landing")) return "Landing page";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/customers")) return "Customers";
  if (pathname.startsWith("/admin/reviews")) return "Reviews";
  if (pathname.startsWith("/admin/questions")) return "Questions & answers";
  if (pathname.startsWith("/admin/coupons")) return "Coupons";
  return "Admin";
}

function SidebarContent({ onNavigate }) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2.25, display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          A
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
            Store admin
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            Control panel
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1.25, py: 1.5, flex: 1 }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: "text.secondary",
              "&.active": {
                bgcolor: "primary.main",
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
                "&:hover": { bgcolor: "primary.dark" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
            />
          </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <List sx={{ px: 1.25, py: 1.25 }}>
        <ListItemButton
          component={Link}
          to="/"
          sx={{ borderRadius: 2, color: "text.secondary" }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <StorefrontOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="View store"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(adminTheme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleLogout = () => {
    setMenuAnchor(null);
    logout();
    navigate("/");
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        {isDesktop ? (
          <Drawer
            variant="permanent"
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: SIDEBAR_WIDTH,
                boxSizing: "border-box",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <SidebarContent />
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH } }}
          >
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </Drawer>
        )}

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <AppBar
            position="sticky"
            color="inherit"
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Toolbar sx={{ gap: 1, minHeight: { xs: 56, md: 60 } }}>
              {!isDesktop && (
                <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" sx={{ flex: 1, fontSize: 17 }}>
                {titleFor(location.pathname)}
              </Typography>
              <Tooltip title={user?.email || ""}>
                <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.main" }}>
                    {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem disabled sx={{ opacity: "1 !important" }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {user?.name || "Administrator"}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LogoutOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, minWidth: 0 }}>
            <Suspense
              fallback={
                <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
                  <CircularProgress />
                </Box>
              }
            >
              <Outlet />
            </Suspense>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
