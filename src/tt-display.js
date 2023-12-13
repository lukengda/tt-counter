const url = "ws://172.24.164.168:8765"

function setup_display() {

}

function process_event(data) {
    console.log("<<< " + data);
}

document.addEventListener("DOMContentLoaded", () => {

    console.log("Hello world! Starting 🏓-Display…");

    setup_display();

    const webSocket = new WebSocket(url);
    webSocket.onopen = () => console.log("Successfully connected to server! 🎉");
    webSocket.onmessage = event => process_event(event.data);
    webSocket.onclose = () => console.log("Connection has been closed. 🥀");
});