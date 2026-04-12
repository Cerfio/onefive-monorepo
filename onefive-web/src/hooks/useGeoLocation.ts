import { useState, useEffect } from 'react';

interface Position {
  coords: {
    latitude: number | null;
    longitude: number | null;
  };
}

const useGeoLocation = () => {
  const [position, setPosition] = useState<Position>({
    coords: {
      latitude: null,
      longitude: null,
    },
  });

  useEffect(() => {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    const successHandler = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      setPosition({
        coords: {
          latitude,
          longitude,
        },
      });
    };

    const errorHandler = (err: GeolocationPositionError) => {
      setPosition((prevState) => ({
        ...prevState,
        error: err.message,
      }));
    };

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      geoOptions,
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return position;
};

export default useGeoLocation;