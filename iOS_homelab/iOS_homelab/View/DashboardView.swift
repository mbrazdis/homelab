import SwiftUI

struct DashboardView: View {
    @ObservedObject var webSocketManager = WebSocketManager.shared
    @State private var selectedRoom: Room?
    @State private var showRoomDetail = false

    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    ForEach(webSocketManager.rooms) { room in
                        RoomCard(room: room)
                            .onTapGesture {
                                toggleRoomLights(room)
                            }
                            .onLongPressGesture {
                                selectedRoom = room
                                showRoomDetail = true
                            }
                    }
                }
                .padding()
            }
            .navigationTitle("Rooms")
            .background(Color(.systemGroupedBackground))
            .onAppear {
                webSocketManager.fetchAllData()
            }
            .sheet(isPresented: $showRoomDetail) {
                if let room = selectedRoom {
                    RoomView(room: room, webSocketManager: webSocketManager)
                }
            }
        }
    }

    private func toggleRoomLights(_ room: Room) {
        let deviceIds = room.entities
            .filter { $0.type == "light" }
            .map { $0.id }
        guard !deviceIds.isEmpty else { return }
        let command: [String: Any] = [
            "command": "turn_on_multiple",
            "device_ids": deviceIds
        ]
        webSocketManager.sendCommand(command)
    }
}

