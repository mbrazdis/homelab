import Foundation

struct Room: Identifiable, Decodable {
    let id: Int
    let name: String
    let status: [String: AnyCodable]?
    var entities: [Entity]
    let image: String?
}
