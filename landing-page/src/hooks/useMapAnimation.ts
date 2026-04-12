import { useState, useEffect } from 'react';
import { calculateDistance, calculateBearing, lerp, easeInOutCubic } from '@/utils/mapUtils';
import { mapLocations } from '@/data/mapLocations';

export const useMapAnimation = () => {
  const [viewState, setViewState] = useState({
    latitude: mapLocations[0].latitude,
    longitude: mapLocations[0].longitude,
    zoom: 12,
    bearing: 0,
    pitch: 45,
  });

  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [showRoute, setShowRoute] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;

    const getTransitionDuration = (currentIndex: number, nextIndex: number) => {
      const distance = calculateDistance(
        mapLocations[currentIndex].latitude,
        mapLocations[currentIndex].longitude,
        mapLocations[nextIndex].latitude,
        mapLocations[nextIndex].longitude
      );

      const BASE_DURATION = 3000;
      const DISTANCE_FACTOR = 800;
      return Math.min(BASE_DURATION + distance * DISTANCE_FACTOR, 10000);
    };

    const animate = (currentTime: number) => {
      // ... logique d'animation existante ...
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return {
    viewState,
    setViewState,
    currentLocationIndex,
    showRoute,
    routeProgress,
  };
}; 