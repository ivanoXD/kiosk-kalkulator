'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, Order, Offer, Customer, Supplier } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save, Calendar, CheckCircle2, Factory } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NarudzbaDetaljiPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states specifically for updating the order dates and supplier
  const [form, setForm] = useState({
     supplierId: "",
     statusNarudzbe: "U_TJEKU",
     ocekivaniDatumIsporuke: "",
     stvarniDatumIsporuke: "",
     internaNapomena: ""
  });

  useEffect(() => {
     async function loadData() {
        if (!id) return;
        try {
           const o = await db.orders.get(id);
           if (!o) {
              alert("Narudžba nije pronađena.");
              router.push("/narudzbe");
              return;
           }
           setOrder(o);

           if (o.offerId) {
             const off = await db.offers.get(o.offerId);
             if (off) setOffer(off);
           }

           const sups = await db.suppliers.toArray();
           setSuppliers(sups);

           // Hydrate form
           setForm({
              supplierId: o.supplierId || "",
              statusNarudzbe: o.statusNarudzbe,
              ocekivaniDatumIsporuke: o.ocekivaniDatumIsporuke ? new Date(o.ocekivaniDatumIsporuke).toISOString().split('T')[0] : "",
              stvarniDatumIsporuke: o.stvarniDatumIsporuke ? new Date(o.stvarniDatumIsporuke).toISOString().split('T')[0] : "",
              internaNapomena: o.internaNapomena || ""
           });

        } catch (e) {
           console.error(e);
        } finally {
           setLoading(false);
        }
     }
     loadData();
  }, [id, router]);

  const handleChange = (field: string, val: string) => {
     setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
     e.preventDefault();
     setSaving(true);
     try {
       const u = {
          supplierId: form.supplierId || null,
          statusNarudzbe: form.statusNarudzbe,
          ocekivaniDatumIsporuke: form.ocekivaniDatumIsporuke ? new Date(form.ocekivaniDatumIsporuke) : null,
          stvarniDatumIsporuke: form.stvarniDatumIsporuke ? new Date(form.stvarniDatumIsporuke) : null,
          internaNapomena: form.internaNapomena,
          updatedAt: new Date()
       };
       await db.orders.update(id, u);

       // Optional: Ako je završeno, možemo postaviti offer ponudu u zatvorenu arhivu.

       router.push("/narudzbe");
     } catch (e) {
       console.error(e);
       alert("Greška kod auriranja.");
     } finally {
       setSaving(false);
     }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Učitavanje podataka...</div>;
  if (!order) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Link href="/narudzbe">
          <Button variant="outline" size="icon" className="rounded-xl shadow-sm border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upravljanje isporukom - {order.brojNarudzbe}</h2>
          <p className="text-slate-500 mt-1">Popratna administracija isporuke tvornice do vas, te od vas do klijenta.</p>
        </div>
      </div>

      {offer && (
         <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
            <CardHeader className="py-4">
               <CardTitle className="text-emerald-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> 
                  Kalkulacijski plan je zaključan.
               </CardTitle>
            </CardHeader>
            <CardContent className="py-2 text-sm text-emerald-800">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <span className="font-semibold block">Vrijednost narudžbe:</span> 
                     <span className="text-xl font-bold font-mono">€{offer.ukupnoSPdv.toFixed(2)}</span>
                  </div>
                  <div>
                     <span className="font-semibold block">Očekivani profit:</span> 
                     <span className="text-xl font-bold font-mono">€{offer.ukupniProfit.toFixed(2)}</span>
                     <span className="text-xs ml-2 bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded">Marža: {offer.ukupnaMarzaPostotak.toFixed(1)}%</span>
                  </div>
               </div>
            </CardContent>
         </Card>
      )}

      <form onSubmit={handleSave} className="pb-10">
        <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
             <div className="flex gap-3 items-center">
                 <Calendar className="h-6 w-6 text-slate-400" />
                 <div>
                    <CardTitle className="text-slate-800 text-lg">Logistički Podaci i Dobavljač</CardTitle>
                    <CardDescription>Evidentiranje vremenskog okvira pristizanja opreme s istoka ili lokalne proizvodnje.</CardDescription>
                 </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="space-y-2.5">
                 <Label className="text-slate-600 font-semibold text-sm">Status poslovanja</Label>
                  <Select value={form.statusNarudzbe} onValueChange={(v) => handleChange("statusNarudzbe", v ?? "")}>
                   <SelectTrigger className="bg-white shadow-sm h-11 border-slate-200">
                     <SelectValue placeholder="Odaberi..." />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="U_TJEKU" className="font-medium">Narudžba zaprimljena / U tranzitu</SelectItem>
                     <SelectItem value="ZAVRSENO" className="font-medium">Materijal stigao / Isporuka zatvorena</SelectItem>
                     <SelectItem value="OTKAZANO" className="font-medium text-rose-600">Poništeno / Otkazano</SelectItem>
                   </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2.5">
                 <Label className="text-slate-600 font-semibold text-sm flex items-center gap-1.5"><Factory className="h-4 w-4" /> Hardver osigurava: (Dobavljač)</Label>
                 <Select value={form.supplierId} onValueChange={(v) => handleChange("supplierId", v ?? "")}>
                   <SelectTrigger className="bg-white shadow-sm h-11 border-slate-200">
                     <SelectValue placeholder="Odaberite partnera (Opcionalno)" />
                   </SelectTrigger>
                   <SelectContent>
                     {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id} className="font-medium">{s.nazivTvrtke}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

            </div>

            <hr className="border-slate-100 my-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div className="space-y-2.5">
                <Label htmlFor="ocekivaniDatumIsporuke" className="text-slate-600 font-semibold text-sm">Planirani / Očekivani datum narudžbe</Label>
                <Input type="date" id="ocekivaniDatumIsporuke" value={form.ocekivaniDatumIsporuke} onChange={(e) => handleChange("ocekivaniDatumIsporuke", e.target.value)} className="bg-white h-11 shadow-sm" />
               </div>
               
               <div className="space-y-2.5 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 -m-3">
                <Label htmlFor="stvarniDatumIsporuke" className="text-emerald-900 font-bold text-sm">Stvarni datum kada je posao zgotovljen</Label>
                <Input type="date" id="stvarniDatumIsporuke" value={form.stvarniDatumIsporuke} onChange={(e) => handleChange("stvarniDatumIsporuke", e.target.value)} className="bg-white shadow-sm h-11 font-medium border-emerald-200 focus-visible:ring-emerald-500" />
                <p className="text-[10px] text-emerald-600/70 mt-1 uppercase tracking-widest font-semibold">Ispunjava se samo po završetku projekta</p>
               </div>
            </div>
            
            <div className="space-y-2.5 pt-4 border-t border-slate-100 mt-8">
               <Label htmlFor="napomena" className="text-slate-600 font-semibold text-sm">Problemi u isporuci / Bilješka</Label>
               <Textarea id="napomena" rows={4} value={form.internaNapomena} onChange={(e) => handleChange("internaNapomena", e.target.value)} placeholder="Zabilježite ukoliko je brod ili let kasnio te je li to utjecalo na cijenu skladišta." className="resize-none shadow-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>

            <div className="pt-8 flex items-center justify-end gap-3">
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 px-8 h-12 text-base rounded-xl transition-all font-semibold select-none group">
                <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Ažuriraj stanje pošiljke
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
