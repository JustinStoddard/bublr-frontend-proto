import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from "./styles.module.css";
import PageContainer from "../../components/PageContainer";
import { Add, Close, Done } from "@mui/icons-material";
import { Slider, TextField } from "@mui/material";
import mapboxgl, { Map, Marker, GeoJSONSource } from 'mapbox-gl';
import { getLocalStorageItem, setLocalStorageItem } from "../../utils/localStorage";
import { useLocation, useNavigate } from "react-router-dom";
import { Bubble, BubbleMessage, UserContext } from "../../types/bubble-types";
import { getBubbles } from "../../utils/getBubbles";
import NavigationHeader from "../../components/NavigationHeader";
import NavigationFooter from "../../components/NavigationFooter";
 
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
  const [buttonPillAlwaysClosed, setButtonPillAlwaysClosed] = useState<boolean>(false);
  const [showMarker, setShowMarker] = useState<boolean>(false);
  const [showCreateBubbleModul, setShowCreateBubbleModul] = useState<boolean>(() => {
    const bubbles = getBubbles(userContext.user?.id as string);
    if (bubbles.length === 0) return true;
    return false;
  });
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

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new Map({
        container: "map",
        style: 'mapbox://styles/justin-stoddard/clq21l1m300bt01mrawpm5ijl',
        center: [bubbleLongitude, bubbleLatitude],
        zoom: 11,
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
        setButtonPillOpen(false);
      });
      map.on('dragend', () => {
        setButtonPillOpen(true);
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
      zoom: 11, // You can adjust the zoom level here
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
    flyTo(map as Map, bubble);
    setShowCreateBubbleModul(false);
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
    if (filteredBubbles.length === 0) {
      setShowCreateBubbleModul(true);
    }
  };

  const visitBubble = (focusedBubble: Bubble) => {
    navigate(`/bubbles/${focusedBubble.id}`);
    setBubbleFocused(null);
    setActiveMarker(null);
  };

  return (
    <PageContainer>
      <div className={styles.bubblePageContainer}>
        <NavigationHeader
          userContext={userContext}
          setUserContext={setUserContext}
          creatingBubble={creatingBubble}
          createBubble={() => {
            if (!creatingBubble) {
              setCreatingBubble(true);
              setButtonPillOpen(true);
              setShowMarker(true);
            }
          }}
        />
        <div className={styles.mapContainer}>
          {(showCreateBubbleModul && !creatingBubble) && (
            <>
              <div className={styles.noBubblesModulOverlay} />
              <div className={styles.noBubblesModulContainer}>
                <div className={styles.noBubblesIconContainer}>
                  <div className={styles.noBubblesCircle} />
                  <Add className={styles.noBubblesAddIcon} />
                </div>
                <div className={styles.noBubblesHeader}>Create your first bubble!</div>
                <div className={styles.noBubblesSubHeader}>Connect with your community, discover exciting events, and meet amazing people!</div>
                <div
                  className={styles.noBubblesButton}
                  onClick={() => {
                    setCreatingBubble(true);
                    setButtonPillOpen(true);
                    setShowMarker(true);
                  }}
                >
                  <div className={styles.noBubblesButtonText}>Create bubble</div>
                </div>
              </div>
            </>
          )}
          <div id="map" className={styles.map} />
          {creatingBubble && (
            <div className={styles.createBubblePillContainer}>
              <div className={styles.bubblePillButtonContainer}>
                <div
                  className={styles.pillButton}
                  onClick={() => setButtonPillAlwaysClosed(!buttonPillAlwaysClosed)}
                />
              </div>
              <div className={`${buttonPillOpen && !buttonPillAlwaysClosed ? styles.bubblePillControlsContainerOpen : styles.bubblePillControlsContainerClosed}`}>
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
                  <div
                    className={`${styles.button} ${styles.cancel}`}
                    onClick={() => {
                      setCreatingBubble(false);
                      setShowMarker(false);
                    }}
                  >
                    <Close />
                  </div>
                  <div
                    className={`${styles.button} ${styles.create} ${bubbleName === "" ? styles.createDisabled : ""}`}
                    onClick={() => {
                      if (bubbleName !== "") createBubble();
                    }}
                  >
                    <Done />
                  </div>
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
              </div>
            </div>
          )}
          {(bubbleFocused && !creatingBubble) && (
            <div className={styles.bubbleFocusedContainer}>
              <div className={styles.bubbleFocusedName}>{bubbleFocused.bubbleName}</div>
              <div className={styles.bubbleFocusedRadius}>Radius: {bubbleFocused.bubbleRadius} miles</div>
              <div className={styles.bubbleFocusedButtonsContainer}>
                <div
                  className={`${styles.button} ${styles.cancel} ${styles.pill}`}
                  onClick={() => deleteBubble(bubbleFocused)}
                >
                  Delete
                </div>
                <div
                  className={`${styles.button} ${styles.create} ${styles.pill}`}
                  onClick={()  => visitBubble(bubbleFocused)}
                >
                  Message
                </div>
              </div>
            </div>
          )}
        </div>
        <NavigationFooter />
      </div>
    </PageContainer>
  );
};

export default BubblesPage;