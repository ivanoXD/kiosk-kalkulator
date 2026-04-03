'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { db, OfferItem, SubItem } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Calculator, Tag, HardDrive, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const generateOfferNumber = () => {
   const date = new Date();
   return `PON-${date.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function NovaPonudaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const kioskModels = useLiveQuery(() => db.kioskModels.toArray()) || [];
  const settings = useLiveQuery(() => db.settings.toArray()) || [];
  
  const [offerHeader, setOfferHeader] = useState({
    brojPonude: "",
    customerId: "",
    statusPonude: "SKICA",
    valuta: "EUR",
    pdvStopa: 25,
    internaNapomena: "",
    napomenaZaPdf: "Ponuda vrijedi 14 dana od datuma izdavanja. Garancija na uređaje je 12 mjeseci."
  });

  useEffect(() => {
     setOfferHeader(prev => ({ 
        ...prev, 
        brojPonude: generateOfferNumber(),
        pdvStopa: settings[0]?.defaultPdvStopa || 25,
        valuta: settings[0]?.defaultValuta || 'EUR',
        napomenaZaPdf: settings[0]?.defaultPdfNapomena || prev.napomenaZaPdf
     }));
  }, [settings]);

  // Stanje svih stavki
  const [items, setItems] = useState<Partial<OfferItem>[]>([]);

  const handleHeaderChange = (field: string, value: any) => {
    setOfferHeader(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    (updatedItems[index] as any)[field] = value;
    setItems(updatedItems);
  };

  const handleModelSelect = (index: number, modelId: string) => {
    const model = kioskModels.find(m => m.id === modelId);
    if (!model) return;
    
    const updatedItems = [...items];
    updatedItems[index] = {
       ...updatedItems[index],
       kioskModelId: model.id,
       nazivStavkeOverride: model.nazivModela,
       prodajnaCijenaKom: model.prodajnaCijenaDefault,
       nabavnaCijenaKom: model.nabavnaCijenaDefault,
       trosakDostaveProdajni: model.trosakDostaveProdajniDefault || 0,
       trosakDostaveNabavni: model.trosakDostaveNabavniDefault || 0,
    };
    setItems(updatedItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        kioskModelId: "",
        nazivStavkeOverride: "",
        kolicina: 1,
        prodajnaCijenaKom: 0,
        nabavnaCijenaKom: 0,
        trosakDostaveProdajni: 0,
        trosakDostaveNabavni: 0,
        brojRadnihSati: 0,
        cijenaRadnogSataProdajna: settings[0]?.defaultRadniSatProdajni || 35,
        cijenaRadnogSataNabavna: settings[0]?.defaultRadniSatNabavni || 15,
        cijenaInstalacijeSetupProdajna: 0, // Postava postolja prodajna
        cijenaInstalacijeSetupNabavna: 0,  // Postava postolja nabavna
        wrapperUkljucen: false,
        cijenaWrapperaProdajna: 0,
        cijenaWrapperaNabavna: 0,
        dodatniTrosakProdajni: 0,
        dodatniTrosakNabavni: 0,
        subscriptions: [],
        dodatnaOprema: [],
        napomena: ""
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Upravljanje Arrays dubokim poljima
  const addSubItem = (itemIndex: number, type: 'subscriptions' | 'dodatnaOprema') => {
     const newItems = [...items];
     const arr = newItems[itemIndex][type] || [];
     arr.push({
        id: crypto.randomUUID(),
        naziv: type === 'subscriptions' ? "Softver / licenca..." : "Dodatni nosač / mat...",
        kolicina: 1,
        cijenaProdajna: 0,
        cijenaNabavna: 0,
        gratisMjeseci: type === 'subscriptions' ? 0 : undefined
     });
     newItems[itemIndex][type] = arr;
     setItems(newItems);
  };

  const updateSubItem = (itemIndex: number, type: 'subscriptions' | 'dodatnaOprema', subIndex: number, field: string, val: any) => {
     const newItems = [...items];
     const arr = [...(newItems[itemIndex][type] as SubItem[])];
     (arr[subIndex] as any)[field] = val;
     newItems[itemIndex][type] = arr;
     setItems(newItems);
  };

  const removeSubItem = (itemIndex: number, type: 'subscriptions' | 'dodatnaOprema', subIndex: number) => {
     const newItems = [...items];
     const arr = [...(newItems[itemIndex][type] as SubItem[])];
     arr.splice(subIndex, 1);
     newItems[itemIndex][type] = arr;
     setItems(newItems);
  };

  // Kalkulacijski engine
  const calculatedItems = useMemo(() => {
     return items.map(item => {
        
        // Zbroj dodatne opreme (ide u jednokratni CapEx cestarine stroja)
        let dodOpremaProd = 0; let dodOpremaNabav = 0;
        (item.dodatnaOprema || []).forEach(o => {
           dodOpremaProd += (o.cijenaProdajna * (o.kolicina || 1));
           dodOpremaNabav += (o.cijenaNabavna * (o.kolicina || 1));
        });

        const prodajna = 
          (item.kolicina! * (item.prodajnaCijenaKom! + dodOpremaProd)) +
           item.trosakDostaveProdajni! +
          (item.brojRadnihSati! * item.cijenaRadnogSataProdajna!) +
           item.cijenaInstalacijeSetupProdajna! + // Postava postolja
          (item.wrapperUkljucen ? item.cijenaWrapperaProdajna! : 0) +
           item.dodatniTrosakProdajni!;

        const nabavna = 
          (item.kolicina! * (item.nabavnaCijenaKom! + dodOpremaNabav)) +
           item.trosakDostaveNabavni! +
          (item.brojRadnihSati! * item.cijenaRadnogSataNabavna!) +
           item.cijenaInstalacijeSetupNabavna! + // Postava postolja
          (item.wrapperUkljucen ? item.cijenaWrapperaNabavna! : 0) +
           item.dodatniTrosakNabavni!;
        
        const profit = prodajna - nabavna;
        const marza = prodajna > 0 ? (profit / prodajna) * 100 : 0;

        // Izracun MRR (Monthly Recurring Revenue - Subskripcije)
        let mjesecnoProd = 0; let mjesecnoNabav = 0;
        (item.subscriptions || []).forEach(s => {
           // Mjesečna pretplata se množi i s brojem komada ovog kioska
           mjesecnoProd += (s.cijenaProdajna * item.kolicina!);
           mjesecnoNabav += (s.cijenaNabavna * item.kolicina!);
        });

        return {
           ...item,
           subtotalBezPdv: prodajna,
           subtotalNabavni: nabavna,
           profit: profit,
           marzaPostotak: marza,
           ukupnoMjesečnoBezPdv: mjesecnoProd,
           ukupnoMjesečnoNabavno: mjesecnoNabav
        };
     });
  }, [items]);

  const totals = useMemo(() => {
     let subPdv = 0;
     let nabava = 0;
     let profit = 0;
     let subPdvMjesečno = 0;

     calculatedItems.forEach(item => {
        subPdv += item.subtotalBezPdv;
        nabava += item.subtotalNabavni;
        profit += item.profit;
        subPdvMjesečno += item.ukupnoMjesečnoBezPdv;
     });

     const pdv = subPdv * (offerHeader.pdvStopa / 100);
     const ukupnoSPdv = subPdv + pdv;
     const ukupnaMarza = subPdv > 0 ? (profit / subPdv) * 100 : 0;
     
     const mjesečnoPdv = subPdvMjesečno * (offerHeader.pdvStopa / 100);
     const ukupnoMjesečnoSPdv = subPdvMjesečno + mjesečnoPdv;

     return { 
        subPdv, nabava, profit, pdv, ukupnoSPdv, ukupnaMarza,
        subPdvMjesečno, mjesečnoPdv, ukupnoMjesečnoSPdv
     };
  }, [calculatedItems, offerHeader.pdvStopa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerHeader.customerId || calculatedItems.length === 0) {
       alert("Odaberite kupca te dodajte barem jednu stavku za izradu ponude."); return;
    }

    setLoading(true);
    
    try {
      const ts = new Date();
      const offerId = crypto.randomUUID();

      await db.offers.add({
         id: offerId,
         brojPonude: offerHeader.brojPonude,
         customerId: offerHeader.customerId,
         datumPonude: ts,
         statusPonude: offerHeader.statusPonude,
         valuta: offerHeader.valuta,
         pdvStopa: offerHeader.pdvStopa,
         
         subtotalBezPdv: totals.subPdv,
         ukupnaNabavnaVrijednost: totals.nabava,
         ukupnoPdv: totals.pdv,
         ukupnoSPdv: totals.ukupnoSPdv,
         ukupniProfit: totals.profit,
         ukupnaMarzaPostotak: totals.ukupnaMarza,
         ukupnoMjesečnoBezPdv: totals.subPdvMjesečno,
         ukupnoMjesečnoPdv: totals.mjesečnoPdv,
         ukupnoMjesečnoSPdv: totals.ukupnoMjesečnoSPdv,
         
         internaNapomena: offerHeader.internaNapomena,
         napomenaZaPdf: offerHeader.napomenaZaPdf,
         versionNumber: 1,
         createdBy: "admin",
         createdAt: ts,
         updatedAt: ts
      });

      const itemsToSave = calculatedItems.map((ci, index) => ({
         ...ci,
         id: crypto.randomUUID(),
         offerId: offerId,
         sortOrder: index,
         createdAt: ts,
         updatedAt: ts
      })) as OfferItem[];

      await db.offerItems.bulkAdd(itemsToSave);
      router.push("/ponude");
    } catch(err) {
       alert("Došlo je do greške prilikom spremanja ponude.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Link href="/ponude"><Button variant="outline" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5"/></Button></Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Nova Ponuda Klijentu</h2>
          <p className="text-slate-500 mt-1">Sastavite pametnu troškovničku liniju s integriranim pretplatama.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* HEADER PONUDE */}
        <Card className="border-indigo-100 shadow-sm rounded-xl">
           <CardHeader className="bg-indigo-50/50 pb-5">
              <div className="flex gap-3 items-center">
                 <Tag className="h-5 w-5 text-indigo-500" />
                 <CardTitle className="text-indigo-950 text-lg">Zaglavlje Ponude</CardTitle>
              </div>
           </CardHeader>
           <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <Label className="text-xs font-semibold">Broj generirane ponude</Label>
                 <Input value={offerHeader.brojPonude} onChange={e => handleHeaderChange("brojPonude", e.target.value)} className="font-mono bg-slate-50" />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                 <Label className="text-xs font-semibold">Kupac (Naručitelj) <span className="text-red-500">*</span></Label>
                 <Select value={offerHeader.customerId} onValueChange={(v) => handleHeaderChange("customerId", v)}>
                   <SelectTrigger className="border-indigo-200 focus:ring-indigo-500"><SelectValue placeholder="Odaberite naručitelja baze" /></SelectTrigger>
                   <SelectContent>
                      {customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nazivTvrtke}</SelectItem>))}
                   </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                 <Label className="text-xs font-semibold">Status / Valuta</Label>
                 <div className="flex items-center gap-2">
                    <Select value={offerHeader.statusPonude} onValueChange={(v) => handleHeaderChange("statusPonude", v)}>
                      <SelectTrigger className="bg-slate-50 flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="SKICA">Skica</SelectItem>
                          <SelectItem value="U_IZRADI">Otvoreno za klijenta</SelectItem>
                          <SelectItem value="INTERNO_ODOBRENO">Interno odobreno</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input className="w-16 font-mono text-center bg-slate-100 uppercase" value={offerHeader.valuta} onChange={e => handleHeaderChange("valuta", e.target.value)} title="Valuta klijenta" />
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* KALKULATIVNE I RADNE OSNOVE */}
        <Card className="border-emerald-100 shadow-sm rounded-xl">
           <CardHeader className="bg-emerald-50/50 pb-4 pt-4">
              <div className="flex gap-3 items-center">
                 <Calculator className="h-5 w-5 text-emerald-600" />
                 <CardTitle className="text-emerald-950 text-base">Kalkulativne i Radne Osnove (Specifično za ovaj Posao)</CardTitle>
              </div>
           </CardHeader>
           <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="space-y-1.5">
                 <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PDV Stopa (%)</Label>
                 <Input 
                    type="number" step="0.5" 
                    value={offerHeader.pdvStopa} 
                    onChange={e => handleHeaderChange("pdvStopa", Number(e.target.value))} 
                    className="bg-white font-mono font-bold h-10 border-slate-200"
                 />
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Valuta</Label>
                 <Input 
                    value={offerHeader.valuta} 
                    onChange={e => handleHeaderChange("valuta", e.target.value.toUpperCase())} 
                    className="bg-white font-mono font-bold text-center uppercase h-10 border-slate-200"
                    maxLength={3}
                 />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                 <Label className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Nabavna cijena sata (€/h)</Label>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-rose-400 text-sm font-bold">€</span>
                    <Input 
                       type="number" step="0.5"
                       value={offerHeader.pdvStopa > 0 ? (items[0]?.cijenaRadnogSataNabavna ?? (settings[0]?.defaultRadniSatNabavni || 15)) : 15}
                       onChange={e => {
                          const val = Number(e.target.value);
                          setItems(prev => prev.map(item => ({ ...item, cijenaRadnogSataNabavna: val })));
                       }}
                       className="pl-7 bg-rose-50 border-rose-200 text-rose-700 font-bold font-mono h-10"
                       placeholder="15.00"
                    />
                 </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                 <Label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Prodajna cijena sata (€/h)</Label>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-emerald-500 text-sm font-bold">€</span>
                    <Input 
                       type="number" step="0.5"
                       value={offerHeader.pdvStopa > 0 ? (items[0]?.cijenaRadnogSataProdajna ?? (settings[0]?.defaultRadniSatProdajni || 35)) : 35}
                       onChange={e => {
                          const val = Number(e.target.value);
                          setItems(prev => prev.map(item => ({ ...item, cijenaRadnogSataProdajna: val })));
                       }}
                       className="pl-7 bg-emerald-50 border-emerald-200 text-emerald-800 font-bold font-mono h-10"
                       placeholder="35.00"
                    />
                 </div>
              </div>
              <div className="col-span-2 md:col-span-6 text-[10px] text-slate-400 font-medium italic">
                 ⚡ Promjenom satnice ovdje automatski ažurirate satnicu na svim stavkama ove ponude. Satnicu možete naknadno i individualno prilagoditi po stavci.
              </div>
           </CardContent>
        </Card>

        {/* STAVKE PONUDE */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><HardDrive className="h-5 w-5 text-slate-400" /> Konfigurator opreme</h3>
              <Button type="button" onClick={addItemRow} variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold shadow-sm">
                 <Plus className="mr-2 h-4 w-4" /> Dodaj hardver ili uslugu
              </Button>
           </div>

           {items.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50/50 text-slate-500 font-medium">
                 Trenutno nemate unesenih stavki. Dodajte prvi stroj iznad.
              </div>
           )}

           {calculatedItems.map((item, index) => (
              <Card key={index} className="border-slate-200 shadow-sm relative overflow-visible rounded-xl">
                 <button type="button" onClick={() => removeItemRow(index)} className="absolute -right-3 -top-3 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full shadow-sm transition-colors border border-red-200 z-10"><Trash2 className="h-4 w-4" /></button>

                 <div className="grid grid-cols-12 gap-0">
                    {/* LIJEVI DETALJI */}
                    <div className="col-span-12 lg:col-span-9 p-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                           <div className="space-y-2 md:col-span-2">
                              <Label className="text-[11px] uppercase text-slate-500">Kiosk Model (Baza)</Label>
                              <Select value={item.kioskModelId ?? ""} onValueChange={(v) => handleModelSelect(index, v)}>
                                <SelectTrigger className="bg-slate-50 border-slate-300"><SelectValue placeholder="Odaberi bazni Kiosk" /></SelectTrigger>
                                <SelectContent>{kioskModels.map(km => (<SelectItem key={km.id} value={km.id}>{km.nazivModela} [{km.sifra}]</SelectItem>))}</SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2 md:col-span-2">
                              <Label className="text-[11px] uppercase text-slate-500">Vidljivo Ime na PDF Specifikaciji</Label>
                              <Input value={item.nazivStavkeOverride || ""} onChange={e => handleItemChange(index, "nazivStavkeOverride", e.target.value)} placeholder="Prilagođeno ime..." />
                           </div>
                        </div>

                        {/* MATRICA OSNOVNIH HARDVERSKIH CIJENA */}
                        <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                           {/* Hardver komad */}
                           <div className="col-span-2 bg-white border border-slate-200 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Hardver / Kom Cijena</div>
                              <div className="flex gap-2">
                                 <div className="w-16"><span className="text-[10px] text-slate-500">Kol.</span><Input type="number" min="1" value={item.kolicina} onChange={e => handleItemChange(index, "kolicina", Number(e.target.value))} className="h-8 text-xs font-bold" /></div>
                                 <div className="flex-1"><span className="text-[10px] text-rose-500 font-semibold">Nabavna (<span className="uppercase">{offerHeader.valuta}</span>)</span><Input type="number" value={item.nabavnaCijenaKom} onChange={e => handleItemChange(index, "nabavnaCijenaKom", Number(e.target.value))} className="h-8 text-xs text-rose-600 bg-rose-50 border-rose-100" /></div>
                                 <div className="flex-1"><span className="text-[10px] text-emerald-600 font-semibold">Prodajna (<span className="uppercase">{offerHeader.valuta}</span>)</span><Input type="number" value={item.prodajnaCijenaKom} onChange={e => handleItemChange(index, "prodajnaCijenaKom", Number(e.target.value))} className="h-8 text-xs text-emerald-700 bg-emerald-50 border-emerald-100 font-bold" /></div>
                              </div>
                           </div>
                           {/* Dostava po stavci */}
                           <div className="col-span-2 bg-white border border-slate-200 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Transport / Špedicija</div>
                              <div className="flex gap-2">
                                 <div className="flex-1"><span className="text-[10px] text-rose-500 font-semibold">Nabavna (<span className="uppercase">{offerHeader.valuta}</span>)</span><Input type="number" value={item.trosakDostaveNabavni} onChange={e => handleItemChange(index, "trosakDostaveNabavni", Number(e.target.value))} className="h-8 text-xs text-rose-600 bg-rose-50 border-rose-100" /></div>
                                 <div className="flex-1"><span className="text-[10px] text-emerald-600 font-semibold">Prodajna (<span className="uppercase">{offerHeader.valuta}</span>)</span><Input type="number" value={item.trosakDostaveProdajni} onChange={e => handleItemChange(index, "trosakDostaveProdajni", Number(e.target.value))} className="h-8 text-xs text-emerald-700 bg-emerald-50 border-emerald-100 font-bold" /></div>
                              </div>
                           </div>
                           {/* Radni Serveri Množenje */}
                           <div className="col-span-2 bg-white border border-indigo-200/50 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Sati rada inženjera (Varijabilno)</div>
                              <div className="flex gap-2">
                                 <div className="w-16"><span className="text-[10px] text-indigo-500">Broj h</span><Input type="number" value={item.brojRadnihSati} onChange={e => handleItemChange(index, "brojRadnihSati", Number(e.target.value))} className="h-8 text-xs font-bold" /></div>
                                 <div className="flex-1"><span className="text-[10px] text-rose-500 font-semibold">Cijena Nab (<span className="uppercase">{offerHeader.valuta}</span>/h)</span><Input type="number" value={item.cijenaRadnogSataNabavna} onChange={e => handleItemChange(index, "cijenaRadnogSataNabavna", Number(e.target.value))} className="h-8 text-xs text-rose-600 border-rose-100" /></div>
                                 <div className="flex-1"><span className="text-[10px] text-emerald-600 font-semibold">Cijena Prod (<span className="uppercase">{offerHeader.valuta}</span>/h)</span><Input type="number" value={item.cijenaRadnogSataProdajna} onChange={e => handleItemChange(index, "cijenaRadnogSataProdajna", Number(e.target.value))} className="h-8 text-xs text-emerald-700 font-bold border-emerald-100" /></div>
                              </div>
                           </div>
                           {/* Postava postolja fiksno */}
                           <div className="col-span-2 bg-white border border-slate-200 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Postava postolja / Izrada</div>
                              <div className="flex gap-2">
                                 <div className="flex-1"><span className="text-[10px] text-rose-500 font-semibold">Fik. Nabavna</span><Input type="number" value={item.cijenaInstalacijeSetupNabavna} onChange={e => handleItemChange(index, "cijenaInstalacijeSetupNabavna", Number(e.target.value))} className="h-8 text-xs text-rose-600 border-rose-100" /></div>
                                 <div className="flex-1"><span className="text-[10px] text-emerald-600 font-semibold">Fik. Prodajna</span><Input type="number" value={item.cijenaInstalacijeSetupProdajna} onChange={e => handleItemChange(index, "cijenaInstalacijeSetupProdajna", Number(e.target.value))} className="h-8 text-xs text-emerald-700 font-bold border-emerald-100" /></div>
                              </div>
                           </div>
                        </div>

                        {/* DODATNA JEDNOKRATNA OPREMA */}
                        <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
                           <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
                              <span className="text-xs font-bold text-slate-700">Dodatna oprema i ugrađeni dodaci (Zidni nosači, okviri...)</span>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => addSubItem(index, "dodatnaOprema")}><Plus className="h-3 w-3 mr-1"/> Oprema</Button>
                           </div>
                           <div className="p-3 bg-slate-50 space-y-2">
                              {item.dodatnaOprema?.map((op, oIdx) => (
                                 <div key={op.id ?? `op-${oIdx}`} className="flex gap-2 items-center bg-white p-2 rounded border border-slate-200 shadow-sm">
                                    <Input placeholder="Naziv npr. Zidni nosač VESA" value={op.naziv} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'naziv', e.target.value)} className="h-8 text-xs flex-1 border-slate-300" />
                                    <div className="w-16"><Input type="number" min="1" value={op.kolicina} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'kolicina', Number(e.target.value))} className="h-8 text-xs  border-slate-300" title="Količina" /></div>
                                    <div className="w-24"><Input type="number" value={op.cijenaNabavna} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'cijenaNabavna', Number(e.target.value))} className="h-8 text-xs border-rose-200 text-rose-600 bg-rose-50/50" title="Nabavna cijena kom." /></div>
                                    <div className="w-24"><Input type="number" value={op.cijenaProdajna} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'cijenaProdajna', Number(e.target.value))} className="h-8 text-xs border-emerald-200 text-emerald-700 bg-emerald-50/50" title="Prodajna cijena kom." /></div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 rounded hover:bg-rose-100 hover:text-rose-700" onClick={() => removeSubItem(index, 'dodatnaOprema', oIdx)}><Trash2 className="h-3 w-3"/></Button>
                                 </div>
                              ))}
                              {(!item.dodatnaOprema || item.dodatnaOprema.length === 0) && <div className="text-center text-[11px] text-slate-400 py-2">Kiosk nema pripadajuće dodatne ugradbene opreme.</div>}
                           </div>
                        </div>

                         {/* SOFTVERSKE PRETPLATE */}
                        <div className="mt-4 border border-blue-200 rounded-lg overflow-hidden">
                           <div className="bg-blue-100 px-4 py-3 flex items-center justify-between border-b border-blue-200">
                              <span className="text-xs font-bold text-blue-900 border-b border-blue-900/30 border-dashed pb-0.5">MJESEČNE PRETPLATE (Zasebni MRR bazen, ne ulazi u osnovnu cijenu)</span>
                              <Button type="button" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => addSubItem(index, "subscriptions")}><Plus className="h-3 w-3 mr-1"/> Licenca</Button>
                           </div>
                           <div className="p-3 bg-blue-50/30 space-y-2">
                              {item.subscriptions?.map((sub, sIdx) => (
                                 <div key={sub.id} className="flex gap-2 items-center bg-white p-2 rounded border border-blue-200 shadow-sm">
                                    <Input placeholder="Naziv licence npr. Remote CMS Premium" value={sub.naziv} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'naziv', e.target.value)} className="h-8 text-xs flex-1 border-blue-200 font-medium text-blue-900" />
                                    <div className="w-20"><Input type="number" value={sub.gratisMjeseci} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'gratisMjeseci', Number(e.target.value))} className="h-8 text-xs border-blue-300" title="Broj Gratis Mjeseci na isporuci" placeholder="Gratis mj." /></div>
                                    <div className="w-24 relative group"><Input type="number" value={sub.cijenaNabavna} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'cijenaNabavna', Number(e.target.value))} className="h-8 text-xs border-rose-200 text-rose-600 pr-5" title="Mjesečna nabavna po Kiosku" /><span className="absolute right-2 top-2.5 text-[8px] text-rose-400">/mj</span></div>
                                    <div className="w-24 relative group"><Input type="number" value={sub.cijenaProdajna} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'cijenaProdajna', Number(e.target.value))} className="h-8 text-xs border-emerald-300 font-bold text-emerald-700 bg-emerald-50 pr-5" title="Mjesečna prodajna po Kiosku" /><span className="absolute right-2 top-2 text-[10px] text-emerald-500">/mj</span></div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 rounded hover:bg-rose-100 hover:text-rose-700 bg-rose-50" onClick={() => removeSubItem(index, 'subscriptions', sIdx)}><Trash2 className="h-4 w-4"/></Button>
                                 </div>
                              ))}
                              {(!item.subscriptions || item.subscriptions.length === 0) && <div className="text-center text-[11px] text-blue-400 py-2 font-medium">Klijentu se na ovaj aparat ne naplaćuje trajni mjesečni softver.</div>}
                           </div>
                        </div>

                    </div>

                    {/* DESNA REZULTANTA STAVKE */}
                    <div className="col-span-12 lg:col-span-3 bg-slate-900 text-slate-100 p-6 rounded-r-xl lg:rounded-l-none border-l-0 lg:border-l border-zinc-800 flex flex-col justify-between">
                         <div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Calculator className="h-3 w-3" /> Prodajni Live Izlaz
                             </div>
                             
                             <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                   <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">CapEx: Jednokratno za {item.kolicina} Kom(bez PDV)</div>
                                   <div className="text-xl font-bold text-white font-mono">€{item.subtotalBezPdv.toFixed(2)}</div>
                                   <div className="text-[10px] text-rose-400 mt-1 flex justify-between"><span>Nabavna faza:</span> <span>€{item.subtotalNabavni.toFixed(2)}</span></div>
                                   <div className="mt-2 pt-2 border-t border-white/10 text-emerald-400 text-sm flex justify-between font-bold"><span>Čisti profit:</span> <span>€{item.profit.toFixed(2)}</span></div>
                                </div>

                                <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                                   <div className="text-[9px] uppercase tracking-wider text-blue-300 mb-1">Mjesečne obveze / Pretplata (MRR)</div>
                                   <div className="text-lg font-bold text-blue-100 font-mono">€{item.ukupnoMjesečnoBezPdv.toFixed(2)} <span className="text-xs text-blue-300/80 uppercase">/ mjesečno</span></div>
                                </div>
                             </div>
                         </div>
                    </div>
                 </div>
              </Card>
           ))}

        </div>

        {/* GLAVNI ODOBRENJE FOOTER */}
        {calculatedItems.length > 0 && (
           <Card className="border-indigo-600/30 bg-indigo-50/20 backdrop-blur-xl shadow-2xl mt-8 rounded-xl overflow-hidden sticky bottom-6 z-40">
               <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-indigo-200">
                  <div className="flex-1 p-6 flex flex-col justify-between bg-white/40">
                     <div>
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Jednokratno za Uplate do instalacije</div>
                        <div className="flex items-baseline gap-2 border-b border-indigo-100 pb-2">
                           <div className="text-4xl font-bold text-indigo-950 font-mono tracking-tight">€{totals.ukupnoSPdv.toFixed(2)}</div>
                           <div className="text-sm font-semibold text-indigo-600">S {offerHeader.pdvStopa}% PDV-om</div>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-2 font-medium">Bez Pdv (Osnova): {totals.subPdv.toFixed(2)} {offerHeader.valuta}</div>
                     </div>
                  </div>

                  <div className="flex-1 p-6 bg-blue-50 border-blue-100 flex flex-col justify-between relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl block mix-blend-multiply"></div>
                     <div className="relative z-10">
                        <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><RefreshCw className="h-3 w-3"/> Mjesečna MRR Pretplata tvrtki</div>
                        <div className="flex items-baseline gap-2">
                           <div className="text-3xl font-bold text-blue-900 font-mono">€{totals.ukupnoMjesečnoSPdv.toFixed(2)}</div>
                           <div className="text-sm font-semibold text-blue-600/80">S {offerHeader.pdvStopa}% PDV-om</div>
                        </div>
                        <div className="text-[11px] text-blue-500 mt-2 font-medium">Osnovica za fakturu: {totals.subPdvMjesečno.toFixed(2)} {offerHeader.valuta} (Zbraja SVE pretplate Modela)</div>
                     </div>
                  </div>

                  <div className="flex-1 p-6 bg-slate-900 border-indigo-900 relative">
                     <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-slate-900 to-slate-900"></div>
                     <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                           <div className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest mb-1">Finalni One-off Profit</div>
                           <div className="text-4xl font-black text-emerald-400 tracking-tight font-mono">€{totals.profit.toFixed(2)}</div>
                           <div className="text-sm text-slate-300 font-bold mt-1">Marža pokrića: {totals.ukupnaMarza.toFixed(1)}%</div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-12 text-base font-bold transition-all">
                           {loading ? "Spremanje kalkulacija..." : "Pohrani Cijelu Ponudu u Registar"}
                        </Button>
                     </div>
                  </div>
               </div>
           </Card>
        )}
      </form>
    </div>
  );
}
