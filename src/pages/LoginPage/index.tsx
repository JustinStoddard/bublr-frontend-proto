import React, { useEffect, useState } from "react";
import PageContainer from "../../components/PageContainer";
import { BublrUser, UserContext } from "../../types/bubble-types";

import styles from "./styles.module.css";
import { TextField } from "@mui/material";
import { getLocalStorageItem } from "../../utils/localStorage";
import { useNavigate } from "react-router-dom";

type Props = {
  userContext: UserContext;
  setUserContext: (c: UserContext) => void;
};

const LoginPage = ({ userContext, setUserContext }: Props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

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
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />
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