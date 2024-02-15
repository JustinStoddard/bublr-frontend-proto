import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from "./styles.module.css";
import PageContainer from "../../components/PageContainer";
import { Add, Check, ChevronLeft, Logout } from "@mui/icons-material";
import { Slider, TextField } from "@mui/material";
import mapboxgl, { Map, Marker, GeoJSONSource } from 'mapbox-gl';
import { getLocalStorageItem, setLocalStorageItem } from "../../utils/localStorage";
import { useLocation, useNavigate } from "react-router-dom";
import { Bubble, BubbleMessage, BublrAccountType, UserContext } from "../../types/bubble-types";
import { getBubbles } from "../../utils/getBubbles";
 
mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGluLXN0b2RkYXJkIiwiYSI6ImNscTIxajJ4djAwdHgycnMyeW0yeXNzdG8ifQ.Fo2r-RxjpR8GJ7a6cq7gPg';

type Props = {
  userContext: UserContext;
  setUserContext: (c: UserContext) => void;
};

const BubblesPage = ({ userContext, setUserContext }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const lng = queryParams.get('lng') !== undefined ? parseFloat(queryParams.get('lng') || "0") : false;
  const lat = queryParams.get('lng') !== undefined ? parseFloat(queryParams.get('lat') || "0") : false;

  const [creatingBubble, setCreatingBubble] = useState<boolean>(false);
  const [buttonPillOpen, setButtonPillOpen] = useState<boolean>(true);
  const [showMarker, setShowMarker] = useState<boolean>(false);
  const [bubbleLongitude, setBubbleLongitude] = useState(() => {
    const bubbles = getBubbles(userContext.user?.id as string);
    if (lng) return lng;
    return bubbles[0]?.bubbleLongitude || -111.891751;
  });
  const [bubbleLatitude, setBubbleLatitude] = useState(() => {
    const bubbles = getBubbles(userContext.user?.id as string);
    if (lat) return lat;
    return bubbles[0]?.bubbleLatitude || 40.758578;
  });
  const [bubbleFocused, setBubbleFocused] = useState<Bubble | null>(() => {
    if (!lng && !lat) return null;
    const bubbles = getBubbles(userContext.user?.id as string);
    const bubble = bubbles.find(bubble => bubble.bubbleLongitude === bubbleLongitude && bubble.bubbleLatitude === bubbleLatitude);
    if (!bubble) return null;
    return bubble;
  });
  const [bubbleName, setBubbleName] = useState("");
  const [bubbleRadius, setBubbleRadius] = useState(0.5); //Radius in miles
  const [map, setMap] = useState<Map | null>(null);
  const [marker, setMarker] = useState<Marker | null>(null);
  const [activeMarker, setActiveMarker] = useState<Marker | null>(null);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new Map({
        container: "map",
        style: 'mapbox://styles/justin-stoddard/clq21l1m300bt01mrawpm5ijl',
        center: [bubbleLongitude, bubbleLatitude],
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

    if (!userContext.loggedIn) {
      navigate("/login");
    } else {
      if (!map) {
        initializeMap();
      }
    }
  }, [map]);

  useEffect(() => {
    if (map) {
      map.on("move", () => updateMarkerPosition());
      map.on('zoom', () => {
        updateCircleRadius(bubbleRadius);
      });
      map.on('touchstart', () => {
        setBubbleFocused(null);
        setActiveMarker(null);
      });
      map.on('dragstart', () => {
        setBubbleFocused(null);
        setActiveMarker(null);
      });
    }
  }, [map, bubbleRadius, creatingBubble, bubbleFocused]);

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
    const bubbles = getBubbles(userContext.user?.id || "");
    bubbles.map(bubble => {
      mapInstance.addSource(`circle-source-${bubble.id}`, {
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
        id: `circle-layer-${bubble.id}`,
        type: "circle",
        source: `circle-source-${bubble.id}`,
        paint: {
          'circle-radius': calculateRadius(mapInstance.getZoom(), bubble.bubbleRadius), // Radius in meters (adjust as needed)
          'circle-color': '#006DAA', // Circle color
          'circle-opacity': 0.3, // Circle opacity
          'circle-stroke-color': '#006DAA',
          'circle-stroke-width': 2,
        },
      });

      return;
    });
  };

  const renderMarkers = (mapInstance: Map) => {
    const bubbles = getBubbles(userContext.user?.id || "");
    bubbles.map(bubble => {
      const marker = new mapboxgl.Marker({ color: "#006DAA" }).setLngLat([bubble.bubbleLongitude, bubble.bubbleLatitude]).addTo(mapInstance);
      marker.getElement().addEventListener('click', () => {
        flyTo(mapInstance, bubble);
        setActiveMarker(marker);
      });
      return;
    });
  };

  const flyTo = (mapInstance: Map, bubble: Bubble) => {
    setBubbleFocused(bubble);
    mapInstance.flyTo({
      center: [bubble.bubbleLongitude, bubble.bubbleLatitude],
      zoom: 10, // You can adjust the zoom level here
      essential: true,
    });
  };

  const renderBubble = (bubble: Bubble, mapInstance: Map) => {
    mapInstance.addSource(`circle-source-${bubble.id}`, {
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
      id: `circle-layer-${bubble.id}`,
      type: "circle",
      source: `circle-source-${bubble.id}`,
      paint: {
        'circle-radius': calculateRadius(mapInstance.getZoom(), bubble.bubbleRadius), // Radius in meters (adjust as needed)
        'circle-color': '#006DAA', // Circle color
        'circle-opacity': 0.3, // Circle opacity
        'circle-stroke-color': '#006DAA',
        'circle-stroke-width': 2,
      },
    });
    const marker = new mapboxgl.Marker({ color: "#006DAA" }).setLngLat([bubble.bubbleLongitude, bubble.bubbleLatitude]).addTo(mapInstance)
    marker.getElement().addEventListener('click', () => {
      flyTo(mapInstance, bubble);
      setActiveMarker(marker);
      return;
    });
  };

  const unrenderBubble = (bubble: Bubble, mapInstance: Map) => {
    mapInstance.removeLayer(`circle-layer-${bubble.id}`);
    mapInstance.removeSource(`circle-source-${bubble.id}`);
    activeMarker?.remove();
    setActiveMarker(null);
  };

  const calculateRadius = (zoom: number, radius: number): number => {
    const milesToMeters = 1609.34; // Conversion factor from miles to meters
    const metersPerPixel = (40075016.686 / Math.pow(2, zoom)) / 256; // Earth's circumference / 2^zoom / 256
    const meters = radius * milesToMeters;
    return (meters / metersPerPixel) * 2.6 || 1; // Times by 2.6
  };

  const updateCircleRadius = (newRadius: number) => {
    if (map) {
      const bubbles = getBubbles(userContext.user?.id || "");
      map.setPaintProperty('circle-layer-1', 'circle-radius', calculateRadius(map.getZoom(), newRadius));
      bubbles.map((bubble: Bubble) => {
        if (map.getLayer(`circle-layer-${bubble.id}`) !== null) map.setPaintProperty(`circle-layer-${bubble.id}`, 'circle-radius', calculateRadius(map.getZoom(), bubble.bubbleRadius));
        return;
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
    const id = uuidv4();
    const bubble: Bubble = {
      id,
      ownerId: userContext.user?.id || "",
      bubbleName,
      bubbleLongitude,
      bubbleLatitude,
      bubbleRadius,
    };
    const bubbles = getLocalStorageItem("bubbles", []) as Bubble[];
    setLocalStorageItem("bubbles", [...bubbles, bubble] as any);
    setCreatingBubble(false);
    setBubbleName("");
    setShowMarker(false);
    setButtonPillOpen(false);
    setBubbleRadius(0.5);
    renderBubble(bubble, map as Map);
    setBubbleFocused(bubble);
  };

  const radiusOnChange = (newValue: number | number[]) => {
    setBubbleRadius(newValue as number);
  };

  const deleteBubble = (focusedBubble: Bubble) => {
    const bubbles = getLocalStorageItem("bubbles", []) as Bubble[];
    const filteredBubbles = bubbles.filter(bubble => {
      if (bubble.id !== focusedBubble.id) return bubble;
    });
    const bubbleMessages = getLocalStorageItem("bubbleMessages", []) as BubbleMessage[];
    const filteredBubbleMessages = bubbleMessages.filter(message => {
      if (message.parentBubbleId !== focusedBubble.id) return message;
    });
    setLocalStorageItem("bubbles", filteredBubbles as any);
    setLocalStorageItem("bubbleMessages", filteredBubbleMessages as any);
    unrenderBubble(focusedBubble, map as Map);
    setBubbleFocused(null);
    setActiveMarker(null);
  };

  const visitBubble = (focusedBubble: Bubble) => {
    navigate(`/bubbles/${focusedBubble.id}`);
    setBubbleFocused(null);
    setActiveMarker(null);
  };

  const handleLogout = () => {
    const userContext: UserContext = {
      loggedIn: false,
      user: null,
    };
    setUserContext(userContext);
    setUserDrawerOpen(false);
    navigate("/");
  };

  return (
    <PageContainer>
      <div className={styles.bubblePageContainer}>
        <div className={`${styles.userDrawerContainerClosed} ${userDrawerOpen ? styles.userDrawerContainerOpen : ""}`}>
          <div
            className={`${styles.userDrawerBackground} ${userDrawerOpen ? styles.userDrawerBackgroundOpen : ""}`}
            onClick={() => setUserDrawerOpen(false)}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${styles.userDrawer} ${userDrawerOpen ? styles.userDrawerOpen : ""}`}
          >
            <div className={styles.userDrawerContentContainer}>
              <div
                onClick={() => setUserDrawerOpen(true)}
                className={styles.userDrawerPhotoContainer}
              >
                <div className={styles.userDrawerText}>
                  {userContext.user?.displayName.substring(0, 2)}
                </div>
              </div>
              <div className={styles.userDrawerTitleContainer}>
                <div className={styles.drawerDisplayName}>
                  {userContext.user?.displayName}
                  {userContext.user?.accountType === BublrAccountType.Premium && (
                    <div className={styles.premiumBadgeContainer}>
                      <Check className={styles.checkIcon} />
                    </div>
                  )}
                </div>
                <div className={styles.drawerHandle}>{userContext.user?.handle}</div>
              </div>
            </div>
            <div
              onClick={handleLogout}
              className={styles.logoutContainer}
            >
              <div className={styles.logoutText}>Logout</div>
              <Logout className={styles.logoutIcon} />
            </div>
          </div>
        </div>
        <div className={styles.headerContainer}>
          <div
            onClick={() => setUserDrawerOpen(true)}
            className={styles.userPhotoContainer}
          >
            <div className={styles.userText}>
              {userContext.user?.displayName.substring(0, 2)}
            </div>
          </div>
          <div
            onClick={() => navigate("/")}
            className={styles.logoContainer}
          >
            <div className={styles.dotsContainer}>
              <div className={styles.dot1} />
              <div className={styles.dot2} />
              <div className={styles.dot3} />
            </div>
            <div className={styles.logo}>
              bublr<span className={styles.landingTitleSub}>proto</span>
            </div>
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
                    type="text"
                    value={bubbleName}
                    onChange={(e) => setBubbleName(e.target.value)}
                    className={styles.nameInput}
                  />
                </div>
                <div className={styles.lowerInputsContainer}>
                  <div className={styles.sliderLabel}>Radius</div>
                  <Slider
                    size="medium"
                    defaultValue={0.5}
                    valueLabelFormat={(value: number) => `${value} mi`}
                    valueLabelDisplay="auto"
                    value={bubbleRadius}
                    onChange={(_, newValue: number | number[], __) => radiusOnChange(newValue)}
                    step={0.1}
                    min={0.1}
                    max={3}
                    className={styles.sliderInput}
                  />
                </div>
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
                    className={`${styles.button} ${styles.create} ${bubbleName === "" ? styles.createDisabled : ""}`}
                    onClick={() => {
                      if (bubbleName !== "") createBubble();
                    }}
                  >
                    Create
                  </div>
                </div>
              </div>
            </div>
          )}
          {(bubbleFocused && !creatingBubble) && (
            <div className={styles.bubbleFocusedContainer}>
              <div className={styles.bubbleFocusedName}>{bubbleFocused.bubbleName}</div>
              <div className={styles.bubbleFocusedRadius}>Radius: {bubbleFocused.bubbleRadius} miles</div>
              <div className={styles.bubbleFocusedRadius}>Lng: {bubbleFocused.bubbleLongitude}</div>
              <div className={styles.bubbleFocusedRadius}>Lat: {bubbleFocused.bubbleLatitude}</div>
              <div className={styles.bubbleFocusedButtonsContainer}>
                <div
                  className={`${styles.button} ${styles.cancel}`}
                  onClick={() => deleteBubble(bubbleFocused)}
                >
                  Delete
                </div>
                <div
                  className={`${styles.button} ${styles.create}`}
                  onClick={()  => visitBubble(bubbleFocused)}
                >
                  Visit
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