import React, { ReactElement, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { BublrUser, BublrAccountType, UserContext } from "../../types/bubble-types";
import styles from "./styles.module.css";
import PageContainer from "../../components/PageContainer";
import { Link, useNavigate } from "react-router-dom";
import { getLocalStorageItem, setLocalStorageItem } from "../../utils/localStorage";
import { IconButton, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
  const [accountType, setAccountType] = useState(BublrAccountType.Standard);
  const [error, setError] = useState({ error: false, input: "" });
  const [showPassword, setShowPassword] = useState(false);
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
      const existingHandle = users.find(user => user.handle === handle);
      const existingEmail = users.find(user => user.email === email);

      if (existingHandle) {
        setError({ error: true, input: "handle" });
        return;
      }
      if (existingEmail) {
        setError({ error: true, input: "email" });
        return;
      }

      const id = uuidv4();
      const user: BublrUser = {
        id,
        displayName,
        handle,
        email,
        password,
        accountType,
      };
      setLocalStorageItem('users', [...users, user]);
      const userContext: UserContext = {
        loggedIn: true,
        user,
      };
      setUserContext(userContext);
      navigate("/bubbles");
      setError({ error: false, input: "" });
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
          {error.error && (
            <div className={styles.errorPhrase}>The {error.input} you entered is already in use.</div>
          )}
          <TextField
            variant="outlined"
            size="small"
            label="Display name"
            type="text"
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
            error={error.error && error.input === "handle"}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error.error && error.input === "email"}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            size="small"
            label="Account type"
            variant="outlined"
            select
            className={styles.input}
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as BublrAccountType)}
          >
            <MenuItem value={BublrAccountType.Standard}>{BublrAccountType.Standard}</MenuItem>
            <MenuItem value={BublrAccountType.Premium}>{BublrAccountType.Premium}</MenuItem>
            <MenuItem value={BublrAccountType.Business}>{BublrAccountType.Business}</MenuItem>
          </TextField>
          <div className={styles.alreadyHaveAnAccount}>Already have an account? <Link to={"/login"} className={styles.registerText}>Login</Link></div>
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