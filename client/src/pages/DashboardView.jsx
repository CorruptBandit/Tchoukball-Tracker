import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import PropTypes from "prop-types";
import ComponentSideMenu from "../menus/AvailableComponentSideMenu";
import Chat from "../components/Chat";
import Graph from "../components/Graph";
import Map from "../components/Map";
import TextDescription from "../components/TextDescription";
import Image from "../components/Image";
import Video from "../components/Video";
import WebPage from "../components/WebPage";
import {
  addComponentToDashboard,
  removeComponentFromDashboard,
  selectDashboardById,
} from "../store/slices/dashboardsSlice";

export default function DashboardView({ dashboardID, editMode }) {
  const dispatch = useDispatch();
  const dashboard = useSelector(state => selectDashboardById(state, dashboardID));
  const [components, setComponents] = useState({});
  const [componentMenu, setComponentMenu] = useState(false);
  const [title, setTitle] = useState(dashboard.name);
  const componentsRef = useRef(components);
  componentsRef.current = componentsRef;

  const removeComponent = useCallback((id) => {
    dispatch(removeComponentFromDashboard({ id: dashboardID, componentID: id }));
    setComponents(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
  });
  
  }, [dispatch, dashboardID]); 
  
  const renderComponent = useCallback((id, type) => {
    switch (type) {
      case "datasources":
        setComponentMenu(false);  
        return;
    }
    const ComponentMap = {
      chats: Chat,
      maps: Map,
      graphs: Graph,
      texts: TextDescription,
      images: Image,
      videos: Video,
      webpages: WebPage,
    };
    const Comp = ComponentMap[type] || TextDescription;
    const newComponentToRender = {
      id: id,
      type: type,
      component: (
        <Comp
          key={id}
          id={id}
          isEditMode={editMode}
          onRemove={() => removeComponent(id)}
        />
      ),
    };
    setComponents(prev => ({ ...prev, [id]: newComponentToRender }));
    setComponentMenu(false);
  }, [editMode, removeComponent]);
  
  useEffect(() => {
    setTitle(dashboard.name);
    dashboard?.components.forEach(({ type, componentID }) => {
        if (!componentsRef[componentID]) {
            renderComponent(componentID, type);
        }
    });
}, [dashboard, renderComponent]); 


  const toggleComponentMenu = () => {
    setComponentMenu(prevMenu => !prevMenu);
  };

  const addComponent = (id, type) => {
    dispatch(addComponentToDashboard({
          id: dashboardID,
          componentID: id,
          type: type,
    }));
    renderComponent(id, type);
  };

  const handleComponent = (id, type, action) => {
    switch (type) {
      case 'datasources':
        return;
    }
    switch (action) {
      case 'add':
        addComponent(id, type);
        break;
      case 'remove':
        removeComponent(id);
        break;
      default:
        console.error('Action not provided or invalid!');
        break;
    }
  }
  
  return (
    <div className="Dashboard">
      <Navbar
        className="flex"
        dashboardID={dashboardID}
        title={title}
        toggleComponentMenu={toggleComponentMenu}
        setEditMode={() => {}}
      />
      <ComponentSideMenu dashboardID={dashboardID} state={componentMenu} setState={setComponentMenu} handleComponent={handleComponent} />
      {Object.values(components).map((comp) => comp.component)}
    </div>
  );
}

DashboardView.propTypes = {
  dashboardID: PropTypes.string.isRequired,
  editMode: PropTypes.bool.isRequired,
};
