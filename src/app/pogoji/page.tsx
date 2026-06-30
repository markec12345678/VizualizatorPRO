import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, FileText, Scale, AlertTriangle, Ban } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pogoji uporabe',
  description: 'Pogoji uporabe storitve VizualizatorPRO.',
}

export default function TermsOfService() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VizualizatorPRO</h1>
              <p className="text-xs text-muted-foreground">AI vizualizacije za prodajo</p>
            </div>
          </Link>
        </div>
      </header>

      <section className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-2">Pogoji uporabe</h2>
          <p className="text-sm text-muted-foreground mb-8">Zadnja posodobitev: 29. junij 2026</p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                1. Sprejem pogojev
              </h3>
              <p className="text-muted-foreground">
                Z uporabo aplikacije VizualizatorPRO (v nadaljevanju &quot;storitev&quot;) 
                se strinjate s temi pogoji uporabe. Če se ne strinjate, storitve ne uporabljajte.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Scale className="h-5 w-5 text-accent" />
                2. Opis storitve
              </h3>
              <p className="text-muted-foreground">
                VizualizatorPRO je SaaS aplikacija za izvajalce gradbenih storitev, ki omogoča:
              </p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside mt-2">
                <li>AI vizualizacije materialov na fotografijah</li>
                <li>AR (augmented reality) prikaz ograd</li>
                <li>Generiranje PDF ponudb</li>
                <li>Multi-tenant upravljanje ekipe in projektov</li>
                <li>Katalog materialov (WPC, Inox, Steklo, keramika)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                3. Paketi in cene
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-semibold">Paket</th>
                      <th className="text-left py-2 px-3 font-semibold">Cena</th>
                      <th className="text-left py-2 px-3 font-semibold">Uporabniki</th>
                      <th className="text-left py-2 px-3 font-semibold">Vizualizacije</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2 px-3">Trial</td>
                      <td className="py-2 px-3">Brezplačno (14 dni)</td>
                      <td className="py-2 px-3">1</td>
                      <td className="py-2 px-3">10</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Pro</td>
                      <td className="py-2 px-3">49 €/mes</td>
                      <td className="py-2 px-3">3</td>
                      <td className="py-2 px-3">200/mes</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Agency</td>
                      <td className="py-2 px-3">199 €/mes</td>
                      <td className="py-2 px-3">10</td>
                      <td className="py-2 px-3">1000/mes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cene veljajo za mesečno naročnino. DDV vključen.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                4. Uporabnikove obveznosti
              </h3>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Uporabnik je odgovoren za točnost vnesenih podatkov</li>
                <li>Uporabnik sme uporabljati storitev samo za zakonite namene</li>
                <li>Uporabnik ne sme deliti svojega računa z drugimi</li>
                <li>Uporabnik je odgovoren za varnost svojega gesla</li>
                <li>Slike, ki jih uporabnik naloži, morajo biti njegove last ali imeti ustrezna dovoljenja</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Ban className="h-5 w-5 text-accent" />
                5. Prepovedane dejavnosti
              </h3>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Zloraba storitve za nezakonite namene</li>
                <li>Poskus ogrožanja varnosti ali celovitosti sistema</li>
                <li>Reverse engineering ali dekompilacija</li>
                <li>Spam ali nepooblaščeno pošiljanje emailov</li>
                <li>Uporaba slik tretjih oseb brez dovoljenja</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                6. Intelektualna lastnina
              </h3>
              <p className="text-muted-foreground">
                Aplikacija VizualizatorPRO je odprtokodna (MIT licenca). AI-generirane slike
                so last uporabnika, ki jih je generiral. Reference slike materialov so
                AI-generirane in prosto uporabne.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                7. Omejitev odgovornosti
              </h3>
              <p className="text-muted-foreground">
                Storitev je na voljo &quot;kot je&quot; brez garancij. Ne odgovarjamo za:
              </p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside mt-2">
                <li>Izgubo dobička ali poslovnih priložnosti</li>
                <li>Natančnost AI-generiranih vizualizacij</li>
                <li>Prekinitve delovanja ali nedosegljivost</li>
                <li>Izgubo podatkov (priporočamo redne backup-e)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                8. Raskid pogodbe
              </h3>
              <p className="text-muted-foreground">
                Uporabnik lahko kadarkoli izbriše svoj račun. Po izbrisu se vsi podatki
                (razen zakonsko zahtevanih) izbrišejo v 30 dneh. Mi si pridržujemo pravico
                do blokade računa v primeru kršitve pogojev.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                9. Spremembe pogojev
              </h3>
              <p className="text-muted-foreground">
                Pogoje lahko kadarkoli posodobimo. Uporabnike bomo obvestili po emailu
                vsaj 30 dni preden spremembe začnejo veljati.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                10. Pravo in pristojnost
              </h3>
              <p className="text-muted-foreground">
                Ti pogoji so podvrženi slovenskemu pravu. Za vse spore je pristojno
                Okrožno sodišče v Ljubljani.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                11. Kontakt
              </h3>
              <p className="text-muted-foreground">
                VizualizatorPRO<br />
                Email: <strong>legal@vizualizatorpro.si</strong><br />
                Telefon: +386 1 234 56 78
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link href="/" className="text-sm text-accent hover:underline">
              ← Nazaj na aplikacijo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
