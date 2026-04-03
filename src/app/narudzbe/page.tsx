'use client';

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";
import { ShoppingCart, LogIn, Clock, FileCheck2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NarudzbePage() {
  const orders = useLiveQuery(() => db.orders.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());
  const offers = useLiveQuery(() => db.offers.toArray());

  const getStatusBadge = (status: string) => {
    switch(status) {
       case 'U_TJEKU': return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200"><Clock className="mr-1 h-3 w-3" /> U narudžbi / Putuje</Badge>;
       case 'ZAVRSENO': return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200"><FileCheck2 className="mr-1 h-3 w-3" /> Isporučeno / Zatvoreno</Badge>;
       case 'OTKAZANO': return <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200"><AlertCircle className="mr-1 h-3 w-3" /> Otkazano</Badge>;
       default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="bg-emerald-100/50 p-2 rounded-lg"><ShoppingCart className="h-7 w-7 text-emerald-600" /></div>
             Aktivne Narudžbe
          </h2>
          <p className="text-slate-500 mt-2">Pratite hardware i sirovinu u dolasku do vašeg skladišta na temelju odobrenih ponuda.</p>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
           <CardTitle className="text-slate-800 text-lg">Centralni registar isporuka</CardTitle>
           <CardDescription className="mt-1">Povezuje Ponude, Narudžbe i Dobavljače u jednu liniju vidljivosti.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 pl-6">Broj Narudžbe</TableHead>
                <TableHead className="font-semibold text-slate-600">Referentna Ponuda</TableHead>
                <TableHead className="font-semibold text-slate-600">Naručitelj (Naš Kupac)</TableHead>
                <TableHead className="font-semibold text-slate-600">Očekivani Datum Dolaska</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 pr-6">Alati</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders === undefined ? (
                <TableRow>
                   <TableCell colSpan={6} className="text-center py-16 text-slate-400">
                     <span className="animate-pulse">Tražim aktivne narudžbe...</span>
                   </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                    Nema aktivnih narudžbi.<br/>
                    Kreirajate ih pritiskom na "Zatvori u Narudžbu" na pregledu neke važeće ponude.
                  </TableCell>
                </TableRow>
              ) : (
                orders?.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map((order) => {
                   const customer = customers?.find(c => c.id === order.customerId);
                   const offer = offers?.find(o => o.id === order.offerId);

                   return (
                     <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-900 pl-6">{order.brojNarudzbe}</TableCell>
                        <TableCell>
                           <Link href={`/ponude/${order.offerId}`} className="text-indigo-600 hover:text-indigo-800 hover:underline font-mono text-xs">
                             {offer?.brojPonude || 'Ukaz na ponudu'}
                           </Link>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                           {customer?.nazivTvrtke || <span className="text-slate-400 italic">Nepoznato</span>}
                        </TableCell>
                        <TableCell>
                           {order.ocekivaniDatumIsporuke ? (
                              <div className="flex items-center gap-2 text-slate-700 font-medium">
                                 {new Date(order.ocekivaniDatumIsporuke).toLocaleDateString("hr-HR")}
                              </div>
                           ) : <span className="text-slate-400 italic text-sm">Nije definirano</span>}
                        </TableCell>
                        <TableCell className="text-center">
                           {getStatusBadge(order.statusNarudzbe)}
                        </TableCell>
                        <TableCell className="text-right space-x-1 pr-6">
                           <Link href={`/narudzbe/${order.id}`}>
                              <Button variant="secondary" size="sm" className="shadow-sm font-semibold">
                                 Obradi logistiku <LogIn className="ml-2 h-4 w-4" />
                              </Button>
                           </Link>
                        </TableCell>
                     </TableRow>
                   );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
