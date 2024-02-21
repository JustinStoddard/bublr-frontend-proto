import React from "react";
import styles from "./styles.module.css";
import { UserContext } from "../../types/bubble-types";
import PageContainer from "../../components/PageContainer";
import NavigationHeader from "../../components/NavigationHeader";
import NavigationFooter from "../../components/NavigationFooter";

type Props = {
  userContext: UserContext;
  setUserContext: (c: UserContext) => void;
};

const CommunitiesPage = ({ userContext, setUserContext }: Props) => {
  return (
    <PageContainer>
      <div className={styles.communitiesPageContainer}>
        <NavigationHeader
          userContext={userContext}
          setUserContext={setUserContext}
        />
        <div className={styles.communitiesContentContainer}>
          <h1>Communities</h1>
        </div>
        <NavigationFooter />
      </div>
    </PageContainer>
  );
};

export default CommunitiesPage;