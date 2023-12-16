import React, { useEffect, useState } from "react";
import PageContainer from "../../components/PageContainer";
import { BublrUser, UserContext } from "../../types/bubble-types";

import styles from "./styles.module.css";
import { IconButton, TextField } from "@mui/material";
import { getLocalStorageItem } from "../../utils/localStorage";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type Props = {
  userContext: UserContext;
  setUserContext: (c: UserContext) => void;
};

const LoginPage = ({ userContext, setUserContext }: Props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (userContext.loggedIn) {
      navigate("/bubbles");
    }
  }, []);

  const handleLogin = () => {
    if (email.length !== 0 && password.length !== 0) {
      const users = getLocalStorageItem("users", []) as BublrUser[];
      const user = users.find(user => user.email === email && user.password === password);
      if (!user) {
        setError(true);
        return;
      }
      const userContext: UserContext = {
        loggedIn: true,
        user,
      };
      setUserContext(userContext);
      setError(false);
      navigate("/bubbles");
    }
  };

  return (
    <PageContainer>
      <div className={styles.loginPageContainer}>
        <div
          onClick={() => navigate("/")}
          className={styles.landingTitle}
        >
          <div className={styles.dotsContainer}>
            <div className={styles.dot1} />
            <div className={styles.dot2} />
            <div className={styles.dot3} />
          </div>
          bublr<span className={styles.landingTitleSub}>proto</span>
        </div>
        {error && (
          <div className={styles.errorPhrase}>Your email or password was incorrect.</div>
        )}
        <div className={styles.inputsContainer}>
          <TextField
            variant="outlined"
            size="small"
            label="Email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <div className={styles.dontHaveAnAccount}>Don't have an account? <Link to={"/register"} className={styles.registerText}>Register</Link></div>
          <div className={styles.buttonContainer}>
            <div
              className={`${styles.button} ${email.length === 0 || password.length === 0 ? styles.disabled : ""}`}
              onClick={handleLogin}
            >
              Login
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoginPage;