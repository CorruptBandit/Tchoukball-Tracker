import PropTypes from "prop-types";
import { MapComponent } from "../Map";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { addIconToMap } from "../../store/slices/componentsSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import IconList from "../IconList";

function Map({ shown, existing, submit }) {
  const [mapName, setMapName] = useState(existing?.name || "");
  const [mapCenter, setMapCenter] = useState(
    existing?.center ? [existing.center.x, existing.center.y] : [51.505, -0.09]
  );
  const [mapZoom, setMapZoom] = useState(existing?.zoom || 13);
  const [icons, setIcons] = useState(existing?.icons || []);
  const [popup, setPopup] = useState("");
  const [url, setUrl] = useState("");
  const [iconSize, setIconSize] = useState();
  const [iconPosition, setIconPosition] = useState(null);
  const mapRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setMapName(existing?.name || "");
    setMapZoom(existing?.zoom || 13);
    if (existing?.center) {
      setMapCenter([existing.center.x, existing.center.y]);
    }
    setIcons(existing?.icons || []);
  }, [existing]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submit({
      name: mapName,
      zoom: mapZoom,
      center: { x: mapCenter[0], y: mapCenter[1] },
    });
  };

  const handleIconSubmit = async (event) => {
    event.preventDefault();
    await dispatch(
      addIconToMap({
        mapId: existing.id,
        popup,
        url,
        position: { x: iconPosition.lat, y: iconPosition.lng },
        size: { width: parseInt(iconSize), height: parseInt(iconSize) },
      })
    );
    setPopup("");
    setUrl("");
    setIconPosition(null);
    setIconSize();
  };

  const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    LocationMarker.propTypes = {
      position: PropTypes.object.isRequired,
      setPosition: PropTypes.func.isRequired,
    };

    return position === null ? null : (
      <Marker position={position}>
        <Popup>New Icon</Popup>
      </Marker>
    );
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 1, p: 2 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Typography
          sx={{
            pb: 1,
            fontSize: "1.4rem",
            flexGrow: 1,
            textAlign: "center",
            color: "text.primary",
          }}
        >
          {existing ? "Edit" : "Create"} Map
        </Typography>
      </div>
      <TextField
        fullWidth
        label="Map Name"
        variant="outlined"
        value={mapName}
        onChange={(e) => setMapName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          height: 200,
        }}
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
          <LocationMarker
            position={iconPosition}
            setPosition={setIconPosition}
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
          <MapComponent
            size={{ width: 150, height: 100 }}
            isEditMode={!shown}
            setMapZoom={setMapZoom}
            setMapPosition={setMapCenter}
          />
        </MapContainer>
      </div>
      {iconPosition && (
        <Card sx={{ mt: 1 }}>
          <Typography
            sx={{
              my: 1,
              fontSize: "1.4rem",
              flexGrow: 1,
              textAlign: "center",
              color: "text.primary",
            }}
          >
            Create New Icon
          </Typography>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              label="Popup Message"
              variant="outlined"
              value={popup}
              onChange={(e) => setPopup(e.target.value)}
              sx={{ mb: 2, mx: 1 }}
            />
            <TextField
              label="Icon URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              sx={{ mb: 2, mx: 1 }}
            />
            <TextField
              label="Icon Size"
              variant="outlined"
              value={iconSize}
              onChange={(e) => setIconSize(e.target.value)}
              type="number"
              sx={{ mb: 2, mx: 1 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              sx={{ display: "inline", mb: 1 }}
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleIconSubmit}
            >
              Create
            </Button>
          </div>
        </Card>
      )}
      <IconList mapId={existing?.id} icons={icons} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          sx={{ mt: 2 }}
          type="submit"
          variant="contained"
          color="primary"
        >
          {existing ? "Edit" : "Create"} Map
        </Button>
      </div>
    </Box>
  );
}

Map.propTypes = {
  shown: PropTypes.bool,
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

export default Map;
