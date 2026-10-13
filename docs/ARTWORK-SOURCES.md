# Historical artwork sources

This is a research list of places where we can find real medieval and Renaissance artwork: ornament prints, manuscript borders, initials, marginalia, woodcuts, herbals, bestiaries, pattern books and decorative arts. The images must allow editing, redistribution and commercial use by our consumers. It names sources only. It does not add, approve or assign any artwork. Item-level candidates still belong in [source-candidates.json](source-candidates.json), and imported provenance belongs in the master catalogs (for example `historical-additions.json`).

Terms were checked on 2026-10-10. Institutions change their terms, so re-read the rights statement on the item record before every import. This is research to guide our own policy, not legal advice.

## Scope

- **Wanted:** period originals from roughly 500 to 1650. Closely fitting nearby material is also welcome: Insular, Byzantine, Romanesque, Islamic and Mudéjar ornament, and early-17th-century ornament prints.
- **Not wanted:** modern imitations, revival designs (such as 19th-century Gothic Revival), "medieval-style" clip art, AI-made pastiche and "enhanced" or remastered copies.
- **Fallback only:** faithful 19th-century facsimiles of named originals (see [Fallback](#fallback-19th-century-facsimiles)).

## How to read this list

| Tier | Meaning | Use in the main collection |
|---|---|---|
| **A** | CC0, Public Domain Mark (PDM) or an explicit statement allowing any use, including commercial. | Yes. Record provenance as usual. |
| **B** | CC BY. Commercial use and changes are allowed, with attribution. | Yes. See [Source licenses: what to do](#source-licenses-what-to-do). |
| **C** | CC BY-SA. Changed images must stay CC BY-SA. | Flat scans of public-domain works, yes. Original photographs, no. See [Source licenses: what to do](#source-licenses-what-to-do). |
| **X** | A legal basis beyond copyright, unclear law, terms that must be accepted, or no usable files. | No. Use only to discover where an artwork is held. NC or ND labels alone are not X; see [Restrictive labels only](#restrictive-labels-only). |

The **Checked** column says how the terms were confirmed:

- **Official:** read on the institution's own rights page or item record during this research.
- **Secondary:** taken from search summaries, mirrors or news reports. Re-read the official page before importing.

Most open institutions label rights **per item**. A collection-wide "open access" policy covers only the records that carry the open label, so the label on the item record always decides.

## Best places to start

| Need | Strongest open sources |
|---|---|
| Repeating borders, friezes, panels, grotesques | Ornament prints: [Rijksmuseum](#museums), [The Met](#museums), [MKG Hamburg](#museums), [Staatliche Museen zu Berlin](#museums) (Kunstbibliothek), [Cooper Hewitt](#museums), [National Gallery of Art](#museums), [Paris Musées](#museums), [Art Institute of Chicago](#museums) |
| Lace and embroidery model books (geometric repeats) | Leaves of Vinciolo (1587/1588) and Sibmacher (1597/1604) at The Met, Art Institute of Chicago and Cooper Hewitt. Some Met records are not downloadable, so check each one. |
| Illuminated borders, initials, drolleries | [Walters](#museums), [Getty](#museums), [OPenn](#libraries-and-manuscript-portals), [Cleveland](#museums), [Bayerische Staatsbibliothek](#libraries-and-manuscript-portals), [Heidelberg](#libraries-and-manuscript-portals), [Herzog August Bibliothek](#libraries-and-manuscript-portals), [KB Netherlands](#libraries-and-manuscript-portals), [Leiden](#libraries-and-manuscript-portals) |
| Woodcut figures, animals, plants | [Biodiversity Heritage Library](#libraries-and-manuscript-portals) (Fuchs, Brunfels, Mattioli, Gesner), [e-rara](#libraries-and-manuscript-portals) (Gessner), [Wellcome](#libraries-and-manuscript-portals), [Library of Congress](#libraries-and-manuscript-portals) (block books, Nuremberg Chronicle), [Plantin-Moretus](#museums) woodblocks |
| Printers' initials, headpieces, tailpieces | [Plantin-Moretus](#museums), [e-rara](#libraries-and-manuscript-portals), [Bayerische Staatsbibliothek](#libraries-and-manuscript-portals), [Staatsbibliothek zu Berlin](#libraries-and-manuscript-portals), [Herzog August Bibliothek](#libraries-and-manuscript-portals) |
| Insular interlace | [Trinity College Dublin](#attribution-b-and-share-alike-c) (CC BY; Book of Kells excluded) |
| Spanish and Mozarabic manuscripts | [Biblioteca Nacional de España](#attribution-b-and-share-alike-c) (CC BY) |
| Byzantine, Armenian, Ethiopic, Islamic | [Walters](#museums), [Smithsonian](#museums) (Freer CC0 items), [The Met](#museums), [Cleveland](#museums) |
| Heraldry and court figures | [Heidelberg](#libraries-and-manuscript-portals) Codex Manesse (PDM) |

Walters, The Met, Cleveland and Getty are already proven sources for this collection (see `historical-additions.json`).

## Museums

All tier A. "Already used" means existing collection artwork comes from that source.

| Source | Terms | Filter and access | Best for | Checked |
|---|---|---|---|---|
| [The Metropolitan Museum of Art](https://www.metmuseum.org/policies/image-resources) (US) | Open Access images of public-domain works are CC0 and free for unrestricted use. | "Open Access" filter, or the API field `isPublicDomain`. Some records still say the image cannot be downloaded. | Ornament prints (Aldegrever, Hopfer, Solis, Flötner, du Cerceau, Delaune), lace and embroidery pattern-book leaves, manuscript leaves, Cloisters objects. Already used. | Official |
| [Smithsonian Open Access](https://www.si.edu/openaccess/faq), including [Cooper Hewitt](https://collection.cooperhewitt.org/) (US) | CC0 items can be used for any purpose, including commercial, with no attribution, permission or fee. Logos and names are excluded. Items marked "usage conditions apply" follow [Restrictive labels only](#restrictive-labels-only) when the work itself is public domain. | CC0 filter at [collection search](https://www.si.edu/search/collection-images), API via api.data.gov, IIIF manifests, bulk metadata. | Cooper Hewitt ornament prints, pattern and model books, lace and textiles. Freer Islamic manuscripts. Smithsonian Libraries ornament books. | Official |
| [National Gallery of Art](https://www.nga.gov/artworks/free-images-and-open-access) (US) | Open Access images are free for any use, commercial or non-commercial. Do not use the logo or imply endorsement. | "Open Access" filter. Metadata dataset on [GitHub](https://github.com/NationalGalleryOfArt/opendata). | Rosenwald Collection prints: Schongauer, Master E.S., van Meckenem, Dürer, Aldegrever. Early woodcuts and illuminated leaves. | Official |
| [Art Institute of Chicago](https://www.artic.edu/image-licensing) (US) | Images labelled "CC0 Public Domain Designation" are free for any purpose, including commercial. The API's `description` text is CC BY, not CC0. | Public-domain filter, API field `is_public_domain`, IIIF, nightly data dumps. | Prints and drawings, textiles, decorative arts. Includes a CC0 [Sibmacher model-book plate](https://www.artic.edu/artworks/132240/). | Official |
| [Cleveland Museum of Art](https://www.clevelandart.org/open-access) (US) | CC0. Downloads exist only for CC0 works. | Open Access facet, keyless API, weekly GitHub data. | Manuscript illuminations (psalter and Book of Hours leaves), Gothic metalwork, textiles. Already used. | Official |
| [Walters Art Museum](https://www.thedigitalwalters.org/01_ACCESS_WALTERS_MANUSCRIPTS.html) (US) | Manuscript images are CC0. The descriptions on the OPenn mirror are licensed separately, so write our own text. | Digital Walters, [OPenn mirror](https://openn.library.upenn.edu/html/0054.html) for scripted access, master TIFFs. | Books of Hours, marginalia (W.102 Reynard cycle), Byzantine, Armenian, Ethiopic and Islamic manuscripts. Already used. | Official |
| [Getty Museum](https://www.getty.edu/projects/open-content-program/) (US) | The Open Content Program offers public-domain images without restrictions, and they appear in commercial products. Credit is requested. | "Open Content" images in the collection, IIIF. | Illuminated manuscripts: Flemish and French Books of Hours borders, initials and choir books. Already used. | Official |
| [Yale University Art Gallery](https://artgallery.yale.edu/using-collection/using-images/rights-and-reproductions) (US) | No permission is needed for images of public-domain works. Yale's [open-access policy](https://web.library.yale.edu/node/4085) places no limits on use. | Download link on public-domain images only. | Some medieval and decorative arts. Moderate fit. | Official |
| [Rijksmuseum](https://data.rijksmuseum.nl/policy) (NL) | Public domain or CC0, including commercial use, without asking. Some items are CC BY or restricted. | Each record shows its rights. API and bulk data at data.rijksmuseum.nl. | One of the largest ornament-print holdings, such as Aldegrever ([RP-P-OB-2907](https://www.rijksmuseum.nl/en/collection/RP-P-OB-2907)), van Meckenem ([RP-P-OB-1135](https://www.rijksmuseum.nl/en/collection/RP-P-OB-1135), PDM confirmed) and Flötner-school grotesques. | Official |
| [Statens Museum for Kunst (SMK)](https://open.smk.dk/) (DK) | Public-domain records carry PDM 1.0 in the open API. | API filter `public_domain:true`, plus `has_image`, since many ornament records have no image yet. IIIF manifests. | Kobberstiksamling (print room) ornament prints. | Official (API) |
| [Museum für Kunst und Gewerbe (MKG)](https://www.mkg-hamburg.de/en/collection) (DE) | Public-domain images are free for personal, scientific, creative and commercial use, marked PDM per object. Some items are CC BY. | Download per object page, for example [dc00101865](https://www.mkg-hamburg.de/en/object/dc00101865). | Core ornament-print source: Virgil Solis, Hans Sebald Beham, Matthias Zündt, de Bry's grotesque alphabet, Mignot. Also textiles, lace and tiles. | Official |
| [Paris Musées](https://www.parismuseescollections.paris.fr/fr/conditions-generales-d-utilisation) (FR) | Images credited CCØ are CC0, including commercial use. The file itself may not be sold as-is. | [Open-image filter](https://parismuseescollections.paris.fr/fr/recherche/type/oeuvre/image-libre/true). Files of 3000 px or more, ZIP with credit. | Petit Palais Dutuit prints, such as Lucas van Leyden's [rinceaux](https://www.parismuseescollections.paris.fr/fr/petit-palais/oeuvres/un-triton-et-une-sirene-dans-des-rinceaux-bartsch-169) (CC0 confirmed). Limoges enamels. | Official |
| [Staatliche Museen zu Berlin](https://www.smb.museum/open-science-open-access/nutzung/) (DE) | Public domain by default, so images may be shared, edited and used commercially without asking. Some images are CC BY-SA (tier C). | License label on each record at [search.smb.museum](https://search.smb.museum/). Older museum-digital records show NC licenses; skip those. | Kunstbibliothek Ornamentstichsammlung (ornament prints, 15th to 19th century), Kupferstichkabinett (Dürer, Schongauer, Master E.S.), Kunstgewerbemuseum. | Official |
| [Museum Plantin-Moretus](https://collectie.antwerpen.be/impressedbyplantin/all-woodcuts) (BE) | The asset records checked state the media file is public domain, with CC0 metadata. No collection-wide policy page was found. | About 14,000 downloadable woodblocks and prints. Confirm the label on each asset. | 16th-century printers' initials, borders, headpieces and tailpieces, plus plant and animal woodblocks. | Official (asset level) |
| [Hamburger Kunsthalle](https://hamburger-kunsthalle.ikmk.net/imprint?lang=en) (DE) | Photos of works whose creator died 70 or more years ago are PDM. The page also shows a conflicting badge, so read each record. | Kupferstichkabinett online catalogue. | Old Master and ornament prints. | Official |
| [Nationalmuseum](https://www.nationalmuseum.se/en/samlingarna/bilder/om-bilder-och-upphovsr%C3%A4tt) (SE) | Public-domain images are free to use. Images where the photographer holds the rights are CC BY-SA (tier C). | Collection database, Wikimedia Commons uploads, media portal. | Prints, drawings and applied art. Mostly after 1500. | Official |

Lower fit, but open: [Yale Center for British Art](https://britishart.yale.edu/collections/using-collections/using-images) ("Free to Use" facet, British 16th–17th century), [Belvedere](https://sammlung.belvedere.at/opencontent/images) (CC0, Gothic altarpieces), [KMSKA](https://kmska.be/en/disclaimer) (public-domain photos, Flemish painting), [Slovak National Gallery / Web umenia](https://www.webumenia.sk/en/informacie) (public-domain works may be changed and used commercially), [Wien Museum](https://sammlung.wienmuseum.at/en/about-us/) (CC0, little medieval ornament). All Official.

## Libraries and manuscript portals

All tier A unless marked.

| Source | Terms | Filter and access | Best for | Checked |
|---|---|---|---|---|
| [OPenn, University of Pennsylvania](https://openn.library.upenn.edu/) (US) | Everything is public domain or a Creative Commons free cultural work. The license is set per repository: Penn, Schoenberg and the Free Library Lewis collections are PDM. A few contributors use CC BY or CC BY-SA, so keep an allow-list of repositories. | Static directory tree with TIFFs and CSV manifests. The best bulk-download route. | Free Library Lewis European leaves and cut initials, such as [Lewis E M 067:3](https://openn.library.upenn.edu/Data/0023/html/lewis_e_m_067_003.html). Penn and Schoenberg codices. Walters mirror. | Official |
| [Harvard Library](https://library.harvard.edu/policy-access-digital-reproductions-works-public-domain), including Houghton (US) | Asserts no copyright over reproductions of public-domain works on its sites. No fee. A citation is requested. Some Houghton items are restricted to Harvard users. | Harvard Digital Collections, IIIF. | Houghton medieval and Renaissance manuscripts (MS Typ, MS Lat, MS Richardson), incunabula. | Official |
| [Newberry Library](https://www.newberry.org/node/7679) (US) | Images may be used for any lawful purpose, commercial or not, without fees. Use records marked "No Copyright – United States"; skip "Copyright Not Evaluated". | Rights Status field on each record. | Manuscripts, Books of Hours, early printed books. | Official |
| [Harry Ransom Center](https://www.hrc.utexas.edu/policies/use/) (US) | Claims no copyright over digital copies of public-domain works and charges no use fees. A credit line is requested. | Digital collections. | Early printed books and some manuscripts. Holdings still to be checked. | Official |
| [Smithsonian Libraries and Archives](https://library.si.edu/copyright) (US) | CC0 items are free for any use. Items marked "usage conditions apply" follow [Restrictive labels only](#restrictive-labels-only) when the work itself is public domain. | Digital Library, Smithsonian Open Access API. | Ornament, pattern and natural-history books. | Official |
| [Library of Congress](https://www.loc.gov/legal/) (US) | LoC generally does not own rights. Rosenwald records state it knows of no copyright or other restrictions. This is a "no known restrictions" statement, not CC0. | JSON API (`?fo=json`), IIIF manifests. | Block books and incunabula: [Ars moriendi](https://www.loc.gov/item/49038878), [Nuremberg Chronicle (1493)](https://www.loc.gov/item/48040720/), [Spiegel menschlicher Behaltnis (1489)](https://www.loc.gov/item/48041988). | Official (legal page); item wording Secondary |
| [Biodiversity Heritage Library](https://about.biodiversitylibrary.org/help/copyright-and-reuse/) (global) | Titles with Copyright Status "Public domain" may be reused. In-copyright member titles are usually CC BY-NC-SA (X). | Copyright Status field per volume. API, Internet Archive downloads, Flickr copies. | 16th-century herbals and zoology: Fuchs, Brunfels, Mattioli, Gesner. | Official |
| [National Library of Medicine](https://collections.nlm.nih.gov/) (US) | Records state NLM believes the item is in the public domain. | Digital Collections. | Medical and herbal woodcuts, such as [Fasciculus medicinae (1495)](https://digirepo.nlm.nih.gov/catalog/nlm:nlmuid-9413520-bk). | Secondary |
| [Wellcome Collection](https://docs.wellcomecollection.org/collections-information/lQ0fMyP8xr8hWWJiQkfl/enquiries/images-and-copyright/copyright-images) (UK) | PDM items have no restrictions. CC BY items need the credit "Wellcome Collection". CC BY-NC and CC BY-NC-ND items follow [Restrictive labels only](#restrictive-labels-only). | License filter, catalogue API (`items.locations.license=pdm`), IIIF. | Herbals, medical and alchemical manuscripts, 16th-century woodcuts such as [this one](https://wellcomecollection.org/works/anxfnwys) (PDM). | Official |
| [Bayerische Staatsbibliothek / MDZ](https://digitale-sammlungen.de/en/faq) (DE) | PDM items may be copied, modified and distributed, including commercially, without permission. Credit the library, call number and URN. Google-partnership scans labelled "NoC-NC" follow [Restrictive labels only](#restrictive-labels-only). | Rights statement per record, IIIF. | The richest German source: Ottonian, Carolingian and Gothic illuminated manuscripts, incunabula, 16th–17th-century woodcut books. | Official |
| [Heidelberg University Library](https://www.ub.uni-heidelberg.de/helios/digi/nutzung/Welcome.html) (DE) | No fees. Each volume is labelled public domain or CC BY-SA 4.0 (tier C). Credit as "Universitätsbibliothek Heidelberg / shelfmark / page". | Label on each volume's start page, IIIF. | [Codex Manesse](https://digi.ub.uni-heidelberg.de/diglit/cpg848) (PDM confirmed): heraldry, court figures, frames. Illustrated Palatine German manuscripts. | Official |
| [Herzog August Bibliothek Wolfenbüttel](https://www.hab.de/en/?p=20276) (DE) | Images from its digital library are public domain and free to use. The old CC BY-SA notices are void, and the commercial-permission rule was dropped in November 2021. Credit requested. | Wolfenbütteler Digitale Bibliothek. | Cod. Guelf. manuscripts, 16th–17th-century printed books, emblem books. | Official |
| [Staatsbibliothek zu Berlin](https://digital.staatsbibliothek-berlin.de/nutzungsbedingungen) (DE) | Its digitisations of public-domain originals stay public domain and are marked PDM. Older records may still show outdated labels while relabelling finishes. | Digitised Collections portal. | Manuscripts, early printed books, model books. | Official |
| [e-rara](https://www.e-rara.ch/wiki/termsOfUse) (CH) | Each document is PDM (free, including commercial use) or CC BY-SA 4.0 (tier C). The source must be stated, preferably with the DOI. | License in each title view. | Swiss 15th–17th-century prints, such as Gessner's [Historiae animalium](https://www.e-rara.ch/zuz/content/titleinfo/637105) (PDM confirmed). | Official |
| [KB, Medieval Illuminated Manuscripts dataset](https://www.kb.nl/en/research-find/datasets/middeleeuwse-verluchte-handschriften-dataset) (NL) | Illustrations are PDM, metadata CC0. Credit requested. | Bulk dataset of about 3 GB. Images are only 750 px wide; TIFFs are offline, on request. | Individually cut miniatures and initials. The low resolution limits extraction. | Official |
| [Leiden University Libraries](https://www.universiteitleiden.nl/en/news/2026/01/celebrate-free-access-public-domain-day-2026) (NL) | Public-domain reproductions are usable by anyone for any purpose, with a PDM label. | Filter "use and reproduction" for Public Domain, IIIF. The portal is migrating. | Voss and BPL manuscripts, rare books. | Official |
| [National Library of Scotland](https://nls.uk/copyright) (UK) | PDM items may be reused, even commercially. CC BY items need credit. NC items follow [Restrictive labels only](#restrictive-labels-only). | Copyright statement per item, IIIF. | British printed books. Few medieval manuscripts. | Official |
| [Polona, National Library of Poland](https://bn.org.pl/aktualnosci/3395-jak-tworczo-wykorzystac-dziela-z-polona.pl.html) (PL) | Public-domain items may be used commercially without asking. | "Domena publiczna" filter, rights field per item. | Polish medieval and early modern manuscripts and prints. | Official (2018 article) |

## Attribution (B) and share-alike (C)

| Source | Tier | Terms | Best for | Checked |
|---|---|---|---|---|
| [Trinity College Dublin Library](https://www.tcd.ie/library/dris/copyright.php) (IE) | B | Out-of-copyright items are CC BY 4.0, credited to the Board of Trinity College. The Book of Kells (MS 58) is excluded, and its name is a registered trademark. | Insular manuscripts other than Kells, such as the Book of Durrow and Book of Armagh (confirm the individual records). | Official |
| [Biblioteca Nacional de España](https://www.bne.es/sites/default/files/repositorio-archivos/procedimiento_normas_reproduccion.pdf) (ES) | B | Public use is free and needs no prior authorisation. Public-domain images are CC BY 4.0, credited "Imágenes procedentes de los fondos de la Biblioteca Nacional de España". | Beatus and Mozarabic manuscripts, Romanesque and Gothic codices, Spanish incunabula, heraldic manuscripts. | Official |
| [Fragmentarium](https://fragmentarium.ms/pages/terms) (CH) | A/B/C | License set per image. CC BY images may be used commercially, crediting the holding library, shelfmark and Fragmentarium ID. NC images follow [Restrictive labels only](#restrictive-labels-only), except Swiss-held ones ([Excluded](#excluded)). | Manuscript fragments with initials and pen flourishes. | Official |
| [Folger Shakespeare Library](https://folgerpedia.folger.edu/Luna_digital_image_collection) (US) | C | Out-of-copyright images are CC BY-SA 4.0. | Early modern English woodcut initials and title borders. Mostly duplicated by tier A sources. | Official |
| [Städel Museum](https://sammlung.staedelmuseum.de/) (DE) | C | Public-domain works are CC BY-SA 4.0 with a Städel credit line. | German and Netherlandish prints (Dürer, Schongauer). | Secondary |

Heidelberg, e-rara, Staatliche Museen zu Berlin and Nationalmuseum also have some CC BY-SA items. The same rules apply to them.

## Confirm before use

These look usable, but the terms were secondary, ambiguous or capped.

| Source | What we know | What to confirm |
|---|---|---|
| [Albertina](https://www.albertina.at/en/research/reproduction/) (AT) | About 150,000 images were marked PDM in 2022, with Dürer and many 12th–16th-century prints and drawings. Free downloads are capped at 1200 px; larger files go through the paid reproduction service. | The label on each record, and whether 1200 px is enough. |
| [Minneapolis Institute of Art](https://collections.artsmia.org/info/open-access) (US) | Works marked PDM are reportedly reusable even commercially. | The official page, which loaded empty. |
| [NYPL Digital Collections](https://digitalcollections.nypl.org/) (US) | Its 2016 public-domain release allows reuse without permission. Spencer Collection manuscripts and illustrated books. | The "free to use" flag on each item. |
| [LACMA](https://www.lacma.org/about/contact-us/terms-use) (US) | Public-domain images are provided "for use without restriction". Islamic art. | The page does not say "commercial" or "modify" explicitly. |
| [Princeton University Art Museum](https://artmuseum.princeton.edu/collections/image-use-and-access) (US) | Public-domain images may be downloaded and used without approval. | Modification and redistribution are not mentioned. |
| [manuscripta.se](https://www.manuscripta.se/) (SE) | About 1,600 digitised Swedish medieval manuscripts, reported as CC0. | The National Library of Sweden's page was blocked. Check the record license. |
| [British Library](https://www.bl.uk/research/digitised-manuscripts) (UK) | Some manuscript images were released as PDM; others were not. The service is still partly limited after the 2023 cyberattack. | The rights label on each item. [Flickr Commons](https://www.flickr.com/photos/britishlibrary/) images come from 17th–19th-century books under the weaker "no known copyright restrictions" label, mostly outside our period. |
| National Library of Wales | Rights labelled per item: PDM, copyright, NC and others. | PDM items are simplest; NC items follow [Restrictive labels only](#restrictive-labels-only). |
| [e-codices](https://e-codices.unifr.ch/en/about/terms) (CH) | PDM manuscripts are free, including commercially. Most are CC BY-NC and St. Gallen is reportedly NC-ND; both are [Excluded](#excluded). | The license on each manuscript. |
| Forschungsbibliothek Gotha, UB Leipzig, WLB Stuttgart, SLUB Dresden (DE) | Many records show PDM in the Deutsche Digitale Bibliothek. Gotha also has some CC BY-SA items. | Each library's own terms and the record label. |
| [Huntington Library](https://www.huntington.org/library/library-rights-and-permissions) (US) | Requires no permission or fee to publish public-domain material. | Whether the image downloads carry separate non-commercial terms. |
| Yale Beinecke Library (US) | Yale's policy frees public-domain images, but Beinecke pages mention research and non-commercial use only. | Ask Yale which terms apply. |
| Livrustkammaren/Skokloster/Hallwyl, Finnish National Gallery/Finna, DigitaltMuseum, Kunstmuseum Basel, State Library Victoria, Boston Public Library | Older or secondary reports of open licenses, set per item. | Current official terms. |
| Biblioteca de Catalunya / Memòria Digital de Catalunya (ES) | A 2014 source reported no commercial use and no derivatives. | Current terms per collection. |

## Discovery tools and aggregators

These help find artwork. Rights still come from the holding institution, so download from the holder.

- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Commons:Reuse_of_PD-Art_photographs): the largest index, including [Ornament prints](https://commons.wikimedia.org/wiki/Category:Ornament_prints) and [Illuminated manuscripts](https://commons.wikimedia.org/wiki/Category:Illuminated_manuscripts) (with drolleries and initials). The {{PD-Art}} tag is a US-law claim made by the uploader. Trace each file to its holder and use the holder's terms.
- [Europeana](https://www.europeana.eu/en/rights/terms-of-use): metadata is CC0; each object carries its provider's rights statement. Filter to PDM, CC0 and CC BY.
- [Deutsche Digitale Bibliothek](https://www.deutsche-digitale-bibliothek.de/): German libraries and museums, with a rights facet per record.
- [Digital Public Library of America](https://dp.la/): US aggregator. "No Copyright – United States" covers the US only.
- [Internet Archive](https://archive.org/): many pattern books and early printed books, such as a Clark Art Institute scan of [Vinciolo's pattern book](https://archive.org/details/lessingvliersetn00vinc). IA grants no rights, and some scans carry the scanning partner's terms. Prefer the holder's own copy.
- [Flickr Commons](https://www.flickr.com/commons/usage/): "no known copyright restrictions" is a weak label, not a license.
- [The Public Domain Review](https://publicdomainreview.org/reusing-material/): curated collections and a useful sources index. It claims no rights in the historical images; its own essays are CC BY-SA.
- [Biblissima+](https://iiif.biblissima.fr/collections/), [Digital Scriptorium](https://digital-scriptorium.org/) and [Fragmentarium](https://fragmentarium.ms/): IIIF manuscript discovery. Rights stay with each contributing library.
- [Index of Medieval Art](https://theindex.princeton.edu/), [bestiary.ca](https://www.bestiary.ca/), [Discarding Images](https://discardingimages.tumblr.com/) and [Emblematica Online](http://emblematica.library.illinois.edu/): use them to identify motifs and shelfmarks only. Their own images are not cleared.

**Avoid as image sources:** rawpixel (images are "enhanced"; some items are editorial-only or premium) and Old Book Illustrations (mostly 19th-century and restored).

## Fallback: 19th-century facsimiles

Chromolithograph and engraved copies of historical ornament are now public domain. Examples are Henry Shaw's *Illuminated Ornaments* (1833), Noel Humphreys' *Illuminated Books of the Middle Ages* (1849), Owen Jones's *Grammar of Ornament* (1856), Racinet's *L'Ornement polychrome* (1869–1887) and the plates of *Der Ornamentstich der deutschen Frührenaissance* (1888) on Commons. They are redrawn interpretations, not period originals. Use one only when no open scan of the original exists. Label it as a 19th-century facsimile, and record the original manuscript or print it copies. Never use 19th-century revival designs.

## Restrictive labels only

These sources label their scans of public-domain works non-commercial (NC), no-derivatives (ND) or "permission required". They have no legal basis beyond copyright, and a faithful scan carries none (see [Legal notes](#legal-notes)). Their flat scans are therefore usable under [Source licenses: what to do](#source-licenses-what-to-do); their original photographs (3D objects) are not. Check the download step at import time: if it requires accepting terms, set the source aside as that section says.

| Source | Label or terms | Notes | Best for |
|---|---|---|---|
| [British Museum](https://www.britishmuseum.org/terms-use/copyright-and-permissions) (UK) | CC BY-NC-SA; commercial use through BM Images. | The download button has no agreement step (checked). | Prints and drawings, including ornament designs. |
| [Digital Bodleian](https://digital.bodleian.ox.ac.uk/terms/) (UK) | CC BY-NC. The download dialog states, next to the buttons, that downloading means agreeing to its terms, which forbid commercial use (checked). | Never use the download dialog. Take images from the IIIF image service (the viewer's "and other viewers" option), which has no agreement step. If Bodleian ever objects, remove its images. | Bodleian manuscripts, including bestiaries and Books of Hours. |
| Cambridge Digital Library, Parker Library, Fitzwilliam Museum (UK) | NC labels. | Download step not checked yet. | English and continental manuscripts. |
| V&A, Ashmolean (UK) | Non-commercial terms. | Free files are capped at about 768 px (V&A) and 1000 px (Ashmolean), so they are rarely useful. | Decorative arts, prints. |
| Germanisches Nationalmuseum, Herzog Anton Ulrich-Museum (Virtuelles Kupferstichkabinett), ULB Düsseldorf manuscripts (DE) | NC or NC-ND labels. | § 68 UrhG explicitly denies rights in such reproductions. | German prints, ornament prints and manuscripts. |
| MAK Vienna (AT), Royal Danish Library (DK), KBR Brussels (BE) | NC-ND or research-only labels. | EU Article 14 applies. | Ornament prints (MAK), manuscripts. |
| Glasgow University Emblem Website (UK) | No reproduction without permission. | Some images belong to other libraries; prefer the owning library's copy. | Emblem books. |
| Book of Kells, TCD MS 58 (IE) | Excluded from Trinity's open license; permission requested. | Don't use "Book of Kells" as a product or brand name (registered trademark); naming it in provenance is fine. | Insular interlace. |
| Morgan Library, Harvard Art Museums, Philadelphia Museum of Art, Nelson-Atkins, Duke Rubenstein, Goodspeed (Chicago), Roman de la Rose Digital Library, New York Academy of Medicine (US) | Personal, educational or non-commercial terms. | US law (*Bridgeman*). Morgan offers only low-resolution files. | Manuscripts, prints, early medical woodcuts. |

## Excluded

These have a legal basis beyond copyright, an unclear legal position, terms that must be accepted, or no usable files.

| Source | Reason |
|---|---|
| BnF Gallica and Mandragore, Louvre and Musée de Cluny (RMN-GP), Numelyo (Lyon), BVH Tours / BaTyR | French public bodies or their partner libraries. French public-sector reuse law (CRPA) gives their reuse conditions legal force, and CADA can fine breaches (art. L326-1). Gallica charges for commercial reuse. |
| Prado, MNAC, Museo Lázaro Galdiano | Spanish public bodies that bar commercial reuse without a license. Spanish public-sector reuse law ([Ley 37/2007](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19814)) covers museums and libraries, and art. 11 fines reuse without a required license. |
| Italian state museums and libraries (Uffizi, Laurenziana, Estense, Internet Culturale and others) | The Cultural Heritage Code (arts. 107–108, fee decrees DM 161/2023 and DM 108/2024) charges for commercial reproduction even of public-domain works. |
| Vatican Library | Vatican City law is outside EU and US rules and unclear; the terms bar modification and commercial use. |
| e-codices manuscripts labelled CC BY-NC, including St. Gallen | Swiss law (Art. 2(3bis) URG, 2020) may protect photographic reproductions even without originality. Its e-codices PDM items remain usable. |
| vHMML | Images require an account and agreement to terms; partners keep their rights. |
| Wallace Collection, National Museums Scotland | No free downloads. |
| National Gallery of Victoria, Art Gallery of New South Wales, Royal Ontario Museum | Australian and Canadian law on faithful photographs is unclear; files are watermarked or restricted; little relevant material. |

## Legal notes

- **Faithful reproductions.** A plain photo or scan of a public-domain two-dimensional work generally carries no new copyright.
  - US: *Bridgeman v. Corel* (1999).
  - EU: Article 14 of Directive 2019/790. Spain implemented it in [Real Decreto-ley 24/2021, art. 72](https://www.boe.es/buscar/act.php?id=BOE-A-2021-17910) and Germany in [§ 68 UrhG](https://www.gesetze-im-internet.de/urhg/__68.html).
  - UK: [IPO guidance](https://www.gov.uk/government/publications/copyright-notice-digital-images-photographs-and-the-internet/copyright-notice-digital-images-photographs-and-the-internet) and the Court of Appeal's originality test in *THJ v Sheridan* (2023), with no statute. We use UK sources on that basis. If a UK holder ever objects, remove that holder's images.
  - The Spanish article has no transitional clause, and the Commons PD-Art page still warns about Spain and the Nordic countries. An explicit CC0 or PDM statement from the holder therefore remains the safest basis.
- **Non-copyright restrictions.**
  - Italy's Cultural Heritage Code charges for commercial reproduction of state-held heritage. A German appeal court held in 2025 that it does not apply outside Italy, but Italian courts enforce it, so exclude that material.
  - Public-sector reuse laws in France (CRPA, art. L326-1) and Spain (Ley 37/2007, art. 11) give public bodies' reuse conditions legal force, with fines. Exclude French and Spanish public sources that bar commercial reuse. Where the only condition is citing the source (such as Biblioteca Nacional de España), `provenance` already does that.
  - Terms we actively accept when downloading bind us.
  - CC0 and PDM do not cover trademarks, so never use institution names or logos, or imply endorsement.
- **License duties.**
  - CC0 and PDM require nothing.
  - A CC license binds only where the holder has rights in what we use: section 1 and section 8(a) of the [CC 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en), and the [CC FAQ](https://creativecommons.org/faq/). A faithful scan of a public-domain work gives the holder no rights, so its CC label imposes nothing on us.
  - Where a CC license does apply, attribution may be given "in any reasonable manner based on the medium, means, and context" (section 3(a)(2)). No placement or visibility is prescribed, and the CC FAQ accepts a link to where the information can be found.
  - If a licensor ever objects, CC 4.0 restores our rights automatically when we fix the problem within 30 days of discovering it (section 6(b)).
  - Our edits do not create a clean new right that cures a doubtful source.

## Source licenses: what to do

The source's license normally requires nothing beyond the provenance we already record. `provenance` (holder, title, shelfmark, record link, rights label and link, extraction method) already reaches the package catalogs, the generated modules and the gallery dialog, and the README links to the gallery. Do not add license fields, visible notices, metadata embedded in image files, or extra data loaded at runtime.

| Case | Action |
|---|---|
| Flat scan or photo of a public-domain manuscript page, print, drawing or printed book: almost every import | Use it whatever its label (CC0, PDM, CC BY, CC BY-SA, or NC/ND as in [Restrictive labels only](#restrictive-labels-only)), unless the source is in [Excluded](#excluded). Fill `provenance` as usual, recording the label as given in `image_rights`. Nothing else. |
| Original photograph under a CC license: a photo of a 3D object (metalwork, ivory, carved woodblock, binding, sculpture) or a photo with creative choices | CC BY: use it, with `image_rights` naming the license and `rights_url` linking to the license or to a page that shows it. Nothing else. CC BY-SA, NC or ND: do not use. |
| Terms of use that must be actively accepted before download (account sign-up, click-through, checkbox or button) | Do not accept them, and set that source aside. Finish all other work first, then list every set-aside source for the maintainer in one message, with its terms quoted, and let them decide. Terms only posted on the site, with no active acceptance, need no action. |

## Checklist for each import

1. Confirm that the artwork is a period original (or a labelled facsimile) and is in the public domain.
2. Read the rights label on the item record today and follow [Source licenses: what to do](#source-licenses-what-to-do).
3. Download from the holding institution, not from an aggregator or "enhanced" copy, at the best resolution offered.
4. Reject images with watermarks, logos or copyright notices burned into the image.
5. Record the holder, shelfmark or accession number, record URL, download URL, rights statement URL and wording, license, retrieval date and SHA-256. Use the existing fields in [source-candidates.json](source-candidates.json) and `historical-additions.json`.
6. Keep the original download byte-for-byte, as the repository guidance requires for source masters.
