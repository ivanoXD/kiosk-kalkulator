'use client';

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, MonitorSmartphone, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ModeliKioskaPage() {
  const kioskModels = useLiveQuery(() => db.kioskModels.toArray());

  const handleDelete = async (id: string) => {
    if (confirm("Jeste li sigurni da želite obrisati ovaj model? Ova radnja se ne može poništiti i može stvoriti grešku kod prijašnjih ponuda ako model više ne postoji.")) {
      await db.kioskModels.delete(id);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="bg-blue-100/50 p-2 rounded-lg"><MonitorSmartphone className="h-7 w-7 text-indigo-600" /></div>
             Modeli Kioska
          </h2>
          <p className="text-slate-500 mt-2">Ovdje upravljate hardverom, kioscima i displejima iz vašeg asortimana. Modeli će se preslikavati na stavke u ponudama.</p>
        </div>
        <Link href="/modeli/novo">
          <Button className="font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 rounded-xl px-5">
            <Plus className="mr-2 h-5 w-5" /> Novi Model
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200/60 shadow-md shadow-slate-200/40 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
           <div className="flex items-center justify-between">
              <div>
                 <CardTitle className="text-slate-800 text-lg">Svi upisani modeli u sustavu</CardTitle>
                 <CardDescription className="mt-1">Prikazuje se evidencija za potrebe kalkulatora.</CardDescription>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600">Šifra</TableHead>
                <TableHead className="font-semibold text-slate-600 w-1/4">Naziv Modela</TableHead>
                <TableHead className="font-semibold text-slate-600">Tip Ekrana</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Nabavna Cijena</TableHead>
                <TableHead className="text-right font-semibold text-slate-900 border-x border-slate-100 border-dashed bg-slate-50/50">Zadana Prodajna</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kioskModels === undefined ? (
                <TableRow>
                   <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                     <span className="animate-pulse">Učitavanje iz baze...</span>
                   </TableCell>
                </TableRow>
              ) : kioskModels?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-500">
                    Niste dodali oblike kioska i modela. <br />
                    <Link href="/modeli/novo">
                      <Button variant="link" className="mt-2 text-indigo-600 hover:text-indigo-800 font-semibold text-base px-0">Kreirajte prvi model ovdje 🚀 </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                kioskModels?.map((model) => (
                  <TableRow key={model.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500">{model.sifra}</TableCell>
                    <TableCell className="font-medium text-slate-900">{model.nazivModela}</TableCell>
                    <TableCell>
                      {model.tipKoristenja ? (
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[10px] bg-slate-50 font-medium text-slate-600 uppercase shadow-none border-slate-200 tracking-wider">
                            {model.tipKoristenja}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] bg-slate-50 font-medium text-slate-500 uppercase shadow-none border-slate-200 tracking-wider">
                            {model.touchTip}
                          </Badge>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-400">€{model.nabavnaCijenaDefault.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900 border-x border-slate-100 border-dashed bg-slate-50/50">€{model.prodajnaCijenaDefault.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      {model.statusAktivan ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-none font-medium">Aktivan</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 shadow-none font-medium">Neaktivan</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Link href={`/modeli/${model.id}`}>
                         <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                            <Pencil className="h-4 w-4" />
                         </Button>
                       </Link>
                       <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(model.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
