import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DraggableResizableContainer from "./DraggableResizableContainer";
import {
  fetchComponentById,
  selectMapById,
} from "../store/slices/componentsSlice";
import { useDispatch, useSelector } from "react-redux";

export function MapComponent({
  size,
  isEditMode,
  setMapPosition,
  setMapZoom,
}) {
  const map = useMap();

  const mapEvents = useMapEvents({
    zoomend: () => {
      if (setMapPosition) {
        setMapZoom(mapEvents.getZoom());
      }
    },
    moveend: () => {
      if (setMapPosition) {
        setMapPosition([
          mapEvents.getCenter()?.lat,
          mapEvents.getCenter()?.lng,
        ]);
      }
    },
  });

  useEffect(() => {
    if (isEditMode) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    }

    map.invalidateSize();

    return () => {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    };
  }, [size, map, isEditMode]);

  return null;
}

export default function DraggableResizableMap({ id, isEditMode, onRemove }) {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(7);
  const [icons, setIcons] = useState([]);

  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const map = useSelector((state) => selectMapById(state, id));

  useEffect(() => {
    if (map) {
      if (map.size) {
        setSize(map.size);
      }
      if (map.position) {
        setPosition(map.position);
      }
      if (map.center) {
        setMapCenter([map.center.x, map.center.y]);
      }
      if (map.zoom) {
        setMapZoom(map.zoom);
      }
      if (map.icons) {
        setIcons(map.icons);
      }
    } else {
      dispatch(fetchComponentById({ type: "maps", id }));
    }
  }, [id, map, dispatch]);

  function ChangeView() {
    const map = useMap();
    map.setView(mapCenter, mapZoom);
    return null;
  }

  return (
    <DraggableResizableContainer
      isEditMode={isEditMode}
      onRemove={onRemove}
      id={id}
      type={"maps"}
      size={size}
      setSize={setSize}
      position={position}
      setPosition={setPosition}
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: "100%", height: "100%" }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {icons.map((icon, index) => (
          <Marker
            key={index}
            position={[icon.position.x, icon.position.y]}
            icon={
              new L.Icon({
                iconUrl: icon.url,
                iconSize: [icon.size.width, icon.size.height],
              })
            }
          >
            <Popup>{icon.popup}</Popup>
          </Marker>
        ))}
        <ChangeView />
        <MapComponent
          size={{ width: 700, height: 500 }}
          isEditMode={isEditMode}
        />
      </MapContainer>
    </DraggableResizableContainer>
  );
}
MapComponent.propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  isEditMode: PropTypes.bool.isRequired,
  setMapZoom: PropTypes.func,
  setMapPosition: PropTypes.func,
};

DraggableResizableMap.propTypes = {
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
};
