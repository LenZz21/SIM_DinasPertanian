export type AdminNotification = {
  id: string;
  title: string;
  time: string;
  type: string;
  href: string;
};

export const DEFAULT_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-1",
    title: "Data hasil panen padi berhasil ditambahkan",
    time: "10 menit yang lalu",
    type: "Sistem",
    href: "/admin/hasil",
  },
  {
    id: "notif-2",
    title: "Stok pupuk Urea menipis sisa 150 Kg di Gudang Tahuna",
    time: "30 menit yang lalu",
    type: "Pupuk",
    href: "/admin/data-pupuk",
  },
  {
    id: "notif-3",
    title: "Agenda baru Teknologi Tanam Padi Modern",
    time: "2 jam yang lalu",
    type: "Agenda",
    href: "/admin/agenda",
  },
  {
    id: "notif-4",
    title: "Hasil panen menurun -12% dibanding bulan lalu",
    time: "3 jam yang lalu",
    type: "Monitoring",
    href: "/admin/monitoring",
  },
  {
    id: "notif-5",
    title: "Permintaan verifikasi mitra petani baru",
    time: "5 jam yang lalu",
    type: "Mitra",
    href: "/admin/mitra",
  },
];
