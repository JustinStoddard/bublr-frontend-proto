import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from "./styles.module.css";
import PageContainer from "../../components/PageContainer";
import { Add, ChevronLeft } from "@mui/icons-material";
import { TextField } from "@mui/material";
import mapboxgl, { Map, Marker, GeoJSONSource } from 'mapbox-gl';
import useLocalStorage from "../../hooks/useLocalStorage";
 
mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGluLXN0b2RkYXJkIiwiYSI6ImNscTIxajJ4djAwdHgycnMyeW0yeXNzdG8ifQ.Fo2r-RxjpR8GJ7a6cq7gPg';

type Bubble = {
  bubbleId: string;
  bubbleName: string;
  bubbleLongitude: number;
  bubbleLatitude: number;
  bubbleRadius: number;
};

const BubblesPage = () => {
  const [storedItem, setStoredItem] = useLocalStorage('bubbles', []);
  const [creatingBubble, setCreatingBubble] = useState<boolean>(false);
  const [buttonPillOpen, setButtonPillOpen] = useState<boolean>(true);
  const [showMarker, setShowMarker] = useState<boolean>(false);
  const [bubbleLongitude, setBubbleLongitude] = useState(-111.8855);
  const [bubbleLatitude, setBubbleLatitude] = useState(40.7623);
  const [bubbleName, setBubbleName] = useState("");
  const [bubbleRadius, setBubbleRadius] = useState(0.5); //Radius in miles
  const [map, setMap] = useState<Map | null>(null);
  const [marker, setMarker] = useState<Marker | null>(null);

  useEffect(() => {
    const initializeMap = () => {
      const lng = bubbleLongitude;
      const lat = bubbleLatitude;
      const mapInstance = new Map({
        container: "map",
        style: 'mapbox://styles/justin-stoddard/clq21l1m300bt01mrawpm5ijl',
        center: [lng, lat],
        zoom: 12
      });
  
      mapInstance.on("load", () => {
        setMap(mapInstance);
        addCircleLayer(mapInstance);
        addMarker(mapInstance);
        renderBubbles(mapInstance);
        renderMarkers(mapInstance);
      });
    };

    if (!map) {
      initializeMap();
    }
  }, [map]);

  useEffect(() => {
    if (map) {
      map.on("move", () => {
        updateMarkerPosition();
      });
      map.on('zoom', () => {
        updateCircleRadius(bubbleRadius);
      });
      // map.on('touchstart', () => {
      //   setButtonPillOpen(false);
      // });
      // map.on('touchend', () => {
      //   setButtonPillOpen(true);
      // });
    }
  }, [map, bubbleRadius, creatingBubble]);

  useEffect(() => {
    updateCircleRadius(bubbleRadius);
  }, [bubbleRadius, creatingBubble]);

  useEffect(() => {
    if (marker && map) {
      if (showMarker) {
        marker.addTo(map);
        map.setPaintProperty('circle-layer-1', 'circle-opacity', 0.3);
        map.setPaintProperty('circle-layer-1', 'circle-stroke-width', 2);
      } else {
        marker.remove();
        map.setPaintProperty('circle-layer-1', 'circle-opacity', 0.0);
        map.setPaintProperty('circle-layer-1', 'circle-stroke-width', 0);
      }
    }
  }, [marker, map, showMarker]);

  const renderBubbles = (mapInstance: Map) => {
    const bubbles = storedItem as Bubble[];
    bubbles.map(bubble => {
      mapInstance.addSource(`circle-source-${bubble.bubbleId}`, {
        type: 'geojson',
        data: {
          type: "Feature",
          properties: null,
          geometry: {
            type: "Point",
            coordinates: [bubble.bubbleLongitude, bubble.bubbleLatitude]
          }
        }
      });

      mapInstance.addLayer({
        id: `circle-layer-${bubble.bubbleId}`,
        type: "circle",
        source: `circle-source-${bubble.bubbleId}`,
        paint: {
          'circle-radius': calculateRadius(mapInstance.getZoom(), bubble.bubbleRadius), // Radius in meters (adjust as needed)
          'circle-color': '#006DAA', // Circle color
          'circle-opacity': 0.3, // Circle opacity
          'circle-stroke-color': '#006DAA',
          'circle-stroke-width': 2,
        },
      });
    });
  };

  const renderMarkers = (mapInstance: Map) => {
    const bubbles = storedItem as Bubble[];
    bubbles.map(bubble => {
      new mapboxgl.Marker({ color: "#006DAA" }).setLngLat([bubble.bubbleLongitude, bubble.bubbleLatitude]).addTo(mapInstance).getElement().addEventListener('click', () => {
        flyTo(mapInstance, bubble);
      });
    });
  };

  const flyTo = (mapInstance: Map, bubble: Bubble) => {
    mapInstance.flyTo({
      center: [bubble.bubbleLongitude, bubble.bubbleLatitude],
      zoom: 12, // You can adjust the zoom level here
      essential: true,
    });
  };

  const renderBubble = (bubble: Bubble, mapInstance: Map) => {
    mapInstance.addSource(`circle-source-${bubble.bubbleId}`, {
      type: 'geojson',
      data: {
        type: "Feature",
        properties: null,
        geometry: {
          type: "Point",
          coordinates: [bubble.bubbleLongitude, bubble.bubbleLatitude]
        }
      }
    });

    mapInstance.addLayer({
      id: `circle-layer-${bubble.bubbleId}`,
      type: "circle",
      source: `circle-source-${bubble.bubbleId}`,
      paint: {
        'circle-radius': calculateRadius(mapInstance.getZoom(), bubble.bubbleRadius), // Radius in meters (adjust as needed)
        'circle-color': '#006DAA', // Circle color
        'circle-opacity': 0.3, // Circle opacity
        'circle-stroke-color': '#006DAA',
        'circle-stroke-width': 2,
      },
    });
    new mapboxgl.Marker({ color: "#006DAA" }).setLngLat([bubble.bubbleLongitude, bubble.bubbleLatitude]).addTo(mapInstance).getElement().addEventListener('click', () => {
      flyTo(mapInstance, bubble);
    });
  };

  const calculateRadius = (zoom: number, radius: number): number => {
    const milesToMeters = 1609.34; // Conversion factor from miles to meters
    const metersPerPixel = (40075016.686 / Math.pow(2, zoom)) / 256; // Earth's circumference / 2^zoom / 256
    const meters = radius * milesToMeters;
    return (meters / metersPerPixel) || 1; // Radius in pixels
  };

  const updateCircleRadius = (newRadius: number) => {
    if (map) {
      map.setPaintProperty('circle-layer-1', 'circle-radius', calculateRadius(map.getZoom(), newRadius));
      const bubbles = storedItem as Bubble[];
      bubbles.map(bubble => {
        map.setPaintProperty(`circle-layer-${bubble.bubbleId}`, 'circle-radius', calculateRadius(map.getZoom(), bubble.bubbleRadius));
      });
    }
  };

  const updateMarkerPosition = () => {
    if (marker && map) {
      const center = map.getCenter();
      marker.setLngLat(center);
      setBubbleLongitude(center.lng);
      setBubbleLatitude(center.lat);
      (map.getSource('circle-source') as GeoJSONSource).setData({
        type: 'Feature',
        properties: null,
        geometry: {
          type: 'Point',
          coordinates: [center.lng, center.lat],
        },
      });
    }
  };

  const addMarker = (mapInstance: Map) => {
    const lng = bubbleLongitude;
    const lat = bubbleLatitude;
    const newMarker = new mapboxgl.Marker({ color: "#006DAA" }).setLngLat([lng, lat]).addTo(mapInstance);
    setMarker(newMarker);
  };

  const addCircleLayer = (mapInstance: Map) => {
    const lng = bubbleLongitude;
    const lat = bubbleLatitude;
    mapInstance.addSource('circle-source', {
      type: 'geojson',
      data: {
        type: "Feature",
        properties: null,
        geometry: {
          type: "Point",
          coordinates: [lng, lat]
        }
      }
    });

    mapInstance.addLayer({
      id: 'circle-layer-1',
      type: "circle",
      source: "circle-source",
      paint: {
        'circle-radius': calculateRadius(mapInstance.getZoom(), bubbleRadius), // Radius in meters (adjust as needed)
        'circle-color': '#006DAA', // Circle color
        'circle-opacity': 0, // Circle opacity
        'circle-stroke-color': '#006DAA',
        'circle-stroke-width': 0,
      },
    });
  };

  const createBubble = () => {
    const bubbleId = uuidv4();
    console.log({
      bubbleId,
      bubbleName,
      bubbleLongitude,
      bubbleLatitude,
      bubbleRadius,
    });
    const bubble: Bubble = {
      bubbleId,
      bubbleName,
      bubbleLongitude,
      bubbleLatitude,
      bubbleRadius,
    };
    setStoredItem([...storedItem, bubble] as any);
    setCreatingBubble(false);
    setBubbleName("");
    setShowMarker(false);
    setButtonPillOpen(false);
    setBubbleRadius(0.5);
    renderBubble(bubble, map as Map);
  };

  const longitudeOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBubbleLongitude(e.currentTarget.valueAsNumber);
  };

  const latitudeOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBubbleLatitude(e.currentTarget.valueAsNumber);
  };

  const radiusOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBubbleRadius(e.currentTarget.valueAsNumber);
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
            onClick={() => {
              if (!creatingBubble) {
                setCreatingBubble(true);
                setButtonPillOpen(true);
                setShowMarker(true);
              }
            }}
          >
            <div className={`${styles.circle} ${creatingBubble ? styles.circleDisabled : ""}`} />
            <Add className={`${styles.addIcon} ${creatingBubble ? styles.addIconDisabled : ""}`} />
          </div>
        </div>
        <div id="map" className={styles.mapContainer} />
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
                <div className={styles.upperInputsContainer}>
                  <TextField
                    variant="outlined"
                    label="Name"
                    size="small"
                    value={bubbleName}
                    onChange={(e) => setBubbleName(e.target.value)}
                    className={styles.nameInput}
                  />
                  <TextField
                    variant="outlined"
                    label="Radius (mi)"
                    size="small"
                    type="number"
                    value={bubbleRadius}
                    onChange={radiusOnChange}
                    className={styles.radiusInput}
                  />
                </div>
                <TextField
                  variant="outlined"
                  label="Longitude"
                  size="small"
                  type="number"
                  value={bubbleLongitude}
                  onChange={longitudeOnChange}
                  className={styles.input}
                />
                <TextField
                  variant="outlined"
                  label="Latitude"
                  size="small"
                  type="number"
                  value={bubbleLatitude}
                  onChange={latitudeOnChange}
                  className={styles.input}
                />
                <div className={styles.buttonsContainer}>
                  <div
                    className={`${styles.button} ${styles.cancel}`}
                    onClick={() => {
                      setCreatingBubble(false);
                      setShowMarker(false);
                    }}
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