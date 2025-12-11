import SwiftUI

struct RoomView: View {
    let room: Room
    @ObservedObject var webSocketManager: WebSocketManager
    @State private var showEntities = false

    var body: some View {
        VStack(spacing: 16) {
            Text(room.name)
                .font(.largeTitle)
                .bold()
                .padding(.top)

            if let imagePath = room.image, !imagePath.isEmpty {
                let imageName = URL(fileURLWithPath: imagePath).lastPathComponent
                if let path = Bundle.main.path(forResource: imageName, ofType: nil),
                   let uiImage = UIImage(contentsOfFile: path) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFit()
                        .frame(height: 180)
                        .cornerRadius(12)
                } else {
                    Color.red
                        .frame(height: 180)
                        .overlay(Text("Missing: \(imageName)").foregroundColor(.white))
                }
            } else {
                Color.blue.opacity(0.15)
                    .frame(height: 180)
            }

            HStack {
                Button("On") {
                    sendCommand(turnOn: true)
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)

                Button("Off") {
                    sendCommand(turnOn: false)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            }

            Button("See More") {
                showEntities = true
            }
            .buttonStyle(.bordered)

            Spacer()
        }
        .padding()
        .sheet(isPresented: $showEntities) {
            EntitiesView(entities: room.entities)
        }
    }

    private func sendCommand(turnOn: Bool) {
        let deviceIds = room.entities.map { $0.id }
        let command = [
            "command": turnOn ? "turn_on_multiple" : "turn_off_multiple",
            "device_ids": deviceIds
        ] as [String : Any]

        if let data = try? JSONSerialization.data(withJSONObject: command),
           let jsonString = String(data: data, encoding: .utf8) {
            print("Sending: \(jsonString)")
            webSocketManager.send(jsonString)
        }
    }
}
