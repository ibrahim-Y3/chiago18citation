"use server";

// --- YARDIMCI: Crossref Yazar Temizleyici ---
function formatCrossrefAuthors(authorsList) {
  if (!authorsList || !Array.isArray(authorsList)) return "";
  return authorsList.map(a => {
    const given = a.given || "";
    const family = a.family || "";
    return `${given} ${family}`.trim();
  }).join(", ");
}

// --- MAKALE (DOI) İÇİN ---
export async function fetchDoiData(doi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${doi}?mailto=academic@example.com`, { cache: 'no-store' });
    if (!res.ok) return { success: false, error: "Makale bulunamadı" };
    const data = await res.json();
    return { success: true, data: data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// --- KİTAP (ISBN) İÇİN (3 MOTORLU SİSTEM: Google -> OpenLib -> Crossref) ---
export async function fetchBookData(isbn) {
  try {
    // 1. MOTOR: Google Books
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const googleData = await googleRes.json();

    if (googleData.totalItems > 0) {
      const info = googleData.items[0].volumeInfo;
      return {
        success: true,
        source: 'google',
        data: {
          title: info.title,
          authors: info.authors,
          publisher: info.publisher,
          year: info.publishedDate ? info.publishedDate.substring(0, 4) : ""
        }
      };
    }

    // 2. MOTOR: Open Library
    const openLibRes = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}`);
    const openLibData = await openLibRes.json();

    if (openLibData.docs && openLibData.docs.length > 0) {
      const doc = openLibData.docs[0];
      return {
        success: true,
        source: 'openlibrary',
        data: {
          title: doc.title,
          authors: doc.author_name,
          publisher: doc.publisher ? doc.publisher[0] : "",
          year: doc.publish_year ? doc.publish_year[0] : ""
        }
      };
    }

    // 3. MOTOR: Crossref (Akademik Kitaplar İçin Son Çare)
    // ISBN'i bir sorgu olarak atıyoruz ve tipi 'book' (kitap) olsun diyoruz.
    const crossRes = await fetch(`https://api.crossref.org/works?query=${isbn}&filter=type:book&mailto=academic@example.com`);
    const crossData = await crossRes.json();

    if (crossData.message && crossData.message.items.length > 0) {
      const item = crossData.message.items[0];
      
      // Tarih verisini bulmaya çalış (Yayın yılı veya Oluşturulma yılı)
      let year = "";
      if (item['published-print']) {
        year = item['published-print']['date-parts'][0][0];
      } else if (item.created) {
        year = item.created['date-parts'][0][0];
      }

      return {
        success: true,
        source: 'crossref',
        data: {
          title: item.title ? item.title[0] : "",
          authors: formatCrossrefAuthors(item.author),
          publisher: item.publisher || "",
          year: String(year)
        }
      };
    }

    return { success: false, error: "Kitap hiçbir veritabanında bulunamadı." };

  } catch (error) {
    return { success: false, error: error.message };
  }
}