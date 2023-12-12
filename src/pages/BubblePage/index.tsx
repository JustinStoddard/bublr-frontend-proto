import React from "react";
import PageContainer from "../../components/PageContainer";
import { useParams } from "react-router-dom";

import styles from "styles.module.css"

const BubblePage = () => {
  const { bubbleId } = useParams();

  return (
    <PageContainer>
      <h1>BubblePage {bubbleId}</h1>
    </PageContainer>
  );
};

export default BubblePage;