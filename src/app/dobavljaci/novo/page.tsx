'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NoviDobavljacPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nazivTvrtke: "",
    oib: "",
    kontaktOsoba: "",
    email: "",
    telefon: "",
    adresa: "",
    napomena: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await db.suppliers.add({
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      router.push("/dobavljaci");
    } catch(err) {
       console.error("Dexie insert error:", err);
       alert("Došlo je do greške prilikom spremanja dobavljača u Dexie bazu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Link href="/dobavljaci">
          <Button variant="outline" size="icon" className="rounded-xl shadow-sm border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upiši novog dobavljača</h2>
          <p className="text-slate-500 mt-1">Podrška infrastrukturi pri ispunjavanju dolaznih nabavnih potreba.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pb-10">
        <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
             <div className="flex gap-3 items-center">
                 <Truck className="h-6 w-6 text-slate-400" />
                 <div>
                    <CardTitle className="text-slate-800 text-lg">Podatci partnerske tvrtke</CardTitle>
                    <CardDescription>Evidencija tvrtke na koju ćemo otvarati "Narudžbe".</CardDescription>
                 </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="nazivTvrtke" className="text-slate-600 font-semibold text-sm">Pravno ime tvrtke <span className="text-red-500">*</span></Label>
                <Input required id="nazivTvrtke" value={formData.nazivTvrtke} onChange={(e) => handleChange("nazivTvrtke", e.target.value)} placeholder="DisplayFactory d.o.o." className="bg-slate-50 border-amber-100 shadow-sm h-11 focus-visible:ring-amber-500" />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="oib" className="text-slate-600 font-semibold text-sm">Tax ID (OIB/VAT)</Label>
                <Input id="oib" value={formData.oib} onChange={(e) => handleChange("oib", e.target.value)} placeholder="00000000000" className="shadow-sm h-11 font-mono tracking-wider" />
              </div>

              <div className="space-y-2.5 md:col-span-2">
                 <Label htmlFor="adresa" className="text-slate-600 font-semibold text-sm">Adresa poslovanja i dostave</Label>
                 <Input id="adresa" value={formData.adresa} onChange={(e) => handleChange("adresa", e.target.value)} placeholder="Shenzen, Kina..." className="bg-slate-50 shadow-sm h-11" />
              </div>
            </div>

            <hr className="border-slate-100 my-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div className="space-y-2.5">
                <Label htmlFor="kontaktOsoba" className="text-slate-600 font-semibold text-sm">Account Manager</Label>
                <Input id="kontaktOsoba" value={formData.kontaktOsoba} onChange={(e) => handleChange("kontaktOsoba", e.target.value)} className="bg-white h-11 shadow-sm" placeholder="Ime pregovarača" />
               </div>
               
               <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-600 font-semibold text-sm">E-mail adresa za narudžbe</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="bg-white shadow-sm h-11" placeholder="sales@dobavljac.com" />
               </div>

               <div className="space-y-2.5">
                <Label htmlFor="telefon" className="text-slate-600 font-semibold text-sm">Direktan broj mobitela</Label>
                <Input id="telefon" value={formData.telefon} onChange={(e) => handleChange("telefon", e.target.value)} className="bg-white shadow-sm h-11" placeholder="+xxx ..." />
               </div>
            </div>
            
            <div className="space-y-2.5 pt-4 border-t border-slate-100 mt-8">
               <Label htmlFor="napomena" className="text-slate-600 font-semibold text-sm">Interno (Kvaliteta izrade, opozivi roka...)</Label>
               <Textarea id="napomena" rows={3} value={formData.napomena} onChange={(e) => handleChange("napomena", e.target.value)} placeholder="Plaćanje 100% avans. Kasne nekada. Raditi kontrolu ekrana..." className="resize-none shadow-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>

            <div className="pt-8 flex items-center justify-end gap-3">
              <Link href="/dobavljaci">
                 <Button type="button" variant="ghost" className="font-semibold text-slate-500 hover:text-slate-700">Poništi</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 px-8 h-12 text-base rounded-xl transition-all font-semibold select-none group">
                <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Spremi Dobavljača
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
