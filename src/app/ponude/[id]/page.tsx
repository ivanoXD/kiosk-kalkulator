'use client';

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { db, Offer, OfferItem, Customer, Settings, generateId } from "@/lib/db";
import generatePDF from "react-to-pdf";
import Link from "next/link";
import { ArrowLeft, Printer, FileDown, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrikazPonudePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     async function loadData() {
        if (!id) return;
        try {
           const o = await db.offers.get(id);
           if (!o) {
              alert("Ponuda ne postoji.");
              router.push("/ponude");
              return;
           }
           setOffer(o);

           const i = await db.offerItems.where('offerId').equals(id).sortBy('sortOrder');
           setItems(i);

           const c = await db.customers.get(o.customerId);
           if (c) setCustomer(c);

           const s = await db.settings.toArray();
           if(s.length > 0) setSettings(s[0]);

        } catch (e) {
           console.error("Greska", e);
        } finally {
           setLoading(false);
        }
     }
     loadData();
  }, [id, router]);

  const handleKreirajNarudzbu = async () => {
     if(!offer) return;
     if(!confirm("Jeste li sigurni da je ponuda odobrena? Ovo će fiksirati ponudu i prebaciti poslovanje u fazu narudžbe i isporuke.")) return;
     try {
         const orderId = generateId();
         const ts = new Date();
         await db.orders.add({
            id: orderId,
            brojNarudzbe: "NAR-" + offer.brojPonude.replace("PON-", ""),
            offerId: offer.id,
            customerId: offer.customerId,
            datumNarudzbe: ts,
            statusNarudzbe: 'U_TJEKU',
            createdAt: ts,
            updatedAt: ts
         });
         await db.offers.update(offer.id, { statusPonude: "U_NARUDZBI" });
         router.push(`/narudzbe/${orderId}`);
     } catch(e) { 
         console.error(e);
         alert("Greška kod kreiranja narudžbe.");
     }
  }

  const targetRef = React.useRef<HTMLDivElement>(null);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Učitavanje dokumenta...</div>;
  if (!offer) return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out pb-20">
      
      {/* HEADER CONTROLS*/}
      <div className="print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-100 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-4">
           <Link href="/ponude">
             <Button variant="outline" size="sm" className="rounded-lg shadow-sm">
               <ArrowLeft className="h-4 w-4 mr-2" /> Natrag na popis
             </Button>
           </Link>
           <h2 className="text-lg font-bold text-slate-700">Prikaz dokumenta</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <Button variant="secondary" className="bg-white border text-slate-700" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-indigo-600/30 shadow-md" onClick={() => generatePDF(targetRef, { filename: `${offer?.brojPonude || 'ponuda'}.pdf` })}><FileDown className="mr-2 h-4 w-4" /> Preuzmi PDF za Klijenta</Button>
           <Button onClick={handleKreirajNarudzbu} disabled={offer.statusPonude !== 'SKICA' && offer.statusPonude !== 'U_IZRADI' && offer.statusPonude !== 'INTERNO_ODOBRENO'} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <CheckCircle className="mr-2 h-4 w-4" /> Zatvori u Narudžbu
           </Button>
        </div>
      </div>

      <div className="bg-slate-200/50 p-4 md:p-8 rounded-2xl flex justify-center print:bg-white print:p-0 print:m-0">
         
         <div ref={targetRef} className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[10mm] md:p-[20mm] shadow-xl border border-slate-200 print:shadow-none print:border-none print:m-0 print:w-full">
            
            {/* ZAGLAVLJE */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-8 mb-8">
               <div className="space-y-4 max-w-[50%]">
                  {settings?.companyName ? (
                    <div>
                     <h1 className="text-xl font-bold text-slate-900">{settings.companyName}</h1>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {settings.companyAddress && <>{settings.companyAddress}<br/></>}
                        {settings.companyOib && <>OIB: {settings.companyOib}<br/></>}
                        {settings.companyIban && <>IBAN: {settings.companyIban}<br/></>}
                        {(settings.companyEmail || settings.companyPhone) && <>Kontakt: {settings.companyEmail} | {settings.companyPhone}</>}
                     </p>
                    </div>
                  ) : (
                    <div>
                     <div className="bg-slate-900 text-white w-14 h-14 flex items-center justify-center font-bold text-xl rounded shadow-sm">IT</div>
                     <h1 className="text-xl font-bold text-slate-900 mt-3">Kiosk System d.o.o.</h1>
                     <p className="text-[10px] text-slate-400">Postavite ime tvrtke u postavkama kako bi se prikazalo ovdje.</p>
                    </div>
                  )}
               </div>

               <div className="text-right space-y-4 pt-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Ponuda</h2>
                  <div className="space-y-1">
                     <div className="text-sm font-semibold text-slate-900">Broj: <span className="font-mono bg-slate-100 px-2 py-0.5 ml-1 rounded">{offer.brojPonude}</span></div>
                     <div className="text-xs text-slate-500">Datum: {offer.datumPonude.toLocaleDateString("hr-HR")}</div>
                  </div>
               </div>
            </div>

            {/* KUPAC */}
            <div className="mb-10 p-5 bg-slate-50 rounded-xl border border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Naručitelj / Kupac</p>
               <h3 className="text-lg font-bold text-slate-900">{customer?.nazivTvrtke}</h3>
               {customer?.oib && <p className="text-sm text-slate-600 mb-1">OIB: <span className="font-mono">{customer?.oib}</span></p>}
               {customer?.adresaRacun && <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{customer?.adresaRacun}</p>}
            </div>

            {/* TABLICA JEDNOKRATNIH (HARDVERSKIH) STAVKI */}
            <div className="mb-8">
               <h4 className="text-sm font-bold text-slate-700 uppercase mb-3 border-b-2 border-slate-900 inline-block pb-1">1. Oprema i Usluge Ugradnje (CapEx)</h4>
               <table className="w-full text-left text-sm mb-4">
                 <thead>
                   <tr className="border-b-2 border-slate-200">
                     <th className="py-2 font-semibold text-slate-900 w-12 text-center">#</th>
                     <th className="py-2 font-semibold text-slate-900">Opis Specifikacije</th>
                     <th className="py-2 font-semibold text-slate-900 text-center">Količina</th>
                     <th className="py-2 font-semibold text-slate-900 text-right">Zbroj / Kom</th>
                     <th className="py-2 font-semibold text-slate-900 text-right">Ukupno ({offer.valuta})</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {items.map((item, i) => (
                     <tr key={item.id} className="align-top">
                       <td className="py-4 text-slate-500 text-center text-xs font-mono">{i + 1}</td>
                       <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-base">{item.nazivStavkeOverride || "Kiosk Model"}</p>
                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                             {/* Nabrojani svi dodaci kako kupac izbjeći zbunjivanje*/}
                             <div className="flex justify-between w-full border-b border-dashed border-slate-200 pb-0.5">
                                <span>- Osnovni uređaj:</span> 
                                <span className="font-mono font-medium">{item.prodajnaCijenaKom} {offer.valuta}</span>
                             </div>
                             
                             {item.trosakDostaveProdajni > 0 && (
                                <div className="flex justify-between w-full border-b border-dashed border-slate-200 pb-0.5">
                                   <span>- Logistika (Poštarina/Osiguranje):</span> <span className="font-mono">{item.trosakDostaveProdajni} {offer.valuta}</span>
                                </div>
                             )}

                             {item.cijenaInstalacijeSetupProdajna > 0 && (
                                <div className="flex justify-between w-full border-b border-dashed border-slate-200 pb-0.5">
                                   <span>- Postava postolja (Izrada):</span> <span className="font-mono">{item.cijenaInstalacijeSetupProdajna} {offer.valuta}</span>
                                </div>
                             )}

                             {item.brojRadnihSati > 0 && (
                                <div className="flex justify-between w-full border-b border-dashed border-slate-200 pb-0.5">
                                   <span>- Konfiguracija / Rad ({item.brojRadnihSati}h):</span> <span className="font-mono">{item.brojRadnihSati * item.cijenaRadnogSataProdajna} {offer.valuta}</span>
                                </div>
                             )}

                             {item.dodatnaOprema?.map((op, odx) => (
                                <div key={odx} className="flex justify-between w-full border-b border-dashed border-slate-200 pb-0.5 text-indigo-700 font-medium">
                                   <span>- Dodatak: {op.naziv} ({op.kolicina || 1}x):</span> <span className="font-mono">{op.cijenaProdajna * (op.kolicina||1)} {offer.valuta}</span>
                                </div>
                             ))}
                          </div>
                       </td>
                       <td className="py-4 text-center font-bold text-slate-700 text-lg">{item.kolicina}</td>
                       <td className="py-4 text-right tabular-nums text-slate-600">{(item.subtotalBezPdv / item.kolicina).toFixed(2)}</td>
                       <td className="py-4 text-right tabular-nums font-bold text-slate-900 border-l border-slate-50 bg-slate-50/50">{(item.subtotalBezPdv).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            {/* TOTALS JEDNOKRATNIH */}
            <div className="flex justify-end mb-16">
               <div className="w-[55%] min-w-[300px] border-t-2 border-slate-900 pt-4 bg-slate-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center py-2 text-sm text-slate-600">
                     <span>Ukupno Oprema bez PDV-a:</span>
                     <span className="font-mono">{offer.subtotalBezPdv.toFixed(2)} {offer.valuta}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm text-slate-600 border-b border-slate-200">
                     <span>Fiksni PDV iznos ({offer.pdvStopa}%):</span>
                     <span className="font-mono">{offer.ukupnoPdv.toFixed(2)} {offer.valuta}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 pb-2">
                     <span className="text-sm font-bold text-slate-900 uppercase">Jednokratno Za Uplatu:</span>
                     <span className="text-xl font-black text-slate-900 font-mono tracking-tight">{offer.ukupnoSPdv.toFixed(2)} {offer.valuta}</span>
                  </div>
               </div>
            </div>

            {/* SEPARATE PRETPLATE SEKCIJA (MRR) - Vidljivo samo ako ima pretplata */}
            {items.some(i => (i.subscriptions && i.subscriptions.length > 0)) && (
               <div className="mb-12 border-2 border-blue-900/10 rounded-2xl overflow-hidden relative">
                  <div className="bg-blue-900/5 px-6 py-3 border-b border-blue-900/10">
                     <h4 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2">
                        <Clock className="h-4 w-4" /> 2. Mjesečne Pretplate i Softversko Održavanje Usluge
                     </h4>
                  </div>
                  <div className="p-6 pb-2">
                     <table className="w-full text-left text-sm mb-4">
                        <thead>
                           <tr className="text-slate-400 border-b border-slate-100">
                              <th className="font-normal text-xs pb-2 w-1/2">Stavka i Softver</th>
                              <th className="font-normal text-xs pb-2 text-center">Mj. Količina</th>
                              <th className="font-normal text-xs pb-2 text-right">Iznos / mj.</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {items.map(item => {
                              if(!item.subscriptions || item.subscriptions.length === 0) return null;
                              return item.subscriptions.map((sub, sIdx) => (
                                 <tr key={`${item.id}-sub-${sIdx}`}>
                                    <td className="py-3 pr-4">
                                       <div className="font-bold text-slate-800">{sub.naziv}</div>
                                       {sub.gratisMjeseci && sub.gratisMjeseci > 0 ? (
                                          <div className="inline-block mt-1 bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                             Prvih {sub.gratisMjeseci} mjeseci GRATIS period (Izuzeto od naplate)
                                          </div>
                                       ) : null}
                                       <div className="text-[10px] text-slate-400 mt-1">Vezano za aparat: {item.nazivStavkeOverride}</div>
                                    </td>
                                    <td className="py-3 text-center text-slate-600">{item.kolicina} x licenci</td>
                                    <td className="py-3 text-right font-mono font-bold text-blue-900">
                                       {(sub.cijenaProdajna * item.kolicina).toFixed(2)} {offer.valuta}
                                    </td>
                                 </tr>
                              ));
                           })}
                        </tbody>
                     </table>
                  </div>

                  {/* MRR TOTAL */}
                  <div className="bg-blue-50/50 p-6 pt-4 border-t border-blue-100/50 flex justify-end">
                     <div className="w-[50%] min-w-[280px]">
                        <div className="flex justify-between items-center py-1.5 text-xs text-slate-600">
                           <span>Ukupno mjesečno bez PDV:</span>
                           <span className="font-mono font-medium">{offer.ukupnoMjesečnoBezPdv.toFixed(2)} {offer.valuta}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 text-xs text-slate-600 border-b border-blue-100/50 pb-3">
                           <span>PDV na redovitu pretplatu ({offer.pdvStopa}%):</span>
                           <span className="font-mono font-medium">{offer.ukupnoMjesečnoPdv.toFixed(2)} {offer.valuta}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3">
                           <span className="text-sm font-bold text-blue-900 uppercase">Mjesečno zaduženje:</span>
                           <span className="text-lg font-black text-blue-900 font-mono tracking-tight">{offer.ukupnoMjesečnoSPdv.toFixed(2)} {offer.valuta}</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* NAPOMENA ZA PDF */}
            <div className="space-y-6 pt-8 border-t border-slate-200">
               <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{offer.napomenaZaPdf}</p>
               <div className="flex justify-between items-end pt-12">
                  <div className="text-[10px] text-slate-400 max-w-[50%]">Ponuda kreirana automatskim putem iz Kiosk Management Sustava.<br/>Ne sadrži komercijalni pečat. ZOO izuzeće.</div>
                  <div className="text-center w-48 font-medium">
                     <div className="border-b border-slate-400 mb-2 mt-8"></div><span className="text-xs text-slate-600">Potpis i Odobrenje</span>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
