import React, { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
  children: ReactNode;
};

const PageContainer = ({ children }: Props) => {
  return (
    <div className={styles.pageContainer}>
      {children}
    </div>
  );
};

export default PageContainer;