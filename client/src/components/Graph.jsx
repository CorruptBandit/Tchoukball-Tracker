import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DraggableResizableContainer from "./DraggableResizableContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComponentById,
  fetchComponentData,
  selectGraphById,
} from "../store/slices/componentsSlice";

export default function Graph({ id, isEditMode, onRemove }) {
  const dispatch = useDispatch();
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [data, setData] = useState([]);
  const graph = useSelector((state) => selectGraphById(state, id));
  const liveData = useSelector((state) => state.livedata.datasources);

  useEffect(() => {
    if (graph) {
      if (graph.size) {
        setSize(graph.size);
      }
      if (graph.position) {
        setPosition(graph.position);
      }
    } else {
      dispatch(fetchComponentById({ type: "graphs", id: id }));
    }
  }, [id, graph, dispatch]);

  useEffect(()=> {
    if (graph?.datasource && !graph?.data) {
      dispatch(fetchComponentData({type: "graphs", componentID: id, id: graph.datasource}));
    }
    if (graph?.data) {
      setData(graph.data);
    }
  }, [id, graph, dispatch])

  useEffect(() => {
    const newData = liveData[graph?.datasource] ? liveData[graph.datasource] : [];
    if (newData.length > 0) {
      setData(currentData => [...currentData, ...newData]);
    }
  }, [liveData, graph]);

  return (
    <DraggableResizableContainer
      isEditMode={isEditMode}
      onRemove={onRemove}
      id={id}
      type={"graphs"}
      size={size}
      setSize={setSize}
      position={position}
      setPosition={setPosition}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 40, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </DraggableResizableContainer>
  );
}

Graph.propTypes = {
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
};
