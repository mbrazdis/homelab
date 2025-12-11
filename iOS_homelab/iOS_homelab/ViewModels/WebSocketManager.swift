import Foundation
import Combine

class WebSocketManager: ObservableObject {
    static let shared = WebSocketManager()
    @Published var rooms: [Room] = []
    private var webSocketTask: URLSessionWebSocketTask?
    @Published var isConnected = false

    private init() {}

    func connect() {
        guard webSocketTask == nil else {
            print("[WebSocket] Already connected")
            return
        }
        guard let url = URL(string: "ws://192.168.0.67:8000/ws") else {
            print("[WebSocket] Invalid URL")
            return
        }
        print("[WebSocket] Connecting to \(url)")
        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        isConnected = true
        listen()
    }

    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        isConnected = false
    }

    private func listen() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .failure(let error):
                print("[WebSocket] Receive error: \(error)")
                self?.isConnected = false
            case .success(let message):
                switch message {
                case .string(let text):
                    self?.handleIncomingMessage(text)
                default:
                    print("[WebSocket] Received non-string message")
                }
                self?.listen()
            }
        }
    }

    private func handleIncomingMessage(_ text: String) {
        guard let data = text.data(using: .utf8) else { return }
        do {
            let response = try JSONDecoder().decode(WebSocketResponse.self, from: data)
            if response.status == "success", let roomsData = response.data?.rooms {
                let rooms = roomsData.map { $0.value }
                DispatchQueue.main.async {
                    self.rooms = rooms
                }
            }
        } catch {
            print("[WebSocket] Failed to decode message: \(error)")
        }
    }

    func fetchAllData() {
        let command: [String: Any] = ["command": "get_all_data"]
        sendCommand(command)
    }

    func sendCommand(_ command: [String: Any]) {
        do {
            let data = try JSONSerialization.data(withJSONObject: command, options: [])
            if let jsonString = String(data: data, encoding: .utf8) {
                send(jsonString)
            }
        } catch {
            print("[WebSocket] Failed to encode command: \(error)")
        }
    }

    func send(_ message: String) {
        let msg = URLSessionWebSocketTask.Message.string(message)
        webSocketTask?.send(msg) { error in
            if let error = error {
                print("[WebSocket] Send error: \(error)")
            }
        }
    }
}

struct WebSocketResponse: Decodable {
    let status: String?
    let data: WebSocketData?
}

struct WebSocketData: Decodable {
    let rooms: [String: Room]
}
