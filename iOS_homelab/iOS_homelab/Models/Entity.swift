import Foundation

struct Entity: Identifiable, Decodable {
    let id: String
    let name: String
    let type: String
    let manufacturer: String?
    let model: String?
    var status: DeviceStatus?
    let config: [String: AnyCodable]?
    let roomId: Int?

    var isOn: Bool {
        status?.ison ?? status?.command ?? false
    }
}

struct DeviceStatus: Decodable {
    var ison: Bool?
    var command: Bool?

    func updating(isOn: Bool) -> DeviceStatus {
        DeviceStatus(ison: ison != nil ? isOn : nil, command: command != nil ? isOn : nil)
    }
}
