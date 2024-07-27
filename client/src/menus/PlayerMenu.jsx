import { Button, Modal, TextField, Autocomplete, Chip, Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewPlayer,
  fetchSpreadsheetById,
  removePlayer,
  selectSpreadsheetById,
} from "../store/slices/spreadsheetsSlice";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

function PlayerMenu({ id, open, close }) {
  const dispatch = useDispatch();
  const spreadsheet = useSelector((state) => selectSpreadsheetById(state, id));
  const spreadsheetStatus = useSelector((state) => state.spreadsheets.status);
  const names = spreadsheet?.players?.map((player) => player.name) 
  const [players, setPlayers] = useState(names || []);
  const [initialPlayers, setInitialPlayers] = useState([]);

  useEffect(() => {
    if (spreadsheetStatus === "idle" && !spreadsheet) {
      dispatch(fetchSpreadsheetById(id))
        .unwrap()
        .then((response) => {
          const playerNames = response.players?.map((player) => player.name) || [];
          setPlayers(playerNames);
          setInitialPlayers(playerNames);
        })
    }
  }, [id, spreadsheet, spreadsheetStatus, dispatch]);

  const apply = async () => {
    const addedPlayers = players.filter(p => !initialPlayers.includes(p));
    const removedPlayers = initialPlayers.filter(p => !players.includes(p));

    await addedPlayers.map((player) => {
      dispatch(addNewPlayer({id, name: player}))
    });

    await removedPlayers.map((player) => {
      dispatch(removePlayer({id, name: player}))
    });

    setInitialPlayers(players);
    close();
  }

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
  };

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography align="center" variant="h6" component="h2">
          Player Menu
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={players}
          onChange={(_, players) => setPlayers(players)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  variant="outlined"
                  label={option}
                  {...chipProps}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Modify Players"
              placeholder="Type a name and press Enter"
            />
          )}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={close} sx={{ mr: 1 }}>Cancel</Button>
          <Button onClick={apply} variant="contained">Apply</Button>
        </Box>
      </Box>
    </Modal>
  );
}

PlayerMenu.propTypes = {
  id: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default PlayerMenu;
