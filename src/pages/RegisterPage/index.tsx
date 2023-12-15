import React, { ReactElement, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { BublrUser, UserContext } from "../../types/bubble-types";
import styles from "./styles.module.css";
import PageContainer from "../../components/PageContainer";
import { useNavigate } from "react-router-dom";
import { getLocalStorageItem, setLocalStorageItem } from "../../utils/localStorage";
import { TextField } from "@mui/material";

type Props = {
  userContext: UserContext;
  setUserContext: (c: UserContext) => void;
};

const RegisterPage = ({ userContext, setUserContext }: Props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("@");
  const [displayName, setDisplayName] = useState("");
  const allInputsFilled = email.length !== 0 && password.length !== 0 && handle.length !== 0 && displayName.length !== 0;
  const oneInputNotFilled = email.length === 0 || password.length === 0 || handle.length === 0 || displayName.length === 0;

  useEffect(() => {
    if (userContext.loggedIn) {
      navigate("/bubbles");
    }
  }, []);

  const handleRegister = () => {
    if (allInputsFilled) {
      const users = getLocalStorageItem("users", []) as BublrUser[];
      const id = uuidv4();
      const user: BublrUser = {
        id,
        displayName,
        handle,
        email,
        password,
      };
      setLocalStorageItem('users', [...users, user]);
      const userContext: UserContext = {
        loggedIn: true,
        user,
      };
      setUserContext(userContext);
      navigate("/bubbles");
    }
  };

  const handleBublrHandleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Ensure @ symbol at the beginning
    if (value === '' || value.charAt(0) !== '@') {
      value = `@${value}`;
    }

    // Update state with the modified value
    setHandle(value);
  };

  return (
    <PageContainer>
      <div className={styles.registerPageContainer}>
        <div
          onClick={() => navigate("/")}
          className={styles.landingTitle}
        >
          bublr<span className={styles.landingTitleSub}>proto</span>
        </div>
        <div className={styles.inputsContainer}>
          <TextField
            variant="outlined"
            size="small"
            label="Display name"
            className={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Bublr handle"
            className={styles.input}
            value={handle}
            onChange={handleBublrHandleOnChange}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className={styles.buttonContainer}>
            <div
              className={`${styles.button} ${oneInputNotFilled ? styles.disabled : ""}`}
              onClick={handleRegister}
            >
              Register
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default RegisterPage;