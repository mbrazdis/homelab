import SwiftUI

struct EntitiesView: View {
    let entities: [Entity]

    var body: some View {
        NavigationView {
            List(entities, id: \.id) { entity in
                Text(entity.name)
            }
            .navigationTitle("Entities")
        }
    }
}
