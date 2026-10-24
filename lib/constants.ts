import { Wifi, Monitor, Coffee, Car, Wind, Printer, Lock, Users, Zap, Video } from "lucide-react";

export const AMENITIES = [
    { id: "wifi", label: "WiFi Alta Velocidad", icon: Wifi },
    { id: "projector", label: "Proyector / Pantalla", icon: Monitor },
    { id: "kitchen", label: "Cocina Equipada", icon: Coffee },
    { id: "parking", label: "Aparcamiento", icon: Car },
    { id: "ac", label: "Aire Acondicionado", icon: Wind },
    { id: "printer", label: "Impresora / Escáner", icon: Printer },
    { id: "storage", label: "Almacenamiento Seguro", icon: Lock },
    { id: "meeting_rooms", label: "Salas de Reuniones", icon: Users },
    { id: "power_backup", label: "Tomas de Corriente", icon: Zap },
    { id: "video_conf", label: "Equipo de Videoconferencia", icon: Video },
];
