import PropTypes from "prop-types";
import DraggableResizableContainer from "./DraggableResizableContainer";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchComponentById, selectImageById } from "../store/slices/componentsSlice";

export default function Image({ id, description, isEditMode, onRemove }) {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({x: 0, y: 0});
  const [src, setSrc] = useState('');

  const dispatch = useDispatch();
  const image = useSelector((state) => selectImageById(state, id));

  useEffect(() => {
    if (image) {
      if (image.size) {
        setSize(image.size);
      }
      if (image.position) {
        setPosition(image.position);
      }
      if (image.src) {
        setSrc(image.src);
      }
    } else {
      dispatch(fetchComponentById({ type: "images", id: id }));
    }
  }, [id, image, dispatch]);

  return (
    <DraggableResizableContainer
      isEditMode={isEditMode}
      onRemove={onRemove}
      type={"images"}
      id={id}
      size={size}
      setSize={setSize}
      position={position}
      setPosition={setPosition}
    >
      <img src={src} alt={description} style={{ width: "100%", height: "auto" }} />
    </DraggableResizableContainer>
  );
}

Image.propTypes = {
    id: PropTypes.string.isRequired,
    description: PropTypes.string,
    isEditMode: PropTypes.bool.isRequired,
    onRemove: PropTypes.func,
};
