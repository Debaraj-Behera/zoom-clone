import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0); // 0 = Login, 1 = Register
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
        setFormState(0);
        setName("");
        setUsername("");
        setPassword("");
        setError("");
      }
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        {/* Left side with random background */}
        <Grid
          item
          xs={false}
          sm={5}
          md={7}
          sx={{
            backgroundImage: "url(https://source.unsplash.com/random/?technology)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Right side form panel */}
        <Grid item xs={12} sm={7} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 4,
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>

              <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                {formState === 0 ? "Welcome Back" : "Create an Account"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  width: "100%",
                  mb: 2,
                }}
              >
                <Button
                  fullWidth
                  variant={formState === 0 ? "contained" : "outlined"}
                  onClick={() => setFormState(0)}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  variant={formState === 1 ? "contained" : "outlined"}
                  onClick={() => setFormState(1)}
                >
                  Sign Up
                </Button>
              </Box>

              <Box component="form" noValidate sx={{ width: "100%" }}>
                {formState === 1 && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="fullname"
                    label="Full Name"
                    name="fullname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}

                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleAuth}
                >
                  {formState === 0 ? "Login" : "Register"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}
