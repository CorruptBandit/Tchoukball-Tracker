import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DraggableResizableContainer from "./DraggableResizableContainer";
import { fetchComponentById, selectTextById } from "../store/slices/componentsSlice";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";

export default function TextDescription({
  id,
  isEditMode,
  onRemove,
}) {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [alignment, setAlignment] = useState('center');

  const dispatch = useDispatch();
  const textComp = useSelector((state) => selectTextById(state, id));

  useEffect(() => {
    if (textComp) {
      if (textComp.size) {
        setSize(textComp.size);
      }
      if (textComp.position) {
        setPosition(textComp.position);
      }
      if (textComp.fontSize) {
        setFontSize(textComp.fontSize);
      }
      if (textComp.fontFamily) {
        setFontFamily(textComp.fontFamily);
      }
      if (textComp.alignment) {
        setAlignment(textComp.alignment);
      }
      if (textComp.text) {
        setText(textComp.text);
      }
    } else {
      dispatch(fetchComponentById({ type: "texts", id: id }));
    }
  }, [id, textComp, dispatch]);

  return (
    <DraggableResizableContainer
      isEditMode={isEditMode}
      onRemove={onRemove}
      type={"texts"}
      id={id}
      size={size}
      setSize={setSize}
      position={position}
      setPosition={setPosition}
    >
      <Box sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: alignment,
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        margin: 2,
      }}>
        <Typography variant="body1" component="div" sx={{ fontFamily: fontFamily, textAlign: alignment, fontSize: `${fontSize}px`}}>
          {text}
        </Typography>
      </Box>
    </DraggableResizableContainer>
  );
}

TextDescription.propTypes = {
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
};
