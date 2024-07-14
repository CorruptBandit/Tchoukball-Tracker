import { useRef } from "react";
import PropTypes from "prop-types";
import { Resizable } from "re-resizable";
import Draggable from "react-draggable";
import { Card, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { updateSize, updatePosition } from "../store/slices/componentsSlice";

export default function DraggableResizableContainer({
  children,
  id,
  type,
  isEditMode,
  onRemove,
  size,
  setSize,
  position,
  setPosition,
}) {
  const nodeRef = useRef(null);
  const dispatch = useDispatch();

  const handleStop = (e, ui) => {
    setPosition({ x: ui.x, y: ui.y });
    dispatch(updatePosition({type: type, id: id, position: { x: ui.x, y: ui.y }}));
  };

  const handleResizeStop = (e, direction, ref, d) => {
    setSize({
      width: size.width + d.width,
      height: size.height + d.height,
    });
    dispatch(updateSize({type: type, id: id, size: {
      width: size.width + d.width,
      height: size.height + d.height,
    }}));
  };

  return (
    <Draggable nodeRef={nodeRef} disabled={!isEditMode} position={position} onStop={handleStop}>
      <div ref={nodeRef}>
        <Resizable
          size={size}
          onResizeStop={handleResizeStop}
          enable={{
            topRight: isEditMode,
            bottomRight: isEditMode,
            bottomLeft: isEditMode,
            topLeft: isEditMode,
          }}
          minWidth={150}
          minHeight={100}
        >
          <Card
            style={{
              width: size.width,
              height: size.height,
              position: "relative",
            }}
          >
            {isEditMode && (
              <IconButton
                onClick={onRemove}
                sx={{
                  color: "text.primary",
                  position: "absolute",
                  right: -8,
                  top: -8,
                  zIndex: 1000,
                  backgroundColor: "background.paper",
                  "&:hover": { backgroundColor: "red" },
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
            {children}
          </Card>
        </Resizable>
      </div>
    </Draggable>
  );
}

DraggableResizableContainer.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }).isRequired,
  setSize: PropTypes.func.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  setPosition: PropTypes.func,
};
