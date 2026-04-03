'use client';

import { useLiveQuery } from "dexie-react-hooks";
import { db, Settings } from "@/lib/db";
import { useState, useEffect } from "react";
import { Save, Settings as SettingsIcon, Store, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PostavkePage() {
   const [saving, setSaving] = useState(false);
   const settingsDb = useLiveQuery(() => db.settings.toArray());

   const [form, setForm] = useState<Partial<Settings>>({
      companyName: "",
      companyAddress: "",
      companyOib: "",
      companyIban: "",
      companyEmail: "",
      companyPhone: "",
      defaultPdvStopa: 25,
      defaultValuta: "EUR",
      defaultRadniSatProdajni: 35,
      defaultRadniSatNabavni: 15,
      defaultPdfNapomena: "Cijednistvene cijene izražene su bez i s PDV-om.\nRok isporuke je X tjedana od uplate predujma."
   });

   useEffect(() => {
      if (settingsDb && settingsDb.length > 0) {
         setForm(settingsDb[0]);
      }
   }, [settingsDb]);

   const handleChange = (field: keyof Settings, val: any) => {
      setForm(prev => ({ ...prev, [field]: val }));
   };

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
         const newSettings = {
            ...form,
            id: 'global',
            companyName: form.companyName || "Nema Imena",
            defaultPdvStopa: Number(form.defaultPdvStopa || 25),
            defaultRadniSatProdajni: Number(form.defaultRadniSatProdajni || 0),
            defaultRadniSatNabavni: Number(form.defaultRadniSatNabavni || 0),
            updatedAt: new Date()
         } as Settings;

         await db.settings.put(newSettings);
         alert("Sve PWA lokalne postavke su uspješno spašene.");
      } catch (err) {
         console.error(err);
         alert("Greška kod spašavanja.");
      } finally {
         setSaving(false);
      }
   };

   return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="bg-slate-200/50 p-2 rounded-lg"><SettingsIcon className="h-7 w-7 text-slate-600" /></div>
             Globalne Tvrtkine Postavke
          </h2>
          <p className="text-slate-500 mt-2">Konfigurirajte porezne iznose na računu, PDF grafiku i satnice poslovanja.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
         
         {/* IDENTITET TVRTKE */}
         <Card className="border-indigo-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-indigo-50/50 pb-5">
               <div className="flex gap-2 items-center text-indigo-900 font-bold"><Store className="h-5 w-5"/> Podaci o Izvršitelju (Za PDF ugovore)</div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">Ime ili Naziv tvrtke</Label>
                  <Input value={form.companyName || ""} onChange={e => handleChange("companyName", e.target.value)} className="bg-white" placeholder="Npr. Kiosk-System d.o.o." />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">Puna adresa i sjedište</Label>
                  <Input value={form.companyAddress || ""} onChange={e => handleChange("companyAddress", e.target.value)} className="bg-white" placeholder="Npr. Zg ulica 1, Zagreb..." />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">OIB Firme</Label>
                  <Input value={form.companyOib || ""} onChange={e => handleChange("companyOib", e.target.value)} className="bg-white font-mono" placeholder="Npr. 12413143" />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">IBAN Za uplatu klijentu (PDF)</Label>
                  <Input value={form.companyIban || ""} onChange={e => handleChange("companyIban", e.target.value)} className="bg-white font-mono" placeholder="HR..." />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">Službeni E-mail adresa / Računovodstvo</Label>
                  <Input value={form.companyEmail || ""} onChange={e => handleChange("companyEmail", e.target.value)} className="bg-white" placeholder="info@...com" />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">Tvrdi telefon za ispis</Label>
                  <Input value={form.companyPhone || ""} onChange={e => handleChange("companyPhone", e.target.value)} className="bg-white" placeholder="+385 1 ..." />
               </div>
            </CardContent>
         </Card>

         {/* MATEMATIKA I DEFAULTI */}
         <Card className="border-emerald-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-emerald-50/50 pb-5">
               <div className="flex gap-2 items-center text-emerald-900 font-bold"><CreditCard className="h-5 w-5"/> Kalkulativne i Radne osnovice</div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs text-rose-600">Defaultna nabavna cijena sata inženjera (€)</Label>
                  <Input type="number" step="0.01" value={form.defaultRadniSatNabavni || 0} onChange={e => handleChange("defaultRadniSatNabavni", e.target.value)} className="bg-rose-50 border-rose-200 text-rose-700 font-bold font-mono" />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs text-emerald-700">Defaultna Vaša Prodajna cijena sata na tržištu (€)</Label>
                  <Input type="number" step="0.01" value={form.defaultRadniSatProdajni || 0} onChange={e => handleChange("defaultRadniSatProdajni", e.target.value)} className="bg-emerald-50 border-emerald-200 text-emerald-800 font-bold font-mono" />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">PDV Stopa (uvedeni postotak %)</Label>
                  <Input type="number" step="0.5" value={form.defaultPdvStopa || 25} onChange={e => handleChange("defaultPdvStopa", e.target.value)} className="bg-white" />
               </div>
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">Službena Valuta (Oznaka u Kalkulatoru)</Label>
                  <Input value={form.defaultValuta || "EUR"} onChange={e => handleChange("defaultValuta", e.target.value)} className="bg-white font-mono uppercase" />
               </div>
            </CardContent>
         </Card>

         {/* PDF NOTICES */}
         <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-5">
               <div className="flex gap-2 items-center text-slate-800 font-bold">Standardni PDF Footer Uvjeti</div>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-xs">Tekst koji se aplicira na svaku NOVO isprintanu ponudu ako ga Vi ne izbrišete ručno tjekom izrade:</Label>
                  <Textarea rows={6} value={form.defaultPdfNapomena || ""} onChange={e => handleChange("defaultPdfNapomena", e.target.value)} className="bg-white resize-none border-slate-300" placeholder="Poštovani, garancija vrijedi..." />
               </div>
            </CardContent>
         </Card>

         <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30 shadow-md font-bold px-8 h-12 text-base rounded-xl transition-all">
               {saving ? "Pohranjujem..." : "Primijeni nove politike kalkulatora"}
            </Button>
         </div>
      </form>
    </div>
   )
}
