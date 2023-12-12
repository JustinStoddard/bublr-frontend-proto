import React, { ReactNode } from "react";
import { Container } from "@mui/material";

import styles from "./styles.module.css";

type Props = {
  children: ReactNode;
};

const PageContainer = ({ children }: Props) => {
  return (
    <Container
      maxWidth="sm"
      className={styles.pageContainer}
    >
      {children}
    </Container>
  );
};

export default PageContainer;