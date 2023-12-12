import React, { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import PageContainer from "../../components/PageContainer";
import { Add, ChevronLeft } from "@mui/icons-material";
import { TextField } from "@mui/material";
import mapboxgl from 'mapbox-gl';
 
mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGluLXN0b2RkYXJkIiwiYSI6ImNscTIxajJ4djAwdHgycnMyeW0yeXNzdG8ifQ.Fo2r-RxjpR8GJ7a6cq7gPg';

const BubblesPage = () => {
  const [creatingBubble, setCreatingBubble] = useState<boolean>(false);
  const [buttonPillOpen, setButtonPillOpen] = useState<boolean>(true);
  const [bubbleName, setBubbleName] = useState("");
  const [bubbleLongitude, setBubbleLongitude] = useState(-70.9);
  const [bubbleLatitude, setBubbleLatitude] = useState(42.35);
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current && mapContainer.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: 'mapbox://styles/justin-stoddard/clq21l1m300bt01mrawpm5ijl',
      center: [bubbleLongitude, bubbleLatitude],
      zoom: 9
    });
  }, []);

  const createBubble = () => {
    console.log({
      bubbleName,
      bubbleLongitude,
      bubbleLatitude,
    });
    setCreatingBubble(false);
    setBubbleName("");
    setBubbleLongitude(-70.9);
    setBubbleLatitude(42.35);
  };

  return (
    <PageContainer>
      <div className={styles.bubblePageContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.userPhotoContainer}>
            <div className={styles.userText}>
              JS
            </div>
          </div>
          <div className={styles.logoContainer}>
            <div className={styles.dotsContainer}>
              <div className={styles.dot1} />
              <div className={styles.dot2} />
              <div className={styles.dot3} />
            </div>
            <div className={styles.logo}>bublr</div>
          </div>
          <div
            className={`${styles.createBubbleButtonContainer} ${creatingBubble ? styles.bubbleButtonDisabled : ""}`}
            onClick={() => !creatingBubble ? setCreatingBubble(true) : null}
          >
            <div className={`${styles.circle} ${creatingBubble ? styles.circleDisabled : ""}`} />
            <Add className={`${styles.addIcon} ${creatingBubble ? styles.addIconDisabled : ""}`} />
          </div>
        </div>
        <div ref={mapContainer} className={styles.mapContainer} />
        <div className={styles.footerContainer}>
          {creatingBubble && (
            <div className={styles.createBubblePillContainer}>
              <div className={styles.bubblePillButtonContainer}>
                <div
                  className={styles.pillButton}
                  onClick={() => setButtonPillOpen(!buttonPillOpen)}
                >
                  <ChevronLeft className={`${buttonPillOpen ? styles.pillButtonIconOpen : styles.pillButtonIconClosed}`} />
                </div>
              </div>
              <div className={`${buttonPillOpen ? styles.bubblePillControlsContainerOpen : styles.bubblePillControlsContainerClosed}`}>
                <TextField
                  variant="outlined"
                  label="Name"
                  size="small"
                  value={bubbleName}
                  onChange={(e) => setBubbleName(e.target.value)}
                  className={styles.input}
                />
                <TextField
                  variant="outlined"
                  label="Longitude"
                  size="small"
                  value={bubbleLongitude}
                  onChange={(e) => setBubbleLongitude(parseFloat(e.target.value))}
                  className={styles.input}
                />
                <TextField
                  variant="outlined"
                  label="Latitude"
                  size="small"
                  value={bubbleLatitude}
                  onChange={(e) => setBubbleLatitude(parseFloat(e.target.value))}
                  className={styles.input}
                />
                <div className={styles.buttonsContainer}>
                  <div
                    className={`${styles.button} ${styles.cancel}`}
                    onClick={() => setCreatingBubble(false)}
                  >
                    Cancel
                  </div>
                  <div
                    className={`${styles.button} ${styles.create}`}
                    onClick={() => createBubble()}
                  >
                    Create
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default BubblesPage;