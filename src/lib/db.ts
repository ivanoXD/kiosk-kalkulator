import Dexie, { type EntityTable } from 'dexie';

export interface KioskModel {
  id: string;
  nazivModela: string;
  sifra: string;
  velicinaEkrana?: string | null;
  orijentacija?: string | null;
  rezolucija?: string | null;
  svjetlina?: string | null;
  operativniSustav?: string | null;
  tipKoristenja?: string | null;
  touchTip?: string | null;
  materijal?: string | null;
  opis?: string | null;
  prodajnaCijenaDefault: number;
  nabavnaCijenaDefault: number;
  trosakDostaveProdajniDefault: number;
  trosakDostaveNabavniDefault: number;
  statusAktivan: boolean;
  slikaUrl?: string | null;
  dokumentacijaUrl?: string | null;
  napomena?: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
}

export interface Customer {
  id: string;
  nazivTvrtke: string;
  kontaktOsoba?: string | null;
  email?: string | null;
  telefon?: string | null;
  adresaRacun?: string | null;
  adresaDostava?: string | null;
  oib?: string | null;
  napomena?: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
}

export interface Supplier {
  id: string;
  nazivTvrtke: string;
  kontaktOsoba?: string | null;
  email?: string | null;
  telefon?: string | null;
  adresa?: string | null;
  oib?: string | null;
  napomena?: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
}

export interface SubItem {
  id: string;
  naziv: string;
  kolicina?: number;
  cijenaProdajna: number;
  cijenaNabavna: number;
  gratisMjeseci?: number;
}

export interface OfferItem {
  id: string;
  offerId: string;
  kioskModelId?: string | null;
  nazivStavkeOverride?: string | null;
  kolicina: number;
  prodajnaCijenaKom: number;
  nabavnaCijenaKom: number;
  trosakDostaveProdajni: number;
  trosakDostaveNabavni: number;
  brojRadnihSati: number;
  cijenaRadnogSataProdajna: number;
  cijenaRadnogSataNabavna: number;
  cijenaInstalacijeSetupProdajna: number;
  cijenaInstalacijeSetupNabavna: number;
  wrapperUkljucen: boolean;
  cijenaWrapperaProdajna: number;
  cijenaWrapperaNabavna: number;
  dodatniTrosakProdajni: number;
  dodatniTrosakNabavni: number;
  subscriptions: SubItem[];
  dodatnaOprema: SubItem[];
  subtotalBezPdv: number;
  subtotalNabavni: number;
  profit: number;
  marzaPostotak: number;
  ukupnoMjesečnoBezPdv: number;
  ukupnoMjesečnoNabavno: number;
  napomena?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  brojPonude: string;
  customerId: string;
  datumPonude: Date;
  statusPonude: string;
  valuta: string;
  pdvStopa: number;
  subtotalBezPdv: number;
  ukupnoPdv: number;
  ukupnoSPdv: number;
  ukupnaNabavnaVrijednost: number;
  ukupniProfit: number;
  ukupnaMarzaPostotak: number;
  ukupnoMjesečnoBezPdv: number;
  ukupnoMjesečnoPdv: number;
  ukupnoMjesečnoSPdv: number;
  internaNapomena?: string | null;
  napomenaZaPdf?: string | null;
  versionNumber: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
}

export interface Order {
  id: string;
  brojNarudzbe: string;
  offerId: string;
  customerId: string;
  supplierId?: string | null;
  datumNarudzbe: Date;
  ocekivaniDatumIsporuke?: Date | null;
  stvarniDatumIsporuke?: Date | null;
  statusNarudzbe: string;
  internaNapomena?: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
}

export interface Settings {
  id: string;
  companyName: string;
  companyAddress: string;
  companyOib: string;
  companyIban: string;
  companyEmail: string;
  companyPhone: string;
  defaultPdvStopa: number;
  defaultValuta: string;
  defaultRadniSatProdajni: number;
  defaultRadniSatNabavni: number;
  defaultPdfNapomena?: string | null;
  updatedAt: Date;
}

// Definiramo tip baze
class KioskDatabase extends Dexie {
  kioskModels!: EntityTable<KioskModel, 'id'>;
  customers!: EntityTable<Customer, 'id'>;
  suppliers!: EntityTable<Supplier, 'id'>;
  offers!: EntityTable<Offer, 'id'>;
  offerItems!: EntityTable<OfferItem, 'id'>;
  orders!: EntityTable<Order, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('KioskOffersDatabase');

    // VERZIJA 1 - originalna shema (mora ostati za migraciju!)
    this.version(1).stores({
      kioskModels: 'id, sifra, nazivModela, statusAktivan',
      customers: 'id, nazivTvrtke, oib',
      suppliers: 'id, nazivTvrtke, oib',
      offers: 'id, brojPonude, customerId, statusPonude, datumPonude',
      offerItems: 'id, offerId, kioskModelId',
      orders: 'id, brojNarudzbe, offerId, customerId, supplierId, statusNarudzbe',
      settings: 'id',
      syncQueue: '++id, entityType, action'
    });

    // VERZIJA 2 - nova shema s uklonjenim syncQueue i novim poljima
    // Dexie automatski migrira podatke, nova polja su opcionalna
    this.version(2).stores({
      kioskModels: 'id, sifra, nazivModela, statusAktivan',
      customers: 'id, nazivTvrtke, oib',
      suppliers: 'id, nazivTvrtke, oib',
      offers: 'id, brojPonude, customerId, statusPonude, datumPonude',
      offerItems: 'id, offerId, kioskModelId',
      orders: 'id, brojNarudzbe, offerId, customerId, supplierId, statusNarudzbe',
      settings: 'id',
      syncQueue: null // Eksplicitno brišemo syncQueue tablicu
    }).upgrade(tx => {
      // Migracija: dodaj defaultne vrijednosti za nova polja na starim zapisima
      return tx.table('kioskModels').toCollection().modify(model => {
        if (model.trosakDostaveProdajniDefault === undefined) {
          model.trosakDostaveProdajniDefault = 0;
        }
        if (model.trosakDostaveNabavniDefault === undefined) {
          model.trosakDostaveNabavniDefault = 0;
        }
      });
    });
  }
}

// Helper function to generate IDs even in non-secure contexts (HTTP)
export const generateId = () => {
   if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
     return window.crypto.randomUUID();
   }
   return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export const db = new KioskDatabase();
