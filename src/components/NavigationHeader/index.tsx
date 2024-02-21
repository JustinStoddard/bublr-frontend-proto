import React, { useState } from "react";
import styles from "./styles.module.css";
import { BublrAccountType, UserContext } from "../../types/bubble-types";
import { useLocation, useNavigate } from "react-router-dom";
import { Add, Check, Logout } from "@mui/icons-material";

type Props = {
  userContext: UserContext;
  setUserContext: (c: UserContext) => void;
  creatingBubble?: boolean;
  createBubble?: () => void;
};

const NavigationHeader = ({ userContext, setUserContext, creatingBubble, createBubble }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userDrawerOpen, setUserDrawerOpen] = useState<boolean>(false);

  const handleLogout = () => {
    const userContext: UserContext = {
      loggedIn: false,
      user: null,
    };
    setUserContext(userContext);
    setUserDrawerOpen(false);
    navigate("/");
  };

  return (
    <>
      <div className={`${styles.userDrawerContainerClosed} ${userDrawerOpen ? styles.userDrawerContainerOpen : ""}`}>
        <div
          className={`${styles.userDrawerBackground} ${userDrawerOpen ? styles.userDrawerBackgroundOpen : ""}`}
          onClick={() => setUserDrawerOpen(false)}
        />
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${styles.userDrawer} ${userDrawerOpen ? styles.userDrawerOpen : ""}`}
        >
          <div className={styles.userDrawerContentContainer}>
            <div
              onClick={() => setUserDrawerOpen(true)}
              className={styles.userDrawerPhotoContainer}
            >
              <div className={styles.userDrawerText}>
                {userContext.user?.displayName.substring(0, 2)}
              </div>
            </div>
            <div className={styles.userDrawerTitleContainer}>
              <div className={styles.drawerDisplayName}>
                {userContext.user?.displayName}
                {userContext.user?.accountType === BublrAccountType.Premium && (
                  <div className={styles.premiumBadgeContainer}>
                    <Check className={styles.checkIcon} />
                  </div>
                )}
              </div>
              <div className={styles.drawerHandle}>{userContext.user?.handle}</div>
            </div>
          </div>
          <div
            onClick={handleLogout}
            className={styles.logoutContainer}
          >
            <div className={styles.logoutText}>Logout</div>
            <Logout className={styles.logoutIcon} />
          </div>
        </div>
      </div>
      <div className={styles.headerContainer}>
        <div
          onClick={() => setUserDrawerOpen(true)}
          className={styles.userPhotoContainer}
        >
          <div className={styles.userText}>
            {userContext.user?.displayName.substring(0, 2)}
          </div>
        </div>
        <div
          onClick={() => navigate("/")}
          className={styles.logoContainer}
        >
          <div className={styles.dotsContainer}>
            <div className={styles.dot1} />
            <div className={styles.dot2} />
            <div className={styles.dot3} />
          </div>
          <div className={styles.logo}>
            {location.pathname === "/bubbles" && (
              <>bublr<span className={styles.landingTitleSub}>proto</span></>
            )}
            {location.pathname === "/communities" && (
              "communities"
            )}
            {location.pathname === "/notifications" && (
              "notifications"
            )}
          </div>
        </div>
        {location.pathname === "/bubbles" ? (
          <div
            className={`${styles.createBubbleButtonContainer} ${creatingBubble ? styles.bubbleButtonDisabled : ""}`}
            onClick={createBubble}
          >
            <div className={`${styles.circle} ${creatingBubble ? styles.circleDisabled : ""}`} />
            <Add className={`${styles.addIcon} ${creatingBubble ? styles.addIconDisabled : ""}`} />
          </div>
        ) : (
          <div className={styles.createBubbleButtonContainer} />
        )}
      </div>
    </>
  );
};

export default NavigationHeader;