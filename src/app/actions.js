"use server";

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

// --- KİTAP (ISBN) İÇİN (YENİ ÇİFT MOTORLU SİSTEM) ---
export async function fetchBookData(isbn) {
  try {
    // 1. Önce Google Books'a sor
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const googleData = await googleRes.json();

    if (googleData.totalItems > 0) {
      const info = googleData.items[0].volumeInfo;
      return {
        success: true,
        source: 'google',
        data: {
          title: info.title,
          authors: info.authors, // Dizi döner
          publisher: info.publisher,
          year: info.publishedDate ? info.publishedDate.substring(0, 4) : ""
        }
      };
    }

    // 2. Google bulamazsa Open Library'ye sor (Yedek Güç)
    const openLibRes = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}`);
    const openLibData = await openLibRes.json();

    if (openLibData.docs && openLibData.docs.length > 0) {
      const doc = openLibData.docs[0];
      return {
        success: true,
        source: 'openlibrary',
        data: {
          title: doc.title,
          authors: doc.author_name, // Dizi döner
          publisher: doc.publisher ? doc.publisher[0] : "",
          year: doc.publish_year ? doc.publish_year[0] : ""
        }
      };
    }

    return { success: false, error: "Kitap iki veritabanında da bulunamadı." };

  } catch (error) {
    return { success: false, error: error.message };
  }
}"use server";

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

// --- KİTAP (ISBN) İÇİN (YENİ ÇİFT MOTORLU SİSTEM) ---
export async function fetchBookData(isbn) {
  try {
    // 1. Önce Google Books'a sor
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const googleData = await googleRes.json();

    if (googleData.totalItems > 0) {
      const info = googleData.items[0].volumeInfo;
      return {
        success: true,
        source: 'google',
        data: {
          title: info.title,
          authors: info.authors, // Dizi döner
          publisher: info.publisher,
          year: info.publishedDate ? info.publishedDate.substring(0, 4) : ""
        }
      };
    }

    // 2. Google bulamazsa Open Library'ye sor (Yedek Güç)
    const openLibRes = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}`);
    const openLibData = await openLibRes.json();

    if (openLibData.docs && openLibData.docs.length > 0) {
      const doc = openLibData.docs[0];
      return {
        success: true,
        source: 'openlibrary',
        data: {
          title: doc.title,
          authors: doc.author_name, // Dizi döner
          publisher: doc.publisher ? doc.publisher[0] : "",
          year: doc.publish_year ? doc.publish_year[0] : ""
        }
      };
    }

    return { success: false, error: "Kitap iki veritabanında da bulunamadı." };

  } catch (error) {
    return { success: false, error: error.message };
  }
}"use server";

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

// --- KİTAP (ISBN) İÇİN (YENİ ÇİFT MOTORLU SİSTEM) ---
export async function fetchBookData(isbn) {
  try {
    // 1. Önce Google Books'a sor
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const googleData = await googleRes.json();

    if (googleData.totalItems > 0) {
      const info = googleData.items[0].volumeInfo;
      return {
        success: true,
        source: 'google',
        data: {
          title: info.title,
          authors: info.authors, // Dizi döner
          publisher: info.publisher,
          year: info.publishedDate ? info.publishedDate.substring(0, 4) : ""
        }
      };
    }

    // 2. Google bulamazsa Open Library'ye sor (Yedek Güç)
    const openLibRes = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}`);
    const openLibData = await openLibRes.json();

    if (openLibData.docs && openLibData.docs.length > 0) {
      const doc = openLibData.docs[0];
      return {
        success: true,
        source: 'openlibrary',
        data: {
          title: doc.title,
          authors: doc.author_name, // Dizi döner
          publisher: doc.publisher ? doc.publisher[0] : "",
          year: doc.publish_year ? doc.publish_year[0] : ""
        }
      };
    }

    return { success: false, error: "Kitap iki veritabanında da bulunamadı." };

  } catch (error) {
    return { success: false, error: error.message };
  }
}