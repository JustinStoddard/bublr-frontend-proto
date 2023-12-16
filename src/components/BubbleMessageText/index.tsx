import React, { useState } from 'react';
import { BubbleMessage, BublrAccountType, BublrUser } from '../../types/bubble-types';
import styles from "./styles.module.css";
import { Check, Delete, MoreHoriz } from '@mui/icons-material';

type Props = {
  message: BubbleMessage;
  user: BublrUser | null;
  dialogOpen: string;
  setDialogOpen: (id: string) => void;
  deleteMessage: (id: string) => void;
};

const BubbleMessageText = ({ message, user, dialogOpen, setDialogOpen, deleteMessage }: Props) => {

  const handleDeleteMessage = () => {
    deleteMessage(message.id);
    setDialogOpen("");
  };

  const calculateDaysSinceDate = (isoDateString: string) => {
    const currentDate = new Date();
    const date = new Date(isoDateString);

    // Calculate the difference in milliseconds
    const differenceInMs = currentDate.getTime() - date.getTime();

    // Convert milliseconds to days, hours, and minutes
    const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days !== 0) {
      return `${days}d`;
    } else if (hours !== 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const daysSinceSent = calculateDaysSinceDate(message.createdAt);
  const dialogIsOpen = dialogOpen === message.id;

  return (
    <div key={message.id} className={styles.messageContainer}>
      <div className={styles.messagePhotoContainer}>
        <div className={styles.messagePhotoText}>
          {user?.displayName.substring(0, 2)}
        </div>
      </div>
      <div className={styles.messageTextContainer}>
        <div className={styles.messageTextTitleContainer}>
          <div className={styles.messageDisplayName}>{user?.displayName}</div>
          {user?.accountType === BublrAccountType.Premium && (
            <div className={styles.premiumBadgeContainer}>
              <Check className={styles.checkIcon} />
            </div>
          )}
          <div className={styles.messageHandle}>{user?.handle}</div>
          <div className={styles.daysSince}>&#x2022; {daysSinceSent}</div>
        </div>
        <div className={styles.messageText}>{message.content}</div>
      </div>
      <div
        onClick={() => setDialogOpen(dialogOpen === "" ? message.id : "")}
        className={`${styles.dialogContainer} ${dialogIsOpen ? styles.dialogContainerActive : ""}`}
      >
        <MoreHoriz className={`${styles.dialog} ${dialogIsOpen ? styles.dialogActive : ""}`} />
      </div>
      {dialogIsOpen && (
        <div className={styles.dialogPopoutContainer}>
          <div
            onClick={handleDeleteMessage}
            className={styles.dialogOptionContainer}
          >
            <Delete className={styles.deleteIcon} />
            <div className={styles.dialogDelete}>Delete</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BubbleMessageText;