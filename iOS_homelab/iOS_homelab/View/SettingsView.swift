import SwiftUI

struct SettingsView: View {
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("WebSocket")) {
                    Button("Reconnect WebSocket") {
                        WebSocketManager.shared.connect()
                    }
                    Button("Disconnect") {
                        WebSocketManager.shared.disconnect()
                    }
                }
                Section(header: Text("App Info")) {
                    Text("Version 1.0")
                }
            }
            .navigationTitle("Settings")
        }
    }
}
