"use client";

import { useEffect, useRef } from "react";
import { FeatureGroup, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

export interface AoiBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  widthKm: number;
  heightKm: number;
}

interface AoiMapProps {
  onBoundsChange: (bounds: AoiBounds | null) => void;
  onErrorChange?: (error: string | null) => void;
}

const MAX_DIMENSION_KM = 20;

function DrawControl({ onBoundsChange, onErrorChange }: AoiMapProps) {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onErrorChangeRef = useRef(onErrorChange);

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  useEffect(() => {
    onErrorChangeRef.current = onErrorChange;
  }, [onErrorChange]);

  useEffect(() => {
    const featureGroup = featureGroupRef.current;
    if (!featureGroup) return;

    const drawControl = new L.Control.Draw({
      draw: {
        rectangle: { shapeOptions: { color: "#18c8c1", weight: 2 } },
        polygon: false,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
      edit: { featureGroup },
    });

    const validateLayer = (layer: L.Rectangle) => {
      const bounds = layer.getBounds();
      const nw = bounds.getNorthWest();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const widthKm = nw.distanceTo(ne) / 1000;
      const heightKm = nw.distanceTo(sw) / 1000;

      if (widthKm > MAX_DIMENSION_KM || heightKm > MAX_DIMENSION_KM) {
        return {
          valid: false,
          widthKm,
          heightKm,
          error: `Selected area is too large — please draw an area no larger than 20km × 20km. Your selection was ${widthKm.toFixed(1)}km × ${heightKm.toFixed(1)}km.`,
        };
      }

      return {
        valid: true,
        widthKm,
        heightKm,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
          widthKm,
          heightKm,
        },
      };
    };

    const handleCreated = (event: L.LeafletEvent) => {
      featureGroup.clearLayers();
      const layer = (event as L.DrawEvents.Created).layer as L.Rectangle;
      const result = validateLayer(layer);

      if (!result.valid) {
        onErrorChangeRef.current?.(result.error ?? null);
        onBoundsChangeRef.current(null);
        return;
      }

      featureGroup.addLayer(layer);
      onErrorChangeRef.current?.(null);
      onBoundsChangeRef.current(result.bounds ?? null);
    };

    const handleEdited = (event: L.LeafletEvent) => {
      let foundValid = false;
      (event as L.DrawEvents.Edited).layers.eachLayer((layer) => {
        const result = validateLayer(layer as L.Rectangle);
        if (!result.valid) {
          featureGroup.removeLayer(layer);
          onErrorChangeRef.current?.(result.error ?? null);
          onBoundsChangeRef.current(null);
        } else {
          foundValid = true;
          onErrorChangeRef.current?.(null);
          onBoundsChangeRef.current(result.bounds ?? null);
        }
      });
      if (!foundValid && featureGroup.getLayers().length === 0) {
        onBoundsChangeRef.current(null);
      }
    };

    const handleDeleted = () => {
      onErrorChangeRef.current?.(null);
      onBoundsChangeRef.current(null);
    };

    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      featureGroup.clearLayers();
    };
  }, [map]);

  return <FeatureGroup ref={featureGroupRef} />;
}

export default function AoiMap({ onBoundsChange, onErrorChange }: AoiMapProps) {
  return (
    <MapContainer center={[22.5, 78.9]} zoom={5} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DrawControl onBoundsChange={onBoundsChange} onErrorChange={onErrorChange} />
    </MapContainer>
  );
}