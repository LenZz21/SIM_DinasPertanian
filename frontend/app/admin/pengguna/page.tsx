"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUsers } from "@/lib/api/users";
import type { User } from "@/lib/types/api";

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      getUsers(search ? { search } : undefined)
        .then((res) => setUsers(res.data))
        .catch(() => setUsers([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search).get("q") ?? "";
    setSearch(query);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[var(--font-sora)] text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-sm text-muted-foreground">Kelola akun Admin, Petugas, dan Mitra Petani.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search pengguna..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.roles?.[0] ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "success" : "destructive"}>
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
