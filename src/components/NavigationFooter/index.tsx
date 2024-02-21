import React from "react";
import styles from "./styles.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Groups, GroupsOutlined, Home, HomeOutlined, Notifications, NotificationsOutlined, Public, PublicOutlined } from "@mui/icons-material";

const NavigationFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={styles.footerContainer}>
      <div onClick={() => navigate("/bubbles")}>
        {location.pathname === "/bubbles" ? (
          <Home className={styles.lowerNavButton} />
        ) : (
          <HomeOutlined className={styles.lowerNavButton} />
        )}
      </div>
      <div onClick={() => navigate("/communities")}>
        {location.pathname === "/communities" ? (
          <Groups className={styles.lowerNavButton} />
        ) : (
          <GroupsOutlined className={styles.lowerNavButton} />
        )}
      </div>
      <div onClick={() => navigate("/notifications")}>
        {location.pathname === "/notifications" ? (
          <Notifications className={styles.lowerNavButton} />
        ) : (
          <NotificationsOutlined className={styles.lowerNavButton} />
        )}
      </div>
    </div>
  );
};

export default NavigationFooter;