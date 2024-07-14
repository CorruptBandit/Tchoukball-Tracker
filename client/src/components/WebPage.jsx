import PropTypes from "prop-types";
import DraggableResizableContainer from "./DraggableResizableContainer";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComponentById, selectWebpageById } from "../store/slices/componentsSlice";

export default function WebPageComponent({ id, isEditMode, onRemove }) {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [src, setSrc] = useState('');

  const dispatch = useDispatch();
  const webpage = useSelector(state => selectWebpageById(state, id));

  useEffect(() => {
    if (webpage) {
      if (webpage.size) {
        setSize(webpage.size);
      }
      if (webpage.position) {
        setPosition(webpage.position);
      }
      if (webpage.src) {
        setSrc(webpage.src);
      }
    } else {
      dispatch(fetchComponentById({ type: "webpages", id }));
    }
  }, [id, webpage, dispatch]);

  return (
    <DraggableResizableContainer
      isEditMode={isEditMode}
      onRemove={onRemove}
      type="webpages"
      id={id}
      size={size}
      setSize={setSize}
      position={position}
      setPosition={setPosition}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <iframe
          src={src}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
        />
        {isEditMode && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 10,
              cursor: "move"
            }}
          ></div>
        )}
      </div>
    </DraggableResizableContainer>
  );
}

WebPageComponent.propTypes = {
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
};
