import SwiftUI

struct EntityView: View {
    let entity: Entity

    var body: some View {
        HStack {
            Text(entity.name)
            Spacer()
            Text(statusText)
                .foregroundColor(.gray)
        }
    }

    private var statusText: String {
        if let isOn = entity.status?.ison {
            return isOn ? "On" : "Off"
        }
        return "Unknown"
    }
}
