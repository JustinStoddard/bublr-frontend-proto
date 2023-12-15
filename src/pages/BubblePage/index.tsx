import React, { Fragment, useEffect, useState } from "react";
import PageContainer from "../../components/PageContainer";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import styles from "./styles.module.css"
import { getLocalStorageItem, setLocalStorageItem } from "../../utils/localStorage";
import { Bubble, BubbleMessage, UserContext } from "../../types/bubble-types";
import { ArrowBack, Send, Settings } from "@mui/icons-material";
import { TextField } from "@mui/material";
import { getMessages } from "../../utils/getMessages";
import BubbleMessageText from "../../components/BubbleMessageText";

type Props = {
  userContext: UserContext;
};

const BubblePage = ({ userContext }: Props) => {
  const navigate = useNavigate();
  const { bubbleId } = useParams();
  const bubbles = getLocalStorageItem("bubbles", []) as Bubble[];
  const bubble = bubbles.find(bubble => bubble.id === bubbleId);
  const bubbleMessages = getLocalStorageItem("bubbleMessages", []) as BubbleMessage[];
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userContext.loggedIn) {
      navigate("/login");
    }
  }, []);

  const navigateBack = () => {
    navigate(`/bubbles?lng=${bubble?.bubbleLongitude}&lat=${bubble?.bubbleLatitude}`);
  };

  const sendMessage = () => {
    if (message.length > 0 && bubble) {
      const messageId = uuidv4();
      const newBubbleMessage: BubbleMessage = {
        id: messageId,
        ownerId: userContext.user?.id || "",
        parentBubbleId: bubble.id,
        content: message,
        createdAt: new Date().toISOString(),
      };
      setLocalStorageItem("bubbleMessages", [...bubbleMessages, newBubbleMessage] as any);
      setMessage("");
    }
  };

  const messages = getMessages(bubble?.id || "");

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
              <div className={styles.bubbleTitle}>{(bubble?.bubbleName.length || 0) > 21 ? `${bubble?.bubbleName.substring(0, 21)}...` : bubble?.bubbleName}</div>
              <div className={styles.bubbleSubTitle}>1 Active User * 0 Active Vendors</div>
            </div>
          </div>
          <Settings className={styles.settingsIcon} />
        </div>
        <div className={styles.chatContainer}>
          {messages.map(message => (
            <Fragment key={message.id}>
              <BubbleMessageText message={message} />
            </Fragment>
          ))}
        </div>
        <div className={styles.footerContainer}>
          <TextField
            variant="outlined"
            size="small"
            label={`Message ${bubble?.bubbleName || ""}`}
            className={styles.messageInput}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div
            className={styles.iconContainer}
            onClick={sendMessage}
          >
            <Send className={`${styles.sendIcon} ${message.length === 0 ? styles.disabled: ""}`} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default BubblePage;