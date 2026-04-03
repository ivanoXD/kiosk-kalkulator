'use client';

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Users, Pencil, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function KupciPage() {
  const customers = useLiveQuery(() => db.customers.toArray());

  const handleDelete = async (id: string) => {
    if (confirm("Jeste li sigurni da želite obrisati podatke o naručitelju? Podaci na postojećim ponudama ostat će funkcionalni, ali kontakt više neće biti izlistan u tablici.")) {
      await db.customers.delete(id);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="bg-emerald-100/50 p-2 rounded-lg"><Users className="h-7 w-7 text-emerald-600" /></div>
             Kupci (Naručitelji)
          </h2>
          <p className="text-slate-500 mt-2">Baza klijenata kojima šaljete digitalne kiosk ponude na temelju prethodnih evidencija.</p>
        </div>
        <Link href="/kupci/novo">
          <Button className="font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 rounded-xl px-5">
            <Plus className="mr-2 h-5 w-5" /> Novi Naručitelj
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
           <div className="flex items-center justify-between">
              <div>
                 <CardTitle className="text-slate-800 text-lg">Evidencija svih dionika</CardTitle>
                 <CardDescription className="mt-1">Prikazuje listu registriranih klijenata bez ponavljanja upisa pri novim ponudama.</CardDescription>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 w-1/4">Naziv Firme / Entiteta</TableHead>
                <TableHead className="font-semibold text-slate-600">OIB (ID)</TableHead>
                <TableHead className="font-semibold text-slate-600">Kontakt Osoba</TableHead>
                <TableHead className="font-semibold text-slate-600">Kontakt Informacije</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers === undefined ? (
                <TableRow>
                   <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                     <span className="animate-pulse">Pregledavanje lokalnih korisnika...</span>
                   </TableCell>
                </TableRow>
              ) : customers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                    Baza kupaca je trenutno prazna. <br />
                    <Link href="/kupci/novo">
                      <Button variant="link" className="mt-2 text-emerald-600 hover:text-emerald-800 font-semibold text-base px-0">Registrirajte novog kupca 🚀 </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                customers?.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                         {customer.nazivTvrtke}
                      </div>
                      <div className="text-xs text-slate-400 font-normal truncate mt-0.5 max-w-[200px]">{customer.adresaRacun || 'Adresa nije poznata'}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{customer.oib || '-'}</TableCell>
                    <TableCell className="text-slate-700">
                        {customer.kontaktOsoba || <span className="text-slate-400 italic">Nepoznato</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 text-sm">
                         {customer.email && (
                            <div className="flex items-center gap-2 text-slate-600">
                               <Mail className="h-3.5 w-3.5 text-emerald-500" /> {customer.email}
                            </div>
                         )}
                         {customer.telefon && (
                            <div className="flex items-center gap-2 text-slate-600">
                               <Phone className="h-3.5 w-3.5 text-slate-400" /> {customer.telefon}
                            </div>
                         )}
                         {!customer.email && !customer.telefon && (
                            <span className="text-slate-400 italic">Nema unosa</span>
                         )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Link href={`/kupci/${customer.id}`}>
                         <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                            <Pencil className="h-4 w-4" />
                         </Button>
                       </Link>
                       <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
