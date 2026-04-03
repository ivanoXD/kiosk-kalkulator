'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save, MonitorSmartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NoviKioskModelPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sifra: "",
    nazivModela: "",
    velicinaEkrana: "",
    orijentacija: "",
    operativniSustav: "",
    prodajnaCijenaDefault: "",
    nabavnaCijenaDefault: "",
    trosakDostaveProdajniDefault: "",
    trosakDostaveNabavniDefault: "",
    opis: ""
  });

  const handleChange = (field: string, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sifra || !form.nazivModela || !form.prodajnaCijenaDefault) {
       alert("Šifra, naziv i prodajna cijena su obavezni unosi!");
       return;
    }

    setSaving(true);
    try {
       await db.kioskModels.add({
         id: crypto.randomUUID(),
         sifra: form.sifra,
         nazivModela: form.nazivModela,
         velicinaEkrana: form.velicinaEkrana || null,
         orijentacija: form.orijentacija || null,
         operativniSustav: form.operativniSustav || null,
         prodajnaCijenaDefault: Number(form.prodajnaCijenaDefault),
         nabavnaCijenaDefault: Number(form.nabavnaCijenaDefault || "0"),
         trosakDostaveProdajniDefault: Number(form.trosakDostaveProdajniDefault || "0"),
         trosakDostaveNabavniDefault: Number(form.trosakDostaveNabavniDefault || "0"),
         opis: form.opis || null,
         statusAktivan: true,
         createdAt: new Date(),
         updatedAt: new Date()
       });
       router.push("/modeli");
    } catch (e) {
       console.error("Dexie Insert Error", e);
       alert("Greška, možda šifra nije jedinstvena.");
    } finally {
       setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Link href="/modeli">
          <Button variant="outline" size="icon" className="rounded-xl shadow-sm border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Novi Kiosk Model</h2>
          <p className="text-slate-500 mt-1">Registracija novog hardverskog uređaja u osnovnu bazu.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
             <div className="flex gap-3 items-center">
                 <div className="bg-indigo-100/50 p-2 rounded-lg">
                    <MonitorSmartphone className="h-6 w-6 text-indigo-500" />
                 </div>
                 <div>
                    <CardTitle className="text-slate-800 text-lg">Tehnička specifikacija</CardTitle>
                    <CardDescription className="mt-1">Temeljne informacije koje se povlače po formiranju ponude.</CardDescription>
                 </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="sifra" className="text-slate-600 font-semibold text-sm">Šifra / SKU Modela <span className="text-red-500">*</span></Label>
                <Input id="sifra" value={form.sifra} onChange={(e) => handleChange("sifra", e.target.value)} required className="bg-white shadow-sm h-11 border-slate-200 focus-visible:ring-indigo-500" placeholder="Npr. OUTDOOR-55-4K" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nazivModela" className="text-slate-600 font-semibold text-sm">Naziv Modela <span className="text-red-500">*</span></Label>
                <Input id="nazivModela" value={form.nazivModela} onChange={(e) => handleChange("nazivModela", e.target.value)} required className="bg-white shadow-sm h-11 border-slate-200 focus-visible:ring-indigo-500" placeholder="Npr. Vanjski Kiosk 55 incha" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="velicinaEkrana" className="text-slate-600 font-semibold text-sm">Veličina ekrana</Label>
                <Input id="velicinaEkrana" value={form.velicinaEkrana} onChange={(e) => handleChange("velicinaEkrana", e.target.value)} className="bg-white shadow-sm h-11 border-slate-200 focus-visible:ring-indigo-500" placeholder="Npr. 55''" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orijentacija" className="text-slate-600 font-semibold text-sm">Orijentacija panela</Label>
                <Input id="orijentacija" value={form.orijentacija} onChange={(e) => handleChange("orijentacija", e.target.value)} className="bg-white shadow-sm h-11 border-slate-200 focus-visible:ring-indigo-500" placeholder="Npr. Portrait / Landscape" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="operativniSustav" className="text-slate-600 font-semibold text-sm">Ugrađeni OS sustav</Label>
                <Input id="operativniSustav" value={form.operativniSustav} onChange={(e) => handleChange("operativniSustav", e.target.value)} className="bg-white shadow-sm h-11 border-slate-200 focus-visible:ring-indigo-500" placeholder="Npr. Windows 11 IoT Enterprise" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100 mb-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="nabavnaCijenaDefault" className="text-slate-600 font-semibold text-sm">Osnovna Nabavna cijena hardvera</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-400 sm:text-sm">€</span></div>
                   <Input type="number" step="0.01" id="nabavnaCijenaDefault" value={form.nabavnaCijenaDefault} onChange={(e) => handleChange("nabavnaCijenaDefault", e.target.value)} className="pl-7 bg-white shadow-sm border-slate-200 focus-visible:ring-indigo-500 font-mono text-slate-800" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prodajnaCijenaDefault" className="text-indigo-900 font-bold text-sm">Osnovna Prodajna cijena</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-indigo-400 sm:text-sm font-bold">€</span></div>
                   <Input type="number" step="0.01" id="prodajnaCijenaDefault" value={form.prodajnaCijenaDefault} onChange={(e) => handleChange("prodajnaCijenaDefault", e.target.value)} className="pl-7 bg-indigo-50 border-indigo-200 shadow-sm focus-visible:ring-indigo-500 font-bold font-mono text-indigo-900" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-rose-50/30 p-6 rounded-xl border border-rose-100 mb-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="trosakDostaveNabavniDefault" className="text-slate-600 font-semibold text-sm">Zadani povijesni trošak uvoza/nabave</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-400 sm:text-sm">€</span></div>
                   <Input type="number" step="0.01" id="trosakDostaveNabavniDefault" value={form.trosakDostaveNabavniDefault} onChange={(e) => handleChange("trosakDostaveNabavniDefault", e.target.value)} className="pl-7 bg-white shadow-sm border-rose-200 font-mono text-slate-800" placeholder="0.00" />
                </div>
                <p className="text-[10px] text-slate-500">Logistička carina, poštarina do vas</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trosakDostaveProdajniDefault" className="text-rose-900 font-bold text-sm">Zadani iznos Transporta (Klijentu)</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-rose-400 sm:text-sm font-bold">€</span></div>
                   <Input type="number" step="0.01" id="trosakDostaveProdajniDefault" value={form.trosakDostaveProdajniDefault} onChange={(e) => handleChange("trosakDostaveProdajniDefault", e.target.value)} className="pl-7 bg-white border-rose-200 shadow-sm focus-visible:ring-rose-500 font-bold font-mono text-rose-900" placeholder="0.00" />
                </div>
                <p className="text-[10px] text-slate-500">Iznos koji se naplaćuje kupcu za dostavu</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="opis" className="text-slate-600 font-semibold text-sm">Interni detaljan opis i bilješke</Label>
              <Textarea id="opis" rows={5} value={form.opis} onChange={(e) => handleChange("opis", e.target.value)} placeholder="Dodatne specifikacije uređaja koje ne stanu u gornja polja..." className="resize-none shadow-sm bg-slate-50 focus:bg-white transition-colors border-slate-200" />
            </div>
            
          </CardContent>
          <CardFooter className="bg-slate-50/80 border-t border-slate-100 py-4 px-8 flex justify-end">
             <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 px-8 font-semibold w-full sm:w-auto mt-2">
               <Save className="mr-2 h-4 w-4" /> Pospremi i pohrani Model
             </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
