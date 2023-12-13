import React from "react";
import PageContainer from "../../components/PageContainer";
import { useParams } from "react-router-dom";

import styles from "./styles.module.css"
import { getLocalStorageItem } from "../../utils/localStorage";
import { Bubble } from "../../types/bubble-types";

const BubblePage = () => {
  const { bubbleId } = useParams();
  const bubbles = getLocalStorageItem("bubbles", []) as Bubble[];
  const bubble = bubbles.find(bubble => bubble.bubbleId === bubbleId);

  return (
    <PageContainer>
      <div className={styles.bubblePageContainer}>
        <div className={styles.headerContainer}>
          
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