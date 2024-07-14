import PropTypes from "prop-types";
import DraggableResizableContainer from "./DraggableResizableContainer";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComponentById,
  selectVideoById,
} from "../store/slices/componentsSlice";

export default function Video({ id, isEditMode, onRemove }) {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [src, setSrc] = useState('');

  const dispatch = useDispatch();
  const video = useSelector((state) => selectVideoById(state, id));

  useEffect(() => {
    if (video) {
      if (video.size) {
        setSize(video.size);
      }
      if (video.position) {
        setPosition(video.position);
      }
      if (video.src) {
        setSrc(video.src);
      }
    } else {
      dispatch(fetchComponentById({ type: "videos", id: id }));
    }
  }, [id, video, dispatch]);

  return (
    <DraggableResizableContainer
      isEditMode={isEditMode}
      onRemove={onRemove}
      type={"videos"}
      id={id}
      size={size}
      setSize={setSize}
      position={position}
      setPosition={setPosition}
    >
      <video controls src={src} style={{ width: "100%", height: "100%" }} />
    </DraggableResizableContainer>
  );
}

Video.propTypes = {
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
};
