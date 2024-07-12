import { Card } from "@mui/material";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewComponent,
  updateComponent,
} from "../store/slices/componentsSlice";
import Chat from "../components/CreateComponentMenu/Chat";
import Datasource from "../components/CreateComponentMenu/Datasource";
import Text from "../components/CreateComponentMenu/Text";
import Graph from "../components/CreateComponentMenu/Graph";
import MediaInput from "../components/CreateComponentMenu/MediaInput";
import Map from "../components/CreateComponentMenu/Map";

function CreateComponentMenu({ shown, id, type, handleComponent }) {
  const dispatch = useDispatch();
  const components = useSelector((state) => state.components[type].entities);
  const existing = Object.values(components).find((c) => c.id === id);

  const submit = (payload) => {
    payload["type"] = type;
    if (id) {
      payload["id"] = id;
      dispatch(updateComponent(payload));
    } else {
      dispatch(addNewComponent(payload))
        .unwrap()
        .then((response) => {
          if (response.id) {
            handleComponent(response.id, type, "add");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  let inputType;
  switch (type) {
    case "chats":
      inputType = <Chat existing={existing} submit={submit} />;
      break;
    case "graphs":
      inputType = <Graph existing={existing} submit={submit} />;
      break;
    case "images":
      inputType = <Image existing={existing} submit={submit} />;
      break;
    case "maps":
      inputType = <Map shown={shown} existing={existing} submit={submit} />;
      break;
    case "texts":
      inputType = <Text existing={existing} submit={submit} />;
      break;
    case "videos":
      inputType = <Video existing={existing} submit={submit} />;
      break;
    case "webpages":
      inputType = <Webpage existing={existing} submit={submit} />;
      break;
    case "datasources":
      inputType = <Datasource existing={existing} submit={submit} />;
      break;
    default:
      console.error("Create type provided wasn't found!");
      break;
  }

  return shown ? <Card sx={{ mb: 2 }}>{inputType}</Card> : null;
}

function Image({ existing, submit }) {
  return <MediaInput existing={existing} type={"Image"} submit={submit} />;
}

function Video({ existing, submit }) {
  return <MediaInput existing={existing} type={"Video"} submit={submit} />;
}

function Webpage({ existing, submit }) {
  return <MediaInput existing={existing} type={"Webpage"} submit={submit} />;
}

Image.propTypes = {
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

Video.propTypes = {
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

Webpage.propTypes = {
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

CreateComponentMenu.propTypes = {
  shown: PropTypes.bool.isRequired,
  id: PropTypes.string,
  type: PropTypes.string.isRequired,
  handleComponent: PropTypes.func.isRequired,
};

export default CreateComponentMenu;
