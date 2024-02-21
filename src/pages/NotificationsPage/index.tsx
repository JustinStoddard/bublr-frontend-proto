import React from "react";
import styles from "./styles.module.css";
import PageContainer from "../../components/PageContainer";
import { UserContext } from "../../types/bubble-types";
import NavigationHeader from "../../components/NavigationHeader";
import NavigationFooter from "../../components/NavigationFooter";

type Props = {
  userContext: UserContext;
  setUserContext: (c: UserContext) => void;
};

const NotificationsPage = ({ userContext, setUserContext }: Props) => {
  return (
    <PageContainer>
      <div className={styles.notificationsPageContainer}>
        <NavigationHeader
          userContext={userContext}
          setUserContext={setUserContext}
        />
        <div className={styles.notificationsContentContainer}>
          <h1>Notifications</h1>
        </div>
        <NavigationFooter />
      </div>
    </PageContainer>
  );
};

export default NotificationsPage;