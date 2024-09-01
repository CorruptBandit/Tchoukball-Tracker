import PropTypes from "prop-types";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ActionButtonGrid from "./ActionButtonGrid";

const attackingActions = [
  "Point",
  "Caught",
  "Short",
  "Frame",
  "Footing",
  "Landed",
  "Bad Pass",
];
const defendingActions = ["Drop pass", "1st", "2nd", "Drop", "Gap", "Dig"];

function PlayerButtons({ onClick, removePointsMode }) {
  return (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="add-action-content"
          id="add-action-header"
        >
          <Typography>Attacking</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ActionButtonGrid
            buttons={attackingActions}
            onClick={onClick}
            removePointsMode={removePointsMode}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="add-action-content"
          id="add-action-header"
        >
          <Typography>Defending</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ActionButtonGrid
            buttons={defendingActions}
            onClick={onClick}
            removePointsMode={removePointsMode}
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
}

PlayerButtons.propTypes = {
    onClick: PropTypes.func.isRequired,
    removePointsMode: PropTypes.bool.isRequired
};

export default PlayerButtons;
