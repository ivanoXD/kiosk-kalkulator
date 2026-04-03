'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function UrediKupcaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nazivTvrtke: "",
    oib: "",
    kontaktOsoba: "",
    email: "",
    telefon: "",
    adresaRacun: "",
    adresaDostava: "",
    napomena: ""
  });

  useEffect(() => {
    async function loadCustomer() {
      const customer = await db.customers.get(id);
      if (customer) {
        setFormData({
          nazivTvrtke: customer.nazivTvrtke,
          oib: customer.oib || "",
          kontaktOsoba: customer.kontaktOsoba || "",
          email: customer.email || "",
          telefon: customer.telefon || "",
          adresaRacun: customer.adresaRacun || "",
          adresaDostava: customer.adresaDostava || "",
          napomena: customer.napomena || ""
        });
      }
      setInitialLoading(false);
    }
    loadCustomer();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await db.customers.update(id, {
        ...formData,
        updatedAt: new Date(),
      });
      router.push("/kupci");
    } catch(err) {
       console.error("Dexie update error:", err);
       alert("Došlo je do greške prilikom lokalnog spremanja naručitelja.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Učitavanje podataka...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Link href="/kupci">
          <Button variant="outline" size="icon" className="rounded-xl shadow-sm border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Uredi Naručitelja</h2>
          <p className="text-slate-500 mt-1">Ažurirajte podatke o postojećem klijentu.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pb-10">
        <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
             <div className="flex gap-3 items-center">
                 <Building2 className="h-6 w-6 text-slate-400" />
                 <div>
                    <CardTitle className="text-slate-800 text-lg">Podatci o poduzeću</CardTitle>
                    <CardDescription>Pravni identitet klijenta s adresom i OIB-om.</CardDescription>
                 </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="nazivTvrtke" className="text-slate-600 font-semibold text-sm">Pravno ime tvrtke (Naziv) <span className="text-red-500">*</span></Label>
                <Input required id="nazivTvrtke" value={formData.nazivTvrtke} onChange={(e) => handleChange("nazivTvrtke", e.target.value)} placeholder="Agencija Primjer d.o.o." className="bg-slate-50 border-emerald-100 shadow-sm h-11 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="oib" className="text-slate-600 font-semibold text-sm">OIB</Label>
                <Input id="oib" value={formData.oib} onChange={(e) => handleChange("oib", e.target.value)} placeholder="00000000000" className="shadow-sm h-11 font-mono tracking-wider" />
              </div>

              <div className="space-y-2.5 md:col-span-2">
                 <Label htmlFor="adresaRacun" className="text-slate-600 font-semibold text-sm">Adresa (Ulica, Poštanski broj, Mjesto)</Label>
                 <Input id="adresaRacun" value={formData.adresaRacun} onChange={(e) => handleChange("adresaRacun", e.target.value)} placeholder="npr. Ilica 11, 10000 Zagreb" className="bg-slate-50 shadow-sm h-11" />
              </div>
            </div>

            <hr className="border-slate-100 my-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div className="space-y-2.5">
                <Label htmlFor="kontaktOsoba" className="text-slate-600 font-semibold text-sm">Glavna kontakt osoba</Label>
                <Input id="kontaktOsoba" value={formData.kontaktOsoba} onChange={(e) => handleChange("kontaktOsoba", e.target.value)} className="bg-white h-11 shadow-sm" placeholder="Ime i Prezime" />
               </div>
               
               <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-600 font-semibold text-sm">Poslovni E-mail adresa</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="bg-white shadow-sm h-11" placeholder="kontakt@tvrtka.hr" />
               </div>

               <div className="space-y-2.5">
                <Label htmlFor="telefon" className="text-slate-600 font-semibold text-sm">Kontakt Telefon</Label>
                <Input id="telefon" value={formData.telefon} onChange={(e) => handleChange("telefon", e.target.value)} className="bg-white shadow-sm h-11" placeholder="+385 9x xxx xxxx" />
               </div>
            </div>
            
            <div className="space-y-2.5 pt-4 border-t border-slate-100 mt-8">
               <Label htmlFor="napomena" className="text-slate-600 font-semibold text-sm">Specifičnosti o klijentu (Interno)</Label>
               <Textarea id="napomena" rows={3} value={formData.napomena} onChange={(e) => handleChange("napomena", e.target.value)} placeholder="Rok plaćanja 30 dana, traže popust..." className="resize-none shadow-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>

            <div className="pt-8 flex items-center justify-end gap-3">
              <Link href="/kupci">
                 <Button type="button" variant="ghost" className="font-semibold text-slate-500 hover:text-slate-700">Poništi</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 px-8 h-12 text-base rounded-xl transition-all font-semibold select-none group">
                <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Spremi Izmjene
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
