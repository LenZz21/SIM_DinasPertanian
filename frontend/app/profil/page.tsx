"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Leaf, MapPin, UserRound } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { getPublicDepartmentProfile, getPublicEmployees } from "@/lib/api/public";
import type { DepartmentProfile, EmployeeRecord } from "@/lib/types/api";

const fallbackDepartmentProfile: DepartmentProfile = {
  id: 0,
  overview:
    "Komitmen untuk mewujudkan sektor pertanian yang maju, mandiri, modern, dan berkelanjutan demi kesejahteraan petani serta ketahanan pangan daerah.",
  vision: "Terwujudnya pertanian yang maju, mandiri, modern, dan berkelanjutan untuk meningkatkan kesejahteraan petani serta memperkuat ketahanan pangan daerah.",
  missions: [
    "Meningkatkan produksi, produktivitas, dan nilai tambah komoditas pertanian unggulan.",
    "Meningkatkan kualitas sumber daya manusia pertanian yang profesional dan berdaya saing.",
    "Mengembangkan infrastruktur dan teknologi pertanian yang modern dan berkelanjutan.",
    "Memperkuat kelembagaan dan kemitraan untuk mendukung pembangunan pertanian daerah.",
    "Mewujudkan tata kelola kelembagaan yang baik serta pelayanan publik yang prima.",
  ],
  main_duty:
    "Membantu Bupati melaksanakan urusan Pemerintahan di bidang pertanian yang menjadi kewenangan Daerah dan Tugas Pembantuan yang diberikan kepada kabupaten di bidang Pertanian.",
  functions: [
    "Perumusan kebijakan teknis di bidang Pertanian;",
    "Pelaksanaan kebijakan di bidang Pertanian;",
    "Pelaksanaan evaluasi dan pelaporan di bidang Tanaman Pangan, Peternakan, Perkebunan dan Penyuluhan;",
    "Pelaksanaan administrasi dinas di bidang pertanian; dan",
    "Pelaksanaan fungsi lain yang diberikan oleh atasan terkait dengan tugas dan fungsinya.",
  ],
  is_active: true,
  updated_at: null,
};

function hasText(value: string | null | undefined, keyword: string) {
  return (value ?? "").toLowerCase().includes(keyword.toLowerCase());
}

function pickEmployee(items: EmployeeRecord[], keyword: string) {
  return items.find((item) => hasText(item.position, keyword));
}

function pickEmployeeByKey(items: EmployeeRecord[], structureKey: string) {
  return items.find((item) => item.structure_key === structureKey);
}

function pickEmployeeByUnit(items: EmployeeRecord[], position: string, unit: string) {
  return items.find((item) => hasText(item.position, position) && hasText(item.unit, unit));
}

function pickEmployeesByUnit(items: EmployeeRecord[], position: string, unit: string) {
  return items.filter((item) => hasText(item.position, position) && hasText(item.unit, unit));
}

type OrganizationNode = {
  title: string;
  employee?: EmployeeRecord;
};

function OrganizationCard({ node, highlight = false }: { node: OrganizationNode; highlight?: boolean }) {
  const title = node.employee?.position ?? node.title;
  const name = node.employee?.name && node.employee.name !== node.title ? node.employee.name : null;
  const nip = node.employee?.notes;
  const photoUrl = node.employee?.photo_url;

  return (
    <div
      className={`rounded-2xl border p-4 text-center shadow-sm ${
        highlight ? "border-[#0f7d3b] bg-[#0f7d3b] text-white" : "border-[#dce9e2] bg-white text-[#17231d]"
      }`}
    >
      {photoUrl ? (
        <div className={`mx-auto mb-3 h-16 w-16 overflow-hidden rounded-2xl ${highlight ? "bg-white/15" : "bg-[#eef7f2]"}`}>
          <img src={photoUrl} alt={name ?? title} className="h-full w-full object-cover" />
        </div>
      ) : null}
      <p className={`text-xs font-black uppercase tracking-[0.14em] ${highlight ? "text-white/80" : "text-[#0f7d3b]"}`}>{title}</p>
      {name ? <h3 className="mt-2 font-[var(--font-sora)] text-base font-black leading-snug">{name}</h3> : null}
      {nip ? <p className={`mt-1 text-xs font-semibold ${highlight ? "text-white/75" : "text-[#66766e]"}`}>{nip}</p> : null}
    </div>
  );
}

function CommandCard({ node, highlight = false, compact = false }: { node: OrganizationNode; highlight?: boolean; compact?: boolean }) {
  const title = node.employee?.position ?? node.title;
  const name = node.employee?.name && node.employee.name !== node.title ? node.employee.name : null;
  const nip = node.employee?.notes;
  const photoUrl = node.employee?.photo_url;

  return (
    <div
      className={`relative z-10 overflow-hidden border-2 border-[#17231d] bg-white text-center text-[#17231d] shadow-sm ${highlight ? "shadow-md" : ""}`}
    >
      <div className="border-b border-[#17231d] px-3 py-2">
        <p className={`font-[var(--font-sora)] font-black uppercase leading-snug ${compact ? "text-[11px]" : "text-xs"}`}>{title}</p>
      </div>
      <div className="flex min-h-[48px] items-center justify-center gap-2 px-2 py-2">
        {photoUrl ? (
          <div className="h-11 w-11 shrink-0 overflow-hidden border border-[#17231d]/40 bg-[#eef7f2]">
            <img src={photoUrl} alt={name ?? title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="min-w-0">
          {name ? <h3 className={`font-[var(--font-sora)] font-black leading-tight ${compact ? "text-[12px]" : "text-sm"}`}>{name}</h3> : null}
          {nip ? <p className={`mt-1 font-semibold leading-tight text-[#66766e] ${compact ? "text-[10px]" : "text-[11px]"}`}>{nip}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function ProfilDinasPage() {
  const [profile, setProfile] = useState<DepartmentProfile>(fallbackDepartmentProfile);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);

  useEffect(() => {
    getPublicDepartmentProfile()
      .then((response) => {
        if (response.data) {
          setProfile({
            ...response.data,
            missions: response.data.missions?.length ? response.data.missions : fallbackDepartmentProfile.missions,
            main_duty: response.data.main_duty || fallbackDepartmentProfile.main_duty,
            functions: response.data.functions?.length ? response.data.functions : fallbackDepartmentProfile.functions,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    getPublicEmployees({ per_page: 100 })
      .then((response) => setEmployees(response.data ?? []))
      .catch(() => undefined);
  }, []);

  const missions = profile.missions?.length ? profile.missions : fallbackDepartmentProfile.missions;
  const mainDuty = profile.main_duty || fallbackDepartmentProfile.main_duty || "";
  const departmentFunctions = profile.functions?.length ? profile.functions : fallbackDepartmentProfile.functions ?? [];
  const shortOverview = (profile.overview || fallbackDepartmentProfile.overview).split(".")[0];
  const organizationChart = {
    head: {
      title: "Kepala Dinas",
      employee: pickEmployeeByKey(employees, "kepala-dinas") ?? pickEmployee(employees, "kepala dinas"),
    },
    secretary: {
      title: "Sekretaris",
      employee: pickEmployeeByKey(employees, "sekretaris") ?? pickEmployee(employees, "sekretaris"),
    },
    secretariat: [
      {
        title: "Sub Bagian Umum, Hukum dan Kepegawaian",
        employee: pickEmployeeByKey(employees, "subbag-umum-hukum-kepegawaian") ?? pickEmployee(employees, "Sub Bagian Umum"),
      },
      {
        title: "Analis Keuangan Pusat dan Daerah Ahli Muda",
        employee: pickEmployeeByKey(employees, "analis-keuangan") ?? pickEmployee(employees, "Analis Keuangan"),
      },
    ],
    divisions: [
      {
        title: "Bidang Tanaman Pangan dan Hortikultura",
        employee: pickEmployeeByKey(employees, "bidang-tph") ?? pickEmployeeByUnit(employees, "Bidang Tanaman Pangan", "Bidang Tanaman Pangan"),
        staff: [
          ...(pickEmployeeByKey(employees, "tph-pengawas-benih")
            ? [pickEmployeeByKey(employees, "tph-pengawas-benih") as EmployeeRecord]
            : pickEmployeesByUnit(employees, "Ahli Muda Pengawas Benih Tanaman", "Bidang Tanaman Pangan")
          ).map((employee) => ({
            title: "Ahli Muda Pengawas Benih Tanaman",
            employee,
          })),
          ...(pickEmployeeByKey(employees, "tph-pengendali-opt")
            ? [pickEmployeeByKey(employees, "tph-pengendali-opt") as EmployeeRecord]
            : pickEmployeesByUnit(employees, "Ahli Muda Pengendali Organisme Pengganggu Tumbuhan", "Bidang Tanaman Pangan")
          ).map((employee) => ({
            title: "Ahli Muda Pengendali Organisme Pengganggu Tumbuhan",
            employee,
          })),
        ],
      },
      {
        title: "Bidang Peternakan",
        employee: pickEmployeeByKey(employees, "bidang-peternakan") ?? pickEmployeeByUnit(employees, "Bidang Peternakan", "Bidang Peternakan"),
        staff: [
          ...(pickEmployeeByKey(employees, "peternakan-pemasaran-pakan")
            ? [pickEmployeeByKey(employees, "peternakan-pemasaran-pakan") as EmployeeRecord]
            : pickEmployeesByUnit(employees, "Ahli Muda Pemasaran", "Bidang Peternakan")
          ).map((employee) => ({
            title: "Ahli Muda Pemasaran dan Pakan Ternak",
            employee,
          })),
          ...(pickEmployeeByKey(employees, "peternakan-medik-veteriner")
            ? [pickEmployeeByKey(employees, "peternakan-medik-veteriner") as EmployeeRecord]
            : pickEmployeesByUnit(employees, "Ahli Muda Medik Veteriner", "Bidang Peternakan")
          ).map((employee) => ({
            title: "Ahli Muda Medik Veteriner",
            employee,
          })),
        ],
      },
      {
        title: "Bidang Perkebunan",
        employee: pickEmployeeByKey(employees, "bidang-perkebunan") ?? pickEmployeeByUnit(employees, "Bidang Perkebunan", "Bidang Perkebunan"),
        staff: [
          ...(pickEmployeeByKey(employees, "perkebunan-analis-pasar")
            ? [pickEmployeeByKey(employees, "perkebunan-analis-pasar") as EmployeeRecord]
            : pickEmployeesByUnit(employees, "Ahli Muda Analis Pasar", "Bidang Perkebunan")
          ).map((employee) => ({
            title: "Ahli Muda Analis Pasar",
            employee,
          })),
          ...(pickEmployeeByKey(employees, "perkebunan-pengendali-opt")
            ? [pickEmployeeByKey(employees, "perkebunan-pengendali-opt") as EmployeeRecord]
            : pickEmployeesByUnit(employees, "Ahli Muda Pengendali Organisme Pengganggu Tumbuhan", "Bidang Perkebunan")
          ).map((employee) => ({
            title: "Ahli Muda Pengendali Organisme Pengganggu Tumbuhan",
            employee,
          })),
        ],
      },
      {
        title: "Bidang Penyuluhan",
        employee: pickEmployeeByKey(employees, "bidang-penyuluhan") ?? pickEmployeeByUnit(employees, "Bidang Penyuluhan", "Bidang Penyuluhan"),
        staff: [
          pickEmployeeByKey(employees, "penyuluhan-ahli-muda-1"),
          pickEmployeeByKey(employees, "penyuluhan-ahli-muda-2"),
        ].filter(Boolean).length
          ? [pickEmployeeByKey(employees, "penyuluhan-ahli-muda-1"), pickEmployeeByKey(employees, "penyuluhan-ahli-muda-2")]
              .filter(Boolean)
              .map((employee) => ({
                title: "Ahli Muda Penyuluh Pertanian",
                employee: employee as EmployeeRecord,
              }))
          : pickEmployeesByUnit(employees, "Ahli Muda Penyuluh Pertanian", "Bidang Penyuluhan").map((employee) => ({
          title: "Ahli Muda Penyuluh Pertanian",
          employee,
        })),
      },
    ],
    upt: {
      title: "Unit Pelaksana Teknis",
      employee: pickEmployeeByKey(employees, "upt") ?? pickEmployee(employees, "Unit Pelaksana Teknis"),
    },
  };

  return (
    <PublicShell navVariant="overlay">
      <main className="bg-[#f7fbf8]">
        <section
          className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center text-white md:min-h-[470px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(5,19,38,0.36),rgba(5,19,38,0.62)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&auto=format&fit=crop&q=80')",
          }}
        >
          <div className="relative">
            <h1 className="font-[var(--font-sora)] text-4xl font-black md:text-6xl">Profil Dinas</h1>
            <p className="mt-4 text-sm font-medium text-white/85 md:text-base">
              Visi, misi, dan arah pembangunan pertanian daerah.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Leaf className="h-4 w-4 text-[#25576a]" />
              <span className="text-[#0f7d3b]">Visi &amp; Misi</span>
            </div>
          </div>
        </section>

        <section className="relative -mt-10 rounded-t-[2.5rem] bg-[#f7fbf8] px-4 pb-20 pt-12 md:px-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-64 top-24 hidden h-[760px] w-[760px] rounded-full bg-[#d7f0de]/70 blur-3xl lg:block" />
            <div className="absolute -right-72 top-80 hidden h-[760px] w-[760px] rounded-full bg-[#cfe7ee]/75 blur-3xl lg:block" />
          </div>

          <div className="relative mx-auto max-w-[1400px]">
            <div className="text-center">
              <h2 className="font-[var(--font-sora)] text-3xl font-black leading-tight text-[#0c3f26] md:text-4xl">
                Visi dan Misi Dinas Pertanian
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#0f7d3b]" />
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-[#66766e] md:text-base">
                {shortOverview}.
              </p>
            </div>

            <div className="mt-12 grid gap-6 xl:grid-cols-2">
              <section className="relative overflow-hidden rounded-3xl border border-[#dce9e2] bg-white p-6 shadow-sm md:p-7">
                <p className="font-[var(--font-sora)] text-xl font-black uppercase tracking-[0.18em] text-[#0c4a2c]">Visi</p>
                <div className="mt-3 h-1 w-20 rounded-full bg-[#0f7d3b]" />
                <h3 className="mt-6 font-[var(--font-sora)] text-2xl font-black leading-[1.35] text-[#0c3f26] md:text-[32px]">
                  {profile.vision || fallbackDepartmentProfile.vision}
                </h3>
              </section>

              <section className="relative overflow-hidden rounded-3xl border border-[#dce9e2] bg-white p-6 shadow-sm md:p-7">
                <p className="font-[var(--font-sora)] text-xl font-black uppercase tracking-[0.18em] text-[#0c4a2c]">Misi</p>
                <div className="mt-3 h-1 w-20 rounded-full bg-[#0f7d3b]" />
                <div className="mt-5 divide-y divide-slate-200">
                  {missions.map((mission, index) => (
                    <div key={`${mission}-${index}`} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0f7d3b]" />
                      <p className="text-[15px] font-medium leading-7 text-[#25332c]">{mission}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-14">
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f7d3b]">Perbup Nomor 8 Tahun 2022</p>
                <h2 className="mt-3 font-[var(--font-sora)] text-3xl font-black leading-tight text-[#0c3f26] md:text-4xl">
                  Tugas Pokok dan Fungsi Dinas Pertanian
                </h2>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#0f7d3b]" />
                <p className="mx-auto mt-4 max-w-3xl text-sm font-medium leading-7 text-[#66766e] md:text-base">
                  Tugas Pokok dan Fungsi Dinas Pertanian Daerah Kabupaten Kepulauan Sangihe sesuai dengan Peraturan Bupati Kepulauan Sangihe Nomor 8 Tahun 2022.
                </p>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <article className="relative overflow-hidden rounded-3xl border border-[#cfe7d8] bg-[#eef8f1] p-6 shadow-sm md:p-7">
                  <p className="font-[var(--font-sora)] text-xl font-black uppercase tracking-[0.18em] text-[#0c4a2c]">
                    Tugas Pokok
                  </p>
                  <div className="mt-3 h-1 w-20 rounded-full bg-[#0f7d3b]" />
                  <h3 className="mt-6 font-[var(--font-sora)] text-lg font-black leading-[1.6] text-[#0c3f26] md:text-2xl">
                    {mainDuty}
                  </h3>
                </article>

                <article className="relative overflow-hidden rounded-3xl border border-[#dce9e2] bg-white p-6 shadow-sm md:p-7">
                  <p className="font-[var(--font-sora)] text-xl font-black uppercase tracking-[0.18em] text-[#0c4a2c]">Fungsi</p>
                  <div className="mt-3 h-1 w-20 rounded-full bg-[#0f7d3b]" />
                  <div className="mt-5 divide-y divide-slate-200">
                    {departmentFunctions.map((item, index) => (
                      <div key={`${item}-${index}`} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0f7d3b]" />
                        <p className="text-[15px] font-medium leading-7 text-[#25332c]">{item}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>

            <section className="mt-14">
              <div className="text-center">
                <h2 className="font-[var(--font-sora)] text-2xl font-black leading-tight text-[#0c3f26] md:text-3xl">
                  Peta Wilayah Dinas Pertanian
                </h2>
                <p className="mt-3 text-sm font-medium text-[#66766e]">
                  Kabupaten Kepulauan Sangihe, Sulawesi Utara
                </p>
                <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#0f7d3b]" />
              </div>

              <div className="mt-8 rounded-2xl border border-[#dce9e2] bg-white p-3 shadow-sm">
                <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-[#edf2ef] md:min-h-[430px]">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Dinas%20Pertanian%20Kabupaten%20Kepulauan%20Sangihe"
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-[#dce9e2] bg-white/95 px-3 py-2 text-xs font-bold text-[#66766e] shadow-sm transition hover:text-[#0f7d3b]"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Google Map
                  </a>
                  <iframe
                    title="Peta lokasi Dinas Pertanian Kabupaten Kepulauan Sangihe"
                    src="https://www.google.com/maps?q=Dinas%20Pertanian%20Kabupaten%20Kepulauan%20Sangihe&output=embed"
                    className="h-full min-h-[360px] w-full md:min-h-[430px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </section>

            <section className="mt-16">
              <div className="text-center">
                <h2 className="font-[var(--font-sora)] text-2xl font-black leading-tight text-[#0c3f26] md:text-3xl">
                  Struktur Organisasi Pertanian
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-7 text-[#66766e]">
                  Garis komando Dinas Pertanian Daerah Tipe B Kabupaten Kepulauan Sangihe.
                </p>
                <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#0f7d3b]" />
              </div>

              <div className="mt-10 rounded-3xl border border-[#dce9e2] bg-white p-5 shadow-sm md:p-8">
                {employees.length ? (
                  <>
                    <div className="lg:hidden">
                      <div className="mx-auto max-w-sm">
                        <OrganizationCard node={organizationChart.head} highlight />
                      </div>

                      <div className="mx-auto h-8 w-px bg-[#a9d7b8]" />

                      <div className="mx-auto max-w-sm">
                        <OrganizationCard node={organizationChart.secretary} />
                      </div>

                      <div className="mx-auto h-8 w-px bg-[#a9d7b8]" />

                      <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
                        {organizationChart.secretariat.map((node) => (
                          <OrganizationCard key={node.title} node={node} />
                        ))}
                      </div>

                      <div className="mx-auto mt-2 h-10 w-px bg-[#a9d7b8]" />

                      <div className="grid gap-5 pt-8 md:grid-cols-2">
                        {organizationChart.divisions.map((division) => (
                          <div key={division.title}>
                            <OrganizationCard node={division} />
                            <div className="mt-3 space-y-3">
                              {division.staff.map((node, index) => (
                                <OrganizationCard key={`${division.title}-${node.title}-${node.employee?.id ?? index}`} node={node} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mx-auto mt-6 h-8 w-px bg-[#a9d7b8]" />

                      <div className="mx-auto max-w-sm">
                        <OrganizationCard node={organizationChart.upt} />
                      </div>
                    </div>

                    <div className="hidden overflow-x-auto lg:block">
                      <div className="relative mx-auto h-[1190px] min-w-[1280px] max-w-[1340px] bg-white">
                        <div className="absolute top-[182px] h-[850px] w-0.5 bg-[#17231d]" style={{ left: "50%" }} />
                        <div className="absolute top-[260px] h-0.5 bg-[#17231d]" style={{ left: "50%", right: "29%" }} />
                        <div className="absolute top-[580px] h-0.5 bg-[#17231d]" style={{ left: "7%", right: "7%" }} />
                        <div className="absolute top-[260px] h-3 w-3 rotate-45 border-r-2 border-t-2 border-[#17231d]" style={{ left: "70.3%" }} />

                        <div className="absolute top-[288px] h-[82px] w-0.5 bg-[#17231d]" style={{ left: "72%" }} />
                        <div className="absolute top-[370px] h-0.5 bg-[#17231d]" style={{ left: "55%", right: "5%" }} />
                        {[55, 85].map((left) => (
                          <div key={`secretariat-line-${left}`} className="absolute top-[370px] h-9 w-0.5 bg-[#17231d]" style={{ left: `${left}%` }} />
                        ))}

                        {[14, 34, 54, 74].map((left) => (
                          <div key={`division-line-${left}`} className="absolute top-[580px] h-11 w-0.5 bg-[#17231d]" style={{ left: `${left}%` }} />
                        ))}

                        <div className="absolute top-[1032px] h-11 w-0.5 bg-[#17231d]" style={{ left: "50%" }} />

                        <div className="absolute top-[86px] w-[360px] -translate-x-1/2" style={{ left: "50%" }}>
                          <CommandCard node={organizationChart.head} highlight />
                        </div>

                        <div className="absolute top-[226px] w-[300px] -translate-x-1/2" style={{ left: "72%" }}>
                          <CommandCard node={organizationChart.secretary} />
                        </div>

                        {organizationChart.secretariat.map((node, index) => (
                          <div key={`secretariat-${node.title}`} className="absolute top-[399px] w-[300px] -translate-x-1/2" style={{ left: index === 0 ? "55%" : "85%" }}>
                            <CommandCard node={node} compact />
                          </div>
                        ))}

                        <div className="absolute top-[631px] grid w-full grid-cols-4 gap-5 px-8">
                          {organizationChart.divisions.map((division) => (
                            <div key={division.title} className="relative">
                              <CommandCard node={division} compact />

                              {division.staff.length ? (
                                <div className="relative mt-6 space-y-4 pl-5">
                                  <div className="absolute bottom-0 left-2 top-0 w-0.5 bg-[#17231d]" />
                                  {division.staff.map((node, index) => (
                                    <div key={`${division.title}-${node.title}-${node.employee?.id ?? index}`} className="relative">
                                      <div className="absolute left-[-12px] top-1/2 h-0.5 w-3 bg-[#17231d]" />
                                      <CommandCard node={node} compact />
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>

                        <div className="absolute top-[1073px] w-[260px] -translate-x-1/2" style={{ left: "50%" }}>
                          <CommandCard node={organizationChart.upt} compact />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#a9d7b8] bg-[#f7fbf8] px-5 py-12 text-center">
                    <UserRound className="mx-auto h-10 w-10 text-[#0f7d3b]" />
                    <h3 className="mt-4 font-[var(--font-sora)] text-lg font-black text-[#0c3f26]">Struktur organisasi belum tersedia</h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-7 text-[#66766e]">
                      Data akan tampil setelah pegawai aktif ditambahkan dari dashboard admin Struktur Pegawai.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
