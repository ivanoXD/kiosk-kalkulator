'use client';

import { useParams, useRouter } from "next/navigation";
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

export default function UrediPonuduPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
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
    napomenaZaPdf: ""
  });

  const [items, setItems] = useState<Partial<OfferItem>[]>([]);

  useEffect(() => {
    async function loadOffer() {
      const offer = await db.offers.get(id);
      if (offer) {
        setOfferHeader({
          brojPonude: offer.brojPonude,
          customerId: offer.customerId,
          statusPonude: offer.statusPonude,
          valuta: offer.valuta,
          pdvStopa: offer.pdvStopa,
          internaNapomena: offer.internaNapomena || "",
          napomenaZaPdf: offer.napomenaZaPdf || ""
        });

        const offerItems = await db.offerItems.where('offerId').equals(id).sortBy('sortOrder');
        setItems(offerItems);
      }
      setInitialLoading(false);
    }
    loadOffer();
  }, [id]);

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
        cijenaInstalacijeSetupProdajna: 0,
        cijenaInstalacijeSetupNabavna: 0,
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

  const addSubItem = (itemIndex: number, type: 'subscriptions' | 'dodatnaOprema') => {
     const newItems = [...items];
     const arr = [...(newItems[itemIndex][type] || [])];
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

  const calculatedItems = useMemo(() => {
     return items.map(item => {
        let dodOpremaProd = 0; let dodOpremaNabav = 0;
        (item.dodatnaOprema || []).forEach(o => {
           dodOpremaProd += (o.cijenaProdajna * (o.kolicina || 1));
           dodOpremaNabav += (o.cijenaNabavna * (o.kolicina || 1));
        });

        const prodajna = 
          ((item.kolicina || 0) * ((item.prodajnaCijenaKom || 0) + dodOpremaProd)) +
           (item.trosakDostaveProdajni || 0) +
          ((item.brojRadnihSati || 0) * (item.cijenaRadnogSataProdajna || 0)) +
           (item.cijenaInstalacijeSetupProdajna || 0) +
          (item.wrapperUkljucen ? (item.cijenaWrapperaProdajna || 0) : 0) +
           (item.dodatniTrosakProdajni || 0);

        const nabavna = 
          ((item.kolicina || 0) * ((item.nabavnaCijenaKom || 0) + dodOpremaNabav)) +
           (item.trosakDostaveNabavni || 0) +
          ((item.brojRadnihSati || 0) * (item.cijenaRadnogSataNabavna || 0)) +
           (item.cijenaInstalacijeSetupNabavna || 0) +
          (item.wrapperUkljucen ? (item.cijenaWrapperaNabavna || 0) : 0) +
           (item.dodatniTrosakNabavni || 0);
        
        const profit = prodajna - nabavna;
        const marza = prodajna > 0 ? (profit / prodajna) * 100 : 0;

        let mjesecnoProd = 0; let mjesecnoNabav = 0;
        (item.subscriptions || []).forEach(s => {
           mjesecnoProd += (s.cijenaProdajna * (item.kolicina || 0));
           mjesecnoNabav += (s.cijenaNabavna * (item.kolicina || 0));
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
       alert("Popunite sva obavezna polja."); return;
    }

    setLoading(true);
    
    try {
      await db.offers.update(id, {
         brojPonude: offerHeader.brojPonude,
         customerId: offerHeader.customerId,
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
         updatedAt: new Date()
      });

      // Update items: delete all and re-add (cleanest for partial objects)
      await db.offerItems.where('offerId').equals(id).delete();

      const itemsToSave = calculatedItems.map((ci, index) => ({
         ...ci,
         id: ci.id || crypto.randomUUID(),
         offerId: id,
         sortOrder: index,
         createdAt: ci.createdAt || new Date(),
         updatedAt: new Date()
      })) as OfferItem[];

      await db.offerItems.bulkAdd(itemsToSave);
      router.push("/ponude");
    } catch(err) {
       console.error(err);
       alert("Greška prilikom ažuriranja ponude.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Učitavanje podataka o ponudi...</div>;

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Link href="/ponude"><Button variant="outline" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5"/></Button></Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Uredi Ponudu: {offerHeader.brojPonude}</h2>
          <p className="text-slate-500 mt-1">Ažurirajte stavke, cijene i uvjete postojeće ponude.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card className="border-indigo-100 shadow-sm rounded-xl">
           <CardHeader className="bg-indigo-50/50 pb-5">
              <div className="flex gap-3 items-center">
                 <Tag className="h-5 w-5 text-indigo-500" />
                 <CardTitle className="text-indigo-950 text-lg">Zaglavlje Ponude</CardTitle>
              </div>
           </CardHeader>
           <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <Label className="text-xs font-semibold">Broj ponude</Label>
                 <Input value={offerHeader.brojPonude} onChange={e => handleHeaderChange("brojPonude", e.target.value)} className="font-mono bg-slate-50" />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                 <Label className="text-xs font-semibold">Kupac (Naručitelj)</Label>
                 <Select value={offerHeader.customerId} onValueChange={(v) => handleHeaderChange("customerId", v)}>
                   <SelectTrigger className="border-indigo-200"><SelectValue placeholder="Odaberite naručitelja" /></SelectTrigger>
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
                          <SelectItem value="ODOBRENO">Odobreno</SelectItem>
                          <SelectItem value="ODBIJENO">Odbijeno</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input className="w-16 font-mono text-center bg-slate-100 uppercase" value={offerHeader.valuta} onChange={e => handleHeaderChange("valuta", e.target.value)} />
                 </div>
              </div>
           </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm rounded-xl">
           <CardHeader className="bg-emerald-50/50 pb-4 pt-4">
              <div className="flex gap-3 items-center">
                 <Calculator className="h-5 w-5 text-emerald-600" />
                 <CardTitle className="text-emerald-950 text-base">Kalkulativne i Radne Osnove</CardTitle>
              </div>
           </CardHeader>
           <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="space-y-1.5">
                 <Label className="text-[11px] font-semibold text-slate-500 uppercase">PDV Stopa (%)</Label>
                 <Input type="number" step="0.5" value={offerHeader.pdvStopa} onChange={e => handleHeaderChange("pdvStopa", Number(e.target.value))} className="bg-white font-mono font-bold h-10" />
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[11px] font-semibold text-slate-500 uppercase">Valuta</Label>
                 <Input value={offerHeader.valuta} onChange={e => handleHeaderChange("valuta", e.target.value.toUpperCase())} className="bg-white font-mono font-bold text-center h-10" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                 <Label className="text-[11px] font-semibold text-rose-500 uppercase">Nabavna cijena sata (€/h)</Label>
                 <Input type="number" step="0.5" value={items[0]?.cijenaRadnogSataNabavna || 0} onChange={e => setItems(prev => prev.map(i => ({...i, cijenaRadnogSataNabavna: Number(e.target.value)})))} className="bg-rose-50 border-rose-200 text-rose-700 font-bold h-10" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                 <Label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Prodajna cijena sata (€/h)</Label>
                 <Input type="number" step="0.5" value={items[0]?.cijenaRadnogSataProdajna || 0} onChange={e => setItems(prev => prev.map(i => ({...i, cijenaRadnogSataProdajna: Number(e.target.value)})))} className="bg-emerald-50 border-emerald-200 text-emerald-800 font-bold h-10" />
              </div>
           </CardContent>
        </Card>

        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><HardDrive className="h-5 w-5 text-slate-400" /> Konfigurator opreme</h3>
              <Button type="button" onClick={addItemRow} variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold shadow-sm">
                 <Plus className="mr-2 h-4 w-4" /> Dodaj hardver ili uslugu
              </Button>
           </div>

           {calculatedItems.map((item, index) => (
              <Card key={index} className="border-slate-200 shadow-sm relative overflow-visible rounded-xl">
                 <button type="button" onClick={() => removeItemRow(index)} className="absolute -right-3 -top-3 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full shadow-sm transition-colors border border-red-200 z-10"><Trash2 className="h-4 w-4" /></button>

                 <div className="grid grid-cols-12 gap-0">
                    <div className="col-span-12 lg:col-span-9 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                           <div className="space-y-2 md:col-span-2">
                              <Label className="text-[11px] uppercase text-slate-500">Kiosk Model (Baza)</Label>
                              <Select value={item.kioskModelId ?? ""} onValueChange={(v) => handleModelSelect(index, v)}>
                                <SelectTrigger className="bg-slate-50 border-slate-300"><SelectValue placeholder="Odaberi Kiosk" /></SelectTrigger>
                                <SelectContent>{kioskModels.map(km => (<SelectItem key={km.id} value={km.id}>{km.nazivModela}</SelectItem>))}</SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2 md:col-span-2">
                              <Label className="text-[11px] uppercase text-slate-500">Ime na specifikaciji</Label>
                              <Input value={item.nazivStavkeOverride || ""} onChange={e => handleItemChange(index, "nazivStavkeOverride", e.target.value)} />
                           </div>
                        </div>

                        <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                           <div className="col-span-2 bg-white border border-slate-200 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Hardver / Kom Cijena</div>
                              <div className="flex gap-2">
                                 <div className="w-16"><Label className="text-[10px]">Kol.</Label><Input type="number" value={item.kolicina} onChange={e => handleItemChange(index, "kolicina", Number(e.target.value))} className="h-8 text-xs font-bold" /></div>
                                 <div className="flex-1"><Label className="text-[10px]">Nab.</Label><Input type="number" value={item.nabavnaCijenaKom} onChange={e => handleItemChange(index, "nabavnaCijenaKom", Number(e.target.value))} className="h-8 text-xs text-rose-600" /></div>
                                 <div className="flex-1"><Label className="text-[10px]">Prod.</Label><Input type="number" value={item.prodajnaCijenaKom} onChange={e => handleItemChange(index, "prodajnaCijenaKom", Number(e.target.value))} className="h-8 text-xs text-emerald-700 font-bold" /></div>
                              </div>
                           </div>
                           <div className="col-span-2 bg-white border border-slate-200 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Transport</div>
                              <div className="flex gap-2">
                                 <div className="flex-1"><Label className="text-[10px]">Nab.</Label><Input type="number" value={item.trosakDostaveNabavni} onChange={e => handleItemChange(index, "trosakDostaveNabavni", Number(e.target.value))} className="h-8 text-xs" /></div>
                                 <div className="flex-1"><Label className="text-[10px]">Prod.</Label><Input type="number" value={item.trosakDostaveProdajni} onChange={e => handleItemChange(index, "trosakDostaveProdajni", Number(e.target.value))} className="h-8 text-xs font-bold" /></div>
                              </div>
                           </div>
                           <div className="col-span-2 bg-white border border-indigo-200/50 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Sati rada</div>
                              <div className="flex gap-2">
                                 <div className="w-16"><Label className="text-[10px]">h</Label><Input type="number" value={item.brojRadnihSati} onChange={e => handleItemChange(index, "brojRadnihSati", Number(e.target.value))} className="h-8 text-xs" /></div>
                                 <div className="flex-1"><Label className="text-[10px]">Nab/h</Label><Input type="number" value={item.cijenaRadnogSataNabavna} onChange={e => handleItemChange(index, "cijenaRadnogSataNabavna", Number(e.target.value))} className="h-8 text-xs" /></div>
                                 <div className="flex-1"><Label className="text-[10px]">Prod/h</Label><Input type="number" value={item.cijenaRadnogSataProdajna} onChange={e => handleItemChange(index, "cijenaRadnogSataProdajna", Number(e.target.value))} className="h-8 text-xs font-bold" /></div>
                              </div>
                           </div>
                           <div className="col-span-2 bg-white border border-slate-200 rounded-md p-3">
                              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Postava postolja</div>
                              <div className="flex gap-2">
                                 <div className="flex-1"><Label className="text-[10px]">Nab.</Label><Input type="number" value={item.cijenaInstalacijeSetupNabavna} onChange={e => handleItemChange(index, "cijenaInstalacijeSetupNabavna", Number(e.target.value))} className="h-8 text-xs" /></div>
                                 <div className="flex-1"><Label className="text-[10px]">Prod.</Label><Input type="number" value={item.cijenaInstalacijeSetupProdajna} onChange={e => handleItemChange(index, "cijenaInstalacijeSetupProdajna", Number(e.target.value))} className="h-8 text-xs font-bold" /></div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-8 border border-slate-200 rounded-lg">
                           <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b">
                              <span className="text-xs font-bold">Dodatna oprema</span>
                              <Button type="button" variant="outline" size="sm" onClick={() => addSubItem(index, "dodatnaOprema")}><Plus className="h-3 w-3 mr-1"/> Oprema</Button>
                           </div>
                           <div className="p-3 space-y-2">
                              {item.dodatnaOprema?.map((op, oIdx) => (
                                 <div key={op.id} className="flex gap-2 items-center bg-white p-2 rounded border shadow-sm">
                                    <Input value={op.naziv} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'naziv', e.target.value)} className="h-8 text-xs flex-1" />
                                    <div className="w-16"><Input type="number" value={op.kolicina} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'kolicina', Number(e.target.value))} className="h-8 text-xs" /></div>
                                    <div className="w-24"><Input type="number" value={op.cijenaNabavna} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'cijenaNabavna', Number(e.target.value))} className="h-8 text-xs text-rose-600" /></div>
                                    <div className="w-24"><Input type="number" value={op.cijenaProdajna} onChange={(e) => updateSubItem(index, 'dodatnaOprema', oIdx, 'cijenaProdajna', Number(e.target.value))} className="h-8 text-xs text-emerald-700 font-bold" /></div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeSubItem(index, 'dodatnaOprema', oIdx)}><Trash2 className="h-3 w-3"/></Button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="mt-4 border border-blue-200 rounded-lg">
                           <div className="bg-blue-100 px-4 py-3 flex items-center justify-between border-b border-blue-200">
                              <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">Mjesečne pretplate</span>
                              <Button type="button" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => addSubItem(index, "subscriptions")}><Plus className="h-3 w-3 mr-1"/> Licenca</Button>
                           </div>
                           <div className="p-3 bg-blue-50/10 space-y-2">
                              {item.subscriptions?.map((sub, sIdx) => (
                                 <div key={sub.id} className="flex gap-2 items-center bg-white p-2 rounded border border-blue-200 shadow-sm">
                                    <Input value={sub.naziv} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'naziv', e.target.value)} className="h-8 text-xs flex-1 font-medium" />
                                    <div className="w-20"><Input type="number" value={sub.gratisMjeseci} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'gratisMjeseci', Number(e.target.value))} className="h-8 text-xs" placeholder="Gratis" /></div>
                                    <div className="w-24"><Input type="number" value={sub.cijenaNabavna} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'cijenaNabavna', Number(e.target.value))} className="h-8 text-xs text-rose-600" /></div>
                                    <div className="w-24"><Input type="number" value={sub.cijenaProdajna} onChange={(e) => updateSubItem(index, 'subscriptions', sIdx, 'cijenaProdajna', Number(e.target.value))} className="h-8 text-xs font-bold text-emerald-700" /></div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeSubItem(index, 'subscriptions', sIdx)}><Trash2 className="h-4 w-4"/></Button>
                                 </div>
                              ))}
                           </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-3 bg-slate-900 text-slate-100 p-6 rounded-r-xl lg:rounded-l-none border-l-0 lg:border-l border-zinc-800 flex flex-col justify-between">
                         <div className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                               <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">CapEx: Jednokratno (bez PDV)</div>
                               <div className="text-xl font-bold text-white font-mono">€{item.subtotalBezPdv.toFixed(2)}</div>
                               <div className="mt-2 pt-2 border-t border-white/10 text-emerald-400 text-sm flex justify-between font-bold"><span>Profit:</span> <span>€{item.profit.toFixed(2)}</span></div>
                            </div>
                            <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                               <div className="text-[9px] uppercase tracking-wider text-blue-300 mb-1">Mjesečno (MRR)</div>
                               <div className="text-lg font-bold text-blue-100 font-mono">€{item.ukupnoMjesečnoBezPdv.toFixed(2)}</div>
                            </div>
                         </div>
                    </div>
                 </div>
              </Card>
           ))}
        </div>

        <Card className="border-indigo-600/30 bg-white/80 backdrop-blur-xl shadow-2xl mt-8 rounded-xl overflow-hidden sticky bottom-6 z-40">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-indigo-100">
               <div className="flex-1 p-6">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Ukupno Jednokratno</div>
                  <div className="text-4xl font-bold text-indigo-950 font-mono tracking-tight">€{totals.ukupnoSPdv.toFixed(2)} <span className="text-sm font-semibold text-indigo-400">s PDV</span></div>
               </div>
               <div className="flex-1 p-6 bg-blue-50">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Ukupno Mjesečno</div>
                  <div className="text-3xl font-bold text-blue-900 font-mono">€{totals.ukupnoMjesečnoSPdv.toFixed(2)} <span className="text-sm font-semibold text-blue-400">s PDV</span></div>
               </div>
               <div className="flex-1 p-6 bg-slate-900 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Ukupni Profit (One-off)</div>
                    <div className="text-4xl font-black text-emerald-400 tracking-tight font-mono">€{totals.profit.toFixed(2)}</div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-12 text-base font-bold transition-all">
                     {loading ? "Spremanje..." : "Spremi Izmjene Ponude"}
                  </Button>
               </div>
            </div>
        </Card>
      </form>
    </div>
  );
}
