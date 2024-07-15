import { liveDataSlice } from './slices/liveDataSlice';
import store from './store';

class DashboardWS {
    static instance = null;

    static getInstance() {
        if (!DashboardWS.instance) {
            DashboardWS.instance = new DashboardWS();
        }
        return DashboardWS.instance;
    }

    constructor() {
        this.socket = null;
        this.dispatch = store.dispatch;
        this.senderId = crypto.randomUUID();
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    connect() {
        if (!this.isConnected()) {
            this.socket = new WebSocket(`ws://backend:8080/ws`);
            this.socket.onopen = () => console.log("WebSocket connected");
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.dispatch(liveDataSlice.actions.updateLiveData({
                    type: data.type,
                    payload: data
                }));
            };
            this.socket.onclose = () => {
                console.log("WebSocket disconnected");
                this.socket = null;
            };
            this.socket.onerror = (error) => console.log("WebSocket error:", error);
        }
    }

    disconnect() {
        if (this.isConnected()) {
            this.socket.close();
        }
    }

    send(message) {
        if (this.isConnected()) {
            this.socket.send(JSON.stringify(message));
        }
    }

    setOnMessageHandler(handler) {
        this.onMessage = handler;
    }
}

export default DashboardWS.getInstance();