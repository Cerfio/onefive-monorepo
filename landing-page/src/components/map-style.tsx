"use client";
import { useState, useEffect } from "react";
import Map, { Marker, Source, Layer, LayerProps } from "react-map-gl";
// import Image from "next/image";
import { lerp, easeInOutCubic, calculateBearing } from "@/lib/math";
import "mapbox-gl/dist/mapbox-gl.css";

import { mapLocations as path } from "@/data/map-locations";
import { typeStyles } from "@/data/mapLocations";
import { CustomPin } from "./custom-pin";

const MapStyle = () => {
  const [viewState, setViewState] = useState({
    latitude: path[0].latitude,
    longitude: path[0].longitude,
    zoom: 12,
    bearing: 0,
    pitch: 45,
  });

  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);

  const [routeProgress, setRouteProgress] = useState(0);

  const [showRoute, setShowRoute] = useState(false);

  const getRouteCoordinates = () => {
    const currentIndex = currentLocationIndex;
    const nextIndex = (currentIndex + 1) % path.length;

    const destinationType = path[nextIndex].type as keyof typeof typeStyles;
    const destinationColor = typeStyles[destinationType].pinColor;

    return {
      coordinates: [
        [path[currentIndex].longitude, path[currentIndex].latitude],
        [path[nextIndex].longitude, path[nextIndex].latitude],
      ],
      color: destinationColor,
    };
  };

  const routeLayer: LayerProps = {
    id: "route",
    type: "line",
    paint: {
      "line-color": getRouteCoordinates().color,
      "line-width": 3,
      "line-opacity": 0.8,
      "line-dasharray": [2, 2],
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  };

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;

    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const getTransitionDuration = (currentIndex: number, nextIndex: number) => {
      const distance = calculateDistance(
        path[currentIndex].latitude,
        path[currentIndex].longitude,
        path[nextIndex].latitude,
        path[nextIndex].longitude
      );

      const BASE_DURATION = 4000;
      const DISTANCE_FACTOR = 1000;
      return Math.min(BASE_DURATION + distance * DISTANCE_FACTOR, 12000);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;

      let totalDuration = 0;
      for (let i = 0; i < path.length; i++) {
        const nextIndex = (i + 1) % path.length;
        totalDuration += getTransitionDuration(i, nextIndex) + 3000;
      }

      const totalProgress = (elapsed % totalDuration) / totalDuration;
      const cycleProgress = totalProgress * path.length;
      const currentIndex = Math.floor(cycleProgress);
      const nextIndex = (currentIndex + 1) % path.length;
      const cyclePhase = cycleProgress - currentIndex;

      setCurrentLocationIndex(currentIndex);

      setShowRoute(true);

      const transitionProgress = cyclePhase;
      const easeProgress = easeInOutCubic(transitionProgress);

      setRouteProgress(easeProgress);

      const bearing = calculateBearing(
        path[currentIndex].latitude,
        path[currentIndex].longitude,
        path[nextIndex].latitude,
        path[nextIndex].longitude
      );

      const latitude = lerp(
        path[currentIndex].latitude,
        path[nextIndex].latitude,
        easeProgress
      );
      const longitude = lerp(
        path[currentIndex].longitude,
        path[nextIndex].longitude,
        easeProgress
      );

      const targetZoom = lerp(13.5, 12, easeProgress);
      const smoothZoom = lerp(viewState.zoom, targetZoom, 0.03);

      const targetBearing = calculateBearing(
        path[currentIndex].latitude,
        path[currentIndex].longitude,
        path[nextIndex].latitude,
        path[nextIndex].longitude
      );

      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
        bearing: lerp(prev.bearing, targetBearing, 0.05),
        zoom: smoothZoom,
        pitch: lerp(45, 50, Math.sin(elapsed / 2000) * 0.5 + 0.5),
      }));

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="w-full h-full">
      <Map
        {...viewState}
        mapboxAccessToken={
          "pk.eyJ1IjoiY2VyZmlvIiwiYSI6ImNtNGVsOW16djB0amUyanFxOG9vMGh1d3UifQ.XK6vi6TWXtghgG1F5ID4sA"
        }
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl={false}
        interactive={false}
        dragPan={false}
        dragRotate={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchPitch={false}
        pitchWithRotate={false}
        keyboard={false}
      >
        {showRoute && (
          <>
            <Source
              id="route"
              type="geojson"
              lineMetrics={true}
              data={{
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: getRouteCoordinates().coordinates,
                },
              }}
            >
              <Layer {...routeLayer} />
            </Source>

            <Marker
              latitude={path[(currentLocationIndex + 1) % path.length].latitude}
              longitude={path[(currentLocationIndex + 1) % path.length].longitude}
            >
              <div className="flex flex-col items-center">
                <CustomPin
                  type={path[(currentLocationIndex + 1) % path.length].type as keyof typeof typeStyles}
                />
                <div
                  className="px-2 py-1 rounded shadow-md text-sm -mt-2"
                  style={{
                    backgroundColor: typeStyles[path[(currentLocationIndex + 1) % path.length].type as keyof typeof typeStyles].pinColor,
                    color: "white",
                  }}
                >
                  {path[(currentLocationIndex + 1) % path.length].name}
                </div>
              </div>
            </Marker>
          </>
        )}

        <Marker
          latitude={path[currentLocationIndex].latitude}
          longitude={path[currentLocationIndex].longitude}
        >
          <div className="flex flex-col items-center">
            <CustomPin
              type={path[currentLocationIndex].type as keyof typeof typeStyles}
            />
            <div
              className="px-2 py-1 rounded shadow-md text-sm -mt-2"
              style={{
                backgroundColor: typeStyles[path[currentLocationIndex].type as keyof typeof typeStyles].pinColor,
                color: "white",
              }}
            >
              {path[currentLocationIndex].name}
            </div>
          </div>
        </Marker>
      </Map>
    </div>
  );
};

export default MapStyle;
