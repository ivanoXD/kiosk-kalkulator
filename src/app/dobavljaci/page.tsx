'use client';

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Pencil, Trash2, Mail, Phone, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function DobavljaciPage() {
  const suppliers = useLiveQuery(() => db.suppliers.toArray());

  const handleDelete = async (id: string) => {
    if (confirm("Brisanjem dobavljača gubite izravnu poveznicu prema njemu. Jeste li sigurni?")) {
      await db.suppliers.delete(id);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="bg-amber-100/50 p-2 rounded-lg"><Truck className="h-7 w-7 text-amber-600" /></div>
             Dobavljači
          </h2>
          <p className="text-slate-500 mt-2">Baza tvrtki koje pružaju hardver, softver ili izvođenje usluga obrade za Vas.</p>
        </div>
        <Link href="/dobavljaci/novo">
          <Button className="font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30 rounded-xl px-5">
            <Plus className="mr-2 h-5 w-5" /> Dodaj Dobavljača
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
           <div className="flex items-center justify-between">
              <div>
                 <CardTitle className="text-slate-800 text-lg">Registar partnera</CardTitle>
                 <CardDescription className="mt-1">Kada ponudu pretvarate u narudžbu, ovdje birate prema kome se narudžba odnosi.</CardDescription>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 w-1/4">Naziv Partnera</TableHead>
                <TableHead className="font-semibold text-slate-600">OIB</TableHead>
                <TableHead className="font-semibold text-slate-600">Naš Kontakt</TableHead>
                <TableHead className="font-semibold text-slate-600">Kanali Komunikacije</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers === undefined ? (
                <TableRow>
                   <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                     <span className="animate-pulse">Dohvaćanje partnera...</span>
                   </TableCell>
                </TableRow>
              ) : suppliers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                    Nemate registriranih dobavljača u bazi. <br />
                    <Link href="/dobavljaci/novo">
                      <Button variant="link" className="mt-2 text-amber-600 hover:text-amber-800 font-semibold text-base px-0">Prijavite novog dobavljača 🚀 </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                suppliers?.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                         {supplier.nazivTvrtke}
                      </div>
                      <div className="text-xs text-slate-400 font-normal truncate mt-0.5 max-w-[200px]">{supplier.adresa || 'Adresa nije evidentirana'}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{supplier.oib || '-'}</TableCell>
                    <TableCell className="text-slate-700">
                        {supplier.kontaktOsoba || <span className="text-slate-400 italic">Nepoznato</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 text-sm">
                         {supplier.email && (
                            <div className="flex items-center gap-2 text-slate-600">
                               <Mail className="h-3.5 w-3.5 text-amber-500" /> {supplier.email}
                            </div>
                         )}
                         {supplier.telefon && (
                            <div className="flex items-center gap-2 text-slate-600">
                               <Phone className="h-3.5 w-3.5 text-slate-400" /> {supplier.telefon}
                            </div>
                         )}
                         {!supplier.email && !supplier.telefon && (
                            <span className="text-slate-400 italic">Broj telefona je nepoznat</span>
                         )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Link href={`/dobavljaci/${supplier.id}`}>
                         <Button variant="ghost" size="icon" className="text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                            <Pencil className="h-4 w-4" />
                         </Button>
                       </Link>
                       <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(supplier.id)}>
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
