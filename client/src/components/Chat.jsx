import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import DraggableResizableContainer from "./DraggableResizableContainer";
import { useDispatch, useSelector } from "react-redux";
import { fetchComponentById, selectChatById } from "../store/slices/componentsSlice";
import { List, ListItem, Typography, TextField, Button, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardWS from "../store/DashboardWS";
import { format } from 'date-fns';
import { useTheme } from "@emotion/react";

export default function Chat({ id, isEditMode, onRemove }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("Test");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const chat = useSelector((state) => selectChatById(state, id));
  const liveData = useSelector((state) => state.livedata.chats);
  const messageColour = theme.palette.mode === 'dark' ? '#718082' : '#e0f7fa'

  const chatMessages = useMemo(() => {
    return liveData[chat?.id] ? liveData[chat.id] : [];
  }, [liveData, chat?.id]);

  useEffect(() => {
    if (chat) {
      if (chat.size) {
        setSize(chat.size);
      }
      if (chat.position) {
        setPosition(chat.position);
      }
    } else {
      dispatch(fetchComponentById({ type: "chats", id: id }));
    }
  }, [id, chat, dispatch]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const chatMessage = {
        type: 'chats',
        sender: id,
        data: {
          displayName,
          senderId: DashboardWS.senderId,
          msg: message.trim(),
          timestamp: new Date().toISOString()
        }
      };
      DashboardWS.send(chatMessage);
      setMessage('');
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleChangeDisplayName = (event) => {
    setDisplayName(event.target.value);
  };

  return (
    <DraggableResizableContainer
      isEditMode={isEditMode}
      onRemove={onRemove}
      id={id}
      type={"chats"}
      size={size}
      setSize={setSize}
      position={position}
      setPosition={setPosition}
      sx={{ border: '1px solid gray', borderRadius: '4px', overflow: 'hidden' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        <IconButton onClick={handleOpenSettings}>
          <SettingsIcon />
        </IconButton>
        <Typography sx={{ fontSize: "1.4rem", fontWeight: "bold", flexGrow: 1, marginLeft: 2 }}>
          {chat?.name || "Chat Name"}
        </Typography>
      </Box>
        <List dense sx={{ maxHeight: 'calc(100% - 140px)', overflowY: 'auto' }}>
        {chatMessages.map((chat, index) => (
          <ListItem
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
                alignItems: 'flex-start',
              backgroundColor: chat?.data?.senderId === DashboardWS.senderId ? messageColour : 'none',
              borderRadius: 1,
              padding: '8px',
              marginBottom: '8px',
            }}
          >
            <Typography variant="body2">
              <strong>{chat.data.displayName}</strong>: {chat.data.msg}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? '#d3d3d3' : 'gray', marginTop: '4px' }}>
              {format(new Date(chat.data.timestamp), "PPPpp")}
            </Typography>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1, padding: '10px' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          sx={{ flexGrow: 1 }}
          onKeyPress={(e) => e.key === 'Enter' ? handleSendMessage() : null}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
      <Dialog open={isSettingsOpen} onClose={handleCloseSettings}>
        <DialogTitle>Chat Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Change your display name for other users of the chat.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Display Name"
            type="text"
            fullWidth
            variant="standard"
            value={displayName}
            onChange={handleChangeDisplayName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button onClick={handleCloseSettings}>Save</Button>
        </DialogActions>
      </Dialog>
    </DraggableResizableContainer>
  );
}

Chat.propTypes = {
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
};
