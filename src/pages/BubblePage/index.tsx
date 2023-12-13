import React from "react";
import PageContainer from "../../components/PageContainer";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./styles.module.css"
import { getLocalStorageItem } from "../../utils/localStorage";
import { Bubble } from "../../types/bubble-types";
import { ArrowBack, Settings } from "@mui/icons-material";

const BubblePage = () => {
  const navigate = useNavigate();
  const { bubbleId } = useParams();
  const bubbles = getLocalStorageItem("bubbles", []) as Bubble[];
  const bubble = bubbles.find(bubble => bubble.bubbleId === bubbleId);

  const navigateBack = () => {
    navigate(`/bubbles?lng=${bubble?.bubbleLongitude}&lat=${bubble?.bubbleLatitude}`);
  };

  return (
    <PageContainer>
      <div className={styles.bubblePageContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeftContainer}>
            <div
              className={styles.backIconContainer}
              onClick={navigateBack}
            >
              <ArrowBack className={styles.backIcon} />
            </div>
            <div className={styles.headerTitleContainer}>
              <div className={styles.bubbleTitle}>{bubble?.bubbleName}</div>
              <div className={styles.bubbleSubTitle}>1 Active User * 0 Active Vendors</div>
            </div>
          </div>
          <Settings className={styles.settingsIcon} />
        </div>
        <div className={styles.chatContainer}>
          <h1>{bubble?.bubbleId}</h1>
          <h1>{bubble?.bubbleName}</h1>
          <h1>{bubble?.bubbleRadius}</h1>
        </div>
        <div className={styles.footerContainer}>

        </div>
      </div>
    </PageContainer>
  );
};

export default BubblePage;