'use client';

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeEuro, Presentation, ShoppingCart, Users, Store, Zap, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const offers = useLiveQuery(() => db.offers.toArray()) || [];
  const orders = useLiveQuery(() => db.orders.toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const models = useLiveQuery(() => db.kioskModels.toArray()) || [];

  const totalPotencijalZarade = offers
     .filter(o => o.statusPonude !== "OTKAZANO" && o.statusPonude !== "ODBIJENO")
     .reduce((acc, curr) => acc + curr.ukupniProfit, 0);

  const totalPrometSvi = offers
     .filter(o => o.statusPonude === "U_NARUDZBI")
     .reduce((acc, curr) => acc + curr.ukupnoSPdv, 0);

  const aktivneNarudzbe = orders.filter(o => o.statusNarudzbe === "U_TJEKU").length;

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out pb-20 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Dobrodošli nazad.</h2>
          <p className="text-slate-500 mt-1 font-medium">Lokalno PWA okruženje je učitano (Offline-First). Podaci su osigurani.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/ponude/novo">
             <Button className="font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30">
               <Zap className="mr-2 h-4 w-4 text-indigo-200" /> Nova Kalkulacija (Brzo)
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* KARTICA 1 */}
         <Card className="border-emerald-100 bg-emerald-50/30 overflow-hidden shadow-sm shadow-emerald-100/50">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Planirani Profit</CardTitle>
             <BadgeEuro className="h-4 w-4 text-emerald-600" />
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-black text-emerald-700">€{totalPotencijalZarade.toLocaleString("hr-HR", { minimumFractionDigits: 2 })}</div>
             <p className="text-xs text-emerald-600/80 font-medium mt-1">Sve ponude koje nisu arhivirano propale.</p>
           </CardContent>
         </Card>

         {/* KARTICA 2 */}
         <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden shadow-sm shadow-indigo-100/50">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-indigo-900 uppercase tracking-widest">Osigurani Promet</CardTitle>
             <ShoppingCart className="h-4 w-4 text-indigo-600" />
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-black text-indigo-700">€{totalPrometSvi.toLocaleString("hr-HR", { minimumFractionDigits: 2 })}</div>
             <p className="text-xs text-indigo-600/80 font-medium mt-1">Bruto naplata po realiziranim narudžbama.</p>
           </CardContent>
         </Card>

         {/* KARTICA 3 */}
         <Card className="border-amber-100 bg-amber-50/30 overflow-hidden shadow-sm shadow-amber-100/50">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-amber-900 uppercase tracking-widest">U Transportu</CardTitle>
             <Clock className="h-4 w-4 text-amber-600" />
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-black text-amber-700">{aktivneNarudzbe}</div>
             <p className="text-xs text-amber-600/80 font-medium mt-1">Broj otvorenih pošiljki / dostava.</p>
           </CardContent>
         </Card>

         {/* KARTICA 4 */}
         <Card className="border-blue-100 bg-blue-50/30 overflow-hidden shadow-sm shadow-blue-100/50">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-blue-900 uppercase tracking-widest">Baza Podataka</CardTitle>
             <Store className="h-4 w-4 text-blue-600" />
           </CardHeader>
           <CardContent>
             <div className="flex gap-4 mt-2">
                 <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-blue-700">{customers.length}</span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Kupaca</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-blue-700">{models.length}</span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Modela</span>
                 </div>
             </div>
           </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
         
         <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Presentation className="h-5 w-5 text-indigo-500" /> Zadnje Skice & Ponude</h3>
            <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-100">
               {offers.slice().sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map(offer => {
                  const cust = customers.find(c => c.id === offer.customerId);
                  return (
                     <Link key={offer.id} href={`/ponude/${offer.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div>
                           <div className="font-semibold text-slate-800 text-sm">{offer.brojPonude}</div>
                           <div className="text-xs text-slate-500">{cust?.nazivTvrtke}</div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-slate-900 text-sm">€{offer.ukupnoSPdv.toFixed(2)}</div>
                           <div className="text-[10px] font-medium text-emerald-600">Profit: €{offer.ukupniProfit.toFixed(0)}</div>
                        </div>
                     </Link>
                  )
               })}
               {offers.length === 0 && <div className="p-8 text-center text-slate-500 font-medium text-sm">Nema aktivnih ponuda.</div>}
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Najnovije Aktivne Narudžbe</h3>
            <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-100">
               {orders.filter(o => o.statusNarudzbe === "U_TJEKU").slice().sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map(order => {
                  const cust = customers.find(c => c.id === order.customerId);
                  return (
                     <Link key={order.id} href={`/narudzbe/${order.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div>
                           <div className="font-semibold text-slate-800 text-sm">{order.brojNarudzbe}</div>
                           <div className="text-xs text-slate-500">{cust?.nazivTvrtke}</div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           <div className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">U tranzitu</div>
                           {order.ocekivaniDatumIsporuke && <div className="text-[10px] text-slate-400 mt-1">Očekivano: {new Date(order.ocekivaniDatumIsporuke).toLocaleDateString("hr-HR")}</div>}
                        </div>
                     </Link>
                  )
               })}
               {orders.filter(o => o.statusNarudzbe === "U_TJEKU").length === 0 && <div className="p-8 text-center text-slate-500 font-medium text-sm">Nema aktivnih narudžbi na ruti.</div>}
            </div>
         </div>

      </div>

    </div>
  );
}
