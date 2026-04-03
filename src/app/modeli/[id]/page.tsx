'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save, MonitorSmartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function EditKioskModelPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function load() {
      const model = await db.kioskModels.get(id);
      if (!model) {
        alert("Model nije pronađen.");
        router.push("/modeli");
        return;
      }
      setForm({
        sifra: model.sifra,
        nazivModela: model.nazivModela,
        velicinaEkrana: model.velicinaEkrana || "",
        orijentacija: model.orijentacija || "",
        operativniSustav: model.operativniSustav || "",
        prodajnaCijenaDefault: String(model.prodajnaCijenaDefault),
        nabavnaCijenaDefault: String(model.nabavnaCijenaDefault),
        trosakDostaveProdajniDefault: String(model.trosakDostaveProdajniDefault || 0),
        trosakDostaveNabavniDefault: String(model.trosakDostaveNabavniDefault || 0),
        opis: model.opis || ""
      });
      setLoading(false);
    }
    load();
  }, [id, router]);

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
      await db.kioskModels.update(id, {
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
        updatedAt: new Date()
      });
      router.push("/modeli");
    } catch (e) {
      console.error(e);
      alert("Greška kod ažuriranja modela.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Učitavanje modela...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Link href="/modeli">
          <Button variant="outline" size="icon" className="rounded-xl shadow-sm border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Uredi Kiosk Model</h2>
          <p className="text-slate-500 mt-1">Ažuriranje hardverske specifikacije i zadanih cijena.</p>
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
                <CardDescription className="mt-1">Izmjene se odmah primjenjuju na buduće ponude.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Šifra / SKU Modela <span className="text-red-500">*</span></Label>
                <Input value={form.sifra} onChange={e => handleChange("sifra", e.target.value)} required className="bg-white shadow-sm h-11" placeholder="Npr. OUTDOOR-55-4K" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Naziv Modela <span className="text-red-500">*</span></Label>
                <Input value={form.nazivModela} onChange={e => handleChange("nazivModela", e.target.value)} required className="bg-white shadow-sm h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Veličina ekrana</Label>
                <Input value={form.velicinaEkrana} onChange={e => handleChange("velicinaEkrana", e.target.value)} className="bg-white shadow-sm h-11" placeholder="Npr. 55''" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Orijentacija panela</Label>
                <Input value={form.orijentacija} onChange={e => handleChange("orijentacija", e.target.value)} className="bg-white shadow-sm h-11" placeholder="Portrait / Landscape" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Ugrađeni OS sustav</Label>
                <Input value={form.operativniSustav} onChange={e => handleChange("operativniSustav", e.target.value)} className="bg-white shadow-sm h-11" placeholder="Windows 11 IoT / Android..." />
              </div>
            </div>

            {/* Cijene */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Nabavna cijena hardvera</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">€</span>
                  <Input type="number" step="0.01" value={form.nabavnaCijenaDefault} onChange={e => handleChange("nabavnaCijenaDefault", e.target.value)} className="pl-7 bg-white shadow-sm font-mono" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-indigo-900 font-bold text-sm">Prodajna cijena (Osnovica)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-indigo-400 text-sm font-bold">€</span>
                  <Input type="number" step="0.01" value={form.prodajnaCijenaDefault} onChange={e => handleChange("prodajnaCijenaDefault", e.target.value)} className="pl-7 bg-indigo-50 border-indigo-200 shadow-sm font-bold font-mono text-indigo-900" placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* Dostava */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-rose-50/30 p-6 rounded-xl border border-rose-100">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Zadani trošak uvoza/nabave</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">€</span>
                  <Input type="number" step="0.01" value={form.trosakDostaveNabavniDefault} onChange={e => handleChange("trosakDostaveNabavniDefault", e.target.value)} className="pl-7 bg-white shadow-sm border-rose-200 font-mono" placeholder="0.00" />
                </div>
                <p className="text-[10px] text-slate-500">Carina, špedicija, poštarina do vas</p>
              </div>
              <div className="space-y-2">
                <Label className="text-rose-900 font-bold text-sm">Zadani iznos Transporta (Klijentu)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-rose-400 text-sm font-bold">€</span>
                  <Input type="number" step="0.01" value={form.trosakDostaveProdajniDefault} onChange={e => handleChange("trosakDostaveProdajniDefault", e.target.value)} className="pl-7 bg-white border-rose-200 shadow-sm font-bold font-mono text-rose-900" placeholder="0.00" />
                </div>
                <p className="text-[10px] text-slate-500">Iznos koji se naplaćuje kupcu</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-slate-600 font-semibold text-sm">Interni opis i bilješke</Label>
              <Textarea rows={4} value={form.opis} onChange={e => handleChange("opis", e.target.value)} className="resize-none shadow-sm bg-slate-50 focus:bg-white transition-colors border-slate-200" />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/80 border-t border-slate-100 py-4 px-8 flex justify-between items-center">
            <Link href="/modeli">
              <Button type="button" variant="ghost" className="text-slate-500">Odustani</Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 px-8 font-semibold">
              <Save className="mr-2 h-4 w-4" /> {saving ? "Sprema..." : "Spremi Izmjene"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
