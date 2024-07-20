import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ActionButtonGrid from "../components/ActionButtonGrid";
import { Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import Spreadsheet from "../components/Spreadsheet";
import { fetchSpreadsheetById } from "../store/slices/spreadsheetsSlice";

const actions = [
  { name: "Point", onClick: () => console.log("Start") },
  { name: "Caught", onClick: () => console.log("Start") },
  { name: "Short", onClick: () => console.log("Start") },
  { name: "Mistake", onClick: () => console.log("Start") },
  { name: "1st", onClick: () => console.log("Start") },
  { name: "2nd", onClick: () => console.log("Start") },
  { name: "Drop", onClick: () => console.log("Start") },
  { name: "Gap", onClick: () => console.log("Start") },
];

function TrackerView({id}) {
  const dispatch = useDispatch();
  const [selectedPlayer, setSelectedPlayer] = useState("Test");

  useEffect(() => {
    dispatch(fetchSpreadsheetById({id}));
  }, [id]);


  return (
    <div>
    <Typography variant="h1">
        Match Section: First
    </Typography>
    <Spreadsheet id={"1"} setSelected={setSelectedPlayer}/>
      {selectedPlayer && (
        <Typography sx={{fontSize: "1.6rem", fontWeight: "bold"}}>
          Selected Player: {selectedPlayer}
        </Typography>
      )}
      <ActionButtonGrid buttons={actions} />
    </div>
  );
}

TrackerView.propTypes = {
    id: PropTypes.string.isRequired,
  };
  
export default TrackerView;
  