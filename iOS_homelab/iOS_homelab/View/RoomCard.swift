import SwiftUI

struct RoomCard: View {
    let room: Room

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            if let imagePath = room.image, !imagePath.isEmpty {
                let imageName = URL(fileURLWithPath: imagePath).lastPathComponent
                if let path = Bundle.main.path(forResource: imageName, ofType: nil),
                   let uiImage = UIImage(contentsOfFile: path) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 160)
                        .clipped()
                } else {
                    Color.red
                        .frame(height: 160)
                        .overlay(Text("Missing: \(imageName)").foregroundColor(.white))
                }
            } else {
                Color.blue.opacity(0.15)
                    .frame(height: 160)
            }
            VStack(alignment: .leading, spacing: 8) {
                Text(room.name)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Text("\(room.entities.filter { $0.type == "light" }.count) lights")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.85))
            }
            .padding()
            .background(
                LinearGradient(gradient: Gradient(colors: [Color.black.opacity(0.6), Color.clear]), startPoint: .bottom, endPoint: .top)
            )
        }
        .frame(height: 160)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
        .padding(.horizontal, 4)
    }
}
