'use client';

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, FileText, Pencil, Trash2, Printer, CheckCircle, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PonudePage() {
  const offers = useLiveQuery(() => db.offers.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  // Helper map to quickly find customer names
  const customerMap = customers?.reduce((acc, curr) => {
    acc[curr.id] = curr.nazivTvrtke;
    return acc;
  }, {} as Record<string, string>) || {};

  const handleDelete = async (id: string, offerNum: string) => {
    if (confirm(`Brisanjem gubite ovu ponudu zauvijek (${offerNum}). Potvrdite brisanje?`)) {
      await db.offers.delete(id);
      // Delete all related items manually since dexie doesn't auto-cascade easily
      const items = await db.offerItems.where('offerId').equals(id).toArray();
      const itemIds = items.map(i => i.id);
      await db.offerItems.bulkDelete(itemIds);
    }
  };

  const handleClone = async (offerId: string) => {
    const original = await db.offers.get(offerId);
    if (!original) return;

    const items = await db.offerItems.where('offerId').equals(offerId).toArray();
    
    const newOfferId = crypto.randomUUID();
    const newOffer = {
      ...original,
      id: newOfferId,
      brojPonude: `${original.brojPonude}-COPY`,
      datumPonude: new Date(),
      statusPonude: 'SKICA',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    const newItems = items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      offerId: newOfferId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.offers.add(newOffer);
    await db.offerItems.bulkAdd(newItems as any);
    alert(`Ponuda ${original.brojPonude} je uspješno klonirana u ${newOffer.brojPonude}`);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
       case 'SKICA': return <Badge variant="outline" className="text-slate-500 bg-slate-100 border-slate-200">Skica</Badge>;
       case 'ODOBRENO': return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Klijent odobrio</Badge>;
       case 'U_NARUDZBI': return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Status narudžbe</Badge>;
       case 'ODBIJENO': return <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200">Odbijeno</Badge>;
       default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="bg-indigo-100/50 p-2 rounded-lg"><FileText className="h-7 w-7 text-indigo-600" /></div>
             Ponude Klijentima
          </h2>
          <p className="text-slate-500 mt-2">Financijska evidencija ponuda. Praćenje čistog profita i prodajnih marži po poslovanju.</p>
        </div>
        <Link href="/ponude/novo">
          <Button className="font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 rounded-xl px-5">
            <Plus className="mr-2 h-5 w-5" /> Napravi Ponudu
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
           <div className="flex items-center justify-between">
              <div>
                 <CardTitle className="text-slate-800 text-lg">Registar kalkulacija i ponuda</CardTitle>
                 <CardDescription className="mt-1">Napomena: Moguće je pratiti status od Skice pa sve do Narudžbe i provedene isporuke.</CardDescription>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 pl-6">ID Ponude</TableHead>
                <TableHead className="font-semibold text-slate-600">Datum i Klijent</TableHead>
                <TableHead className="font-semibold text-slate-600">Status Vrijednosti</TableHead>
                <TableHead className="text-right font-semibold text-indigo-950 border-l border-slate-100 border-dashed bg-slate-50/50">Ukupan trošak</TableHead>
                <TableHead className="text-right font-semibold text-indigo-950 bg-slate-50/50 border-slate-100 border-dashed border-r border-t-transparent">Iznos (PDV Ukulj.)</TableHead>
                <TableHead className="text-center font-semibold text-slate-600 font-mono tracking-wide">Marža</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 pr-6">Alati i Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers === undefined ? (
                <TableRow>
                   <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                     <span className="animate-pulse">Pregledavanje ponuda...</span>
                   </TableCell>
                </TableRow>
              ) : offers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-500">
                    Baza ponuda vas očekuje na vaš prvi poslovni korak. <br />
                    <Link href="/ponude/novo">
                      <Button variant="link" className="mt-2 text-indigo-600 hover:text-indigo-800 font-semibold text-base px-0">Pritisnite kako biste krenuli na izradu forme 🚀 </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                offers?.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map((offer) => (
                   <TableRow key={offer.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900 pl-6">{offer.brojPonude}</TableCell>
                      <TableCell>
                         <div className="font-medium text-slate-800">{customerMap[offer.customerId] || 'Nepoznat Kupac'}</div>
                         <div className="text-xs text-slate-400 mt-0.5">{offer.datumPonude.toLocaleDateString("hr-HR")}</div>
                      </TableCell>
                      <TableCell>
                         {getStatusBadge(offer.statusPonude)}
                      </TableCell>
                      
                      <TableCell className="text-right border-l border-slate-100 border-dashed bg-slate-50/50">
                          <span className="text-slate-400 text-xs">Nabava:</span> <span className="font-medium text-slate-500">€{offer.ukupnaNabavnaVrijednost.toFixed(2)}</span>
                      </TableCell>
                      
                      <TableCell className="text-right border-r border-slate-100 border-dashed bg-slate-50/50">
                          <div className="font-bold text-slate-900 text-base">€{offer.ukupnoSPdv.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">+PDV {offer.pdvStopa}%</div>
                      </TableCell>

                      <TableCell className="text-center">
                         <div className="flex flex-col items-center justify-center">
                            <span className="font-semibold text-emerald-600">€{offer.ukupniProfit.toFixed(2)}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold mt-1">{offer.ukupnaMarzaPostotak.toFixed(1)}%</span>
                         </div>
                      </TableCell>

                      <TableCell className="text-right space-x-1 pr-6">
                         <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Kloniraj ponudu" onClick={() => handleClone(offer.id)}>
                            <Copy className="h-4 w-4" />
                         </Button>
                         <Link href={`/ponude/${offer.id}/edit`}>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Uredi ponudu">
                               <Pencil className="h-4 w-4" />
                            </Button>
                         </Link>
                         <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Obriši trajno" onClick={() => handleDelete(offer.id, offer.brojPonude)}>
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
