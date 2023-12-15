import React from "react";
import PageContainer from "../../components/PageContainer";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";


const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className={styles.landingPageContainer}>
        <div className={styles.landingTitle}>bublr<span className={styles.landingTitleSub}>proto</span></div>
        <div className={styles.buttonsContainer}>
          <div
            className={styles.button}
            onClick={() => navigate("/login")}
          >
            Login
          </div>
          <div
            className={styles.button}
            onClick={() => navigate("/register")}
          >
            Register
          </div>
        </div>
        <div className={styles.warningContainer}>
          <div className={styles.warning}>!WARNING!</div>
          <p>This is a prototype build of <span className={styles.subText}>bublr</span>. Its purpose is to generate leads and collect user feedback. You may encounter bugs or discover that your user, bubbles, and messages have all been deleted.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default LandingPage;