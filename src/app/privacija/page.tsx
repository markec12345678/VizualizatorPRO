import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Shield, Mail, Database, Cookie, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politika zasebnosti',
  description: 'Politika zasebnosti VizualizatorPRO - kako obdelujemo osebne podatke v skladu z GDPR.',
}

export default function PrivacyPolicy() {
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Politika zasebnosti</h2>
          <p className="text-sm text-muted-foreground mb-8">Zadnja posodobitev: 29. junij 2026</p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                1. Upravljalec podatkov
              </h3>
              <p className="text-muted-foreground">
                Upravljalec osebnih podatkov je VizualizatorPRO (v nadaljevanju &quot;mi&quot; ali &quot;aplikacija&quot;).
                Za vsa vprašanja glede obdelave osebnih podatkov nas lahko kontaktirate na
                <strong> info@vizualizatorpro.si</strong>.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Database className="h-5 w-5 text-accent" />
                2. Katere podatke obdelujemo
              </h3>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li><strong>Stranke (lead forma):</strong> ime, email, telefon, firma, sporočilo</li>
                <li><strong>Uporabniki (registracija):</strong> email, ime, vloga, geslo (bcrypt hash)</li>
                <li><strong>Slike:</strong> fotografije balkonov/prostorov za AI vizualizacije</li>
                <li><strong>Uporaba:</strong> analitični podatki (PostHog, če je odobreno)</li>
                <li><strong>Tehnični:</strong> IP naslov, brskalnik, naprava (avtomatsko)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Cookie className="h-5 w-5 text-accent" />
                3. Piškotki
              </h3>
              <p className="text-muted-foreground mb-2">
                Uporabljamo dve vrsti piškotkov:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li><strong>Nujni (obvezni):</strong> session, avtentikacija, varnost. Brez teh aplikacija ne deluje.</li>
                <li><strong>Analitični (opcijski):</strong> PostHog za izboljšanje uporabniške izkušnje. Anonimni podatki. Lahko jih onemogočite.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Piškotke lahko upravljate v nastavitvah brskalnika ali preko našega cookie consent banner-ja.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-accent" />
                4. Pravna podlaga (GDPR čl. 6)
              </h3>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li><strong>Izvedba pogodbe (čl. 6(1)(b)):</strong> registracija in uporaba aplikacije</li>
                <li><strong>Pravna obveznost (čl. 6(1)(c)):</strong> davčna evidence­nija, računi</li>
                <li><strong>Legitimni interes (čl. 6(1)(f)):</strong> varnost, preprečevanje zlorab</li>
                <li><strong>Soglasje (čl. 6(1)(a)):</strong> analitični piškotki, marketing</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Mail className="h-5 w-5 text-accent" />
                5. Vaše pravice (GDPR)
              </h3>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li><strong>Dostop:</strong> zahtevajte vpogled v svoje podatke</li>
                <li><strong>Popravek:</strong> zahtevajte popravke napačnih podatkov</li>
                <li><strong>Brisanje:</strong> zahtevajte izbris svojega računa in podatkov</li>
                <li><strong>Omejitev:</strong> zahtevajte omejitev obdelave</li>
                <li><strong>Prenosljivost:</strong> zahtevajte izvoz podatkov v strokovno berljivi obliki</li>
                <li><strong>Pritožba:</strong> pritožite se pri Informacijskem pooblaščencu RS (IP RS)</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Za uveljavljanje pravic pišite na <strong>privacy@vizualizatorpro.si</strong>.
                Odgovorili bomo v 30 dneh.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                6. Hramba podatkov
              </h3>
              <p className="text-muted-foreground">
                Podatke hranimo le toliko časa, kot je potrebno za namen obdelave:
              </p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside mt-2">
                <li>Stranke (leadi): 2 leti po zadnjem stiku</li>
                <li>Uporabniški računi: do izbrisaa računa</li>
                <li>Slike: do izbrisa projekta</li>
                <li>Analitični podatki: 13 mesecev</li>
                <li>Log datoteke: 90 dni</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                7. Varnost
              </h3>
              <p className="text-muted-foreground">
                Podatki šifrirani pri prenosu (HTTPS/TLS 1.3) in pri mirovanju.
                Gesla so hash-ana z bcrypt (12 rounds). Dostop do podatkov je omejen
                na pooblaščene osebe. Redno izvajamo varnostne preglede.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                8. Tretje osebe
              </h3>
              <p className="text-muted-foreground mb-2">
                Podatke delimo z naslednjimi storitvami (samo z nujnimi podatki):
              </p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Replicate</strong> - AI generiranje slik (samo slika, ne osebni podatki)</li>
                <li><strong>Resend</strong> - pošiljanje email obvestil</li>
                <li><strong>PostHog</strong> - analitika (samo z soglasjem)</li>
                <li><strong>Vercel/GitHub</strong> - gostovanje in CI/CD</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                9. Kontakt
              </h3>
              <p className="text-muted-foreground">
                VizualizatorPRO<br />
                Email: <strong>privacy@vizualizatorpro.si</strong><br />
                Telefon: +386 1 234 56 78<br />
                Informacijski pooblaščenec RS: <a href="https://www.ip-rs.si" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.ip-rs.si</a>
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
