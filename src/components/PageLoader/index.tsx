import React from "react";
import styles from "./styles.module.css";
import { CircularProgress } from "@mui/material";

const PageLoader = () => {
  return (
    <div className={styles.pageLoaderContainer}>
      <div className={styles.subLoaderContainer}>
        <CircularProgress
          className={styles.loader}
          size={150}
          thickness={3}
        />
        <div className={styles.dotsContainer}>
          <div className={styles.dot1} />
          <div className={styles.dot2} />
          <div className={styles.dot3} />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;