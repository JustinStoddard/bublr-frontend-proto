import React from 'react';
import { BubbleMessage, BublrUser } from '../../types/bubble-types';
import styles from "./styles.module.css";
import { getLocalStorageItem } from '../../utils/localStorage';

type Props = {
  message: BubbleMessage;
};

const BubbleMessageText = ({ message }: Props) => {
  const users = getLocalStorageItem('users', []) as BublrUser[];
  const user = users.find(user => user.id === message.ownerId);

  return (
    <div key={message.id} className={styles.messageContainer}>
      <p>{message.createdAt}</p>
      <h1>{message.content}</h1>
    </div>
  );
};

export default BubbleMessageText;