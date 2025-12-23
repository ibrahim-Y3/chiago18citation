"use client";
import { useState } from "react";
import { formatChicago18 } from "@/utils/chicagoFormatter";

export default function Home() {
  const [inputValue, setInputValue] = useState(""); // Hem ISBN hem DOI buraya yazılır
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form Verileri
  const [formData, setFormData] = useState({
    type: "book", // 'book' veya 'article'
    authors: "",
    title: "",
    publisher: "",
    year: "",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    doi: ""
  });

  // --- AKILLI METİN DÜZELTİCİLER ---

  // 1. Başlıkları ve İsimleri Düzeltir (Title Case)
  const cleanText = (text) => {
    if (!text) return "";
    let clean = text.trim().replace(/\.$/, ""); // Sondaki noktayı sil
    
    return clean.split(" ")
      .map(word => {
        const lower = word.toLocaleLowerCase('tr-TR');
        // Bağlaçları küçük bırak
        if (['ve', 'ile', 'de', 'da', 'and', 'of', 'the', 'in', 'for', 'on'].includes(lower)) {
          return lower; 
        }
        return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
      })
      .join(" ");
  };

  // 2. Yazar Listesini Düzeltir
  const cleanAuthors = (authorsData) => {
    if (!authorsData) return "";

    // Google Books'tan gelen veri (Array of Strings)
    if (Array.isArray(authorsData) && typeof authorsData[0] === 'string') {
      return authorsData.map(a => cleanText(a)).join(", ");
    }

    // Crossref (DOI)'den gelen veri (Array of Objects)
    if (Array.isArray(authorsData) && typeof authorsData[0] === 'object') {
      return authorsData.map(a => {
        const given = cleanText(a.given || "");
        const family = cleanText(a.family || "");
        return `${given} ${family}`;
      }).join(", ");
    }

    // Tekil String geldiyse
    return cleanText(authorsData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ISBN ARAMA (Google Books) ---
  const searchISBN = async () => {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${inputValue}`);
      const data = await res.json();
      if (data.totalItems > 0) {
        const info = data.items[0].volumeInfo;
        setFormData({
          ...formData,
          type: "book",
          title: cleanText(info.title || ""),
          authors: cleanAuthors(info.authors),
          publisher: cleanText(info.publisher || ""),
          year: info.publishedDate ? info.publishedDate.substring(0, 4) : "",
        });
        setResult(null);
      } else {
        alert("Kitap bulunamadı!");
      }
    } catch (err) { alert("Hata: " + err.message); }
  };

  // --- DOI ARAMA (CrossRef - GÜNCELLENMİŞ VERSİYON) ---
  const searchDOI = async () => {
    try {
      // 1. DOI Temizliği
      const cleanDoi = inputValue.replace("https://doi.org/", "").trim();
      const encodedDoi = encodeURIComponent(cleanDoi);

      // 2. API İsteği (Vercel hatasını çözen kısım: mailto ekledik)
      const res = await fetch(`https://api.crossref.org/works/${encodedDoi}?mailto=academic@example.com`);
      
      if (!res.ok) throw new Error("Makale bulunamadı");
      
      const data = await res.json();
      const item = data.message;

      setFormData({
        ...formData,
        type: "article",
        title: cleanText(item.title ? item.title[0] : ""),
        authors: cleanAuthors(item.author),
        journal: cleanText(item['container-title'] ? item['container-title'][0] : ""),
        volume: item.volume || "",
        issue: item.issue || "",
        pages: item.page || "",
        year: item.created ? item.created['date-parts'][0][0] : "",
        doi: cleanDoi
      });
      setResult(null);

    } catch (err) { 
      console.error(err);
      alert("DOI bulunamadı veya hatalı giriş yapıldı."); 
    }
  };

  // Hangi butona basılacağını seçen fonksiyon
  const handleSearch = async () => {
    if (!inputValue) return alert("Lütfen kod giriniz.");
    setLoading(true);
    if (formData.type === 'book') {
      await searchISBN();
    } else {
      await searchDOI();
    }
    setLoading(false);
  };

  const handleGenerate = () => {
    const output = formatChicago18(formData);
    setResult(output);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <h1 className="text-3xl font-bold text-center mb-2">Chicago 18. Edisyon</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">ISBN ve DOI Destekli Atıf Aracı</p>

        {/* --- TÜR SEÇİMİ (TABLAR) --- */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button 
            onClick={() => { setFormData({...formData, type: "book"}); setInputValue(""); setResult(null); }}
            className={`flex-1 py-3 rounded-md text-sm font-bold transition ${formData.type === 'book' ? 'bg-white shadow-md text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            KİTAP (ISBN)
          </button>
          <button 
            onClick={() => { setFormData({...formData, type: "article"}); setInputValue(""); setResult(null); }}
            className={`flex-1 py-3 rounded-md text-sm font-bold transition ${formData.type === 'article' ? 'bg-white shadow-md text-orange-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            MAKALE (DOI)
          </button>
        </div>

        {/* --- ARAMA KUTUSU (DİNAMİK) --- */}
        <div className={`p-6 rounded-xl border mb-8 transition-colors ${formData.type === 'book' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
          <label className={`block text-xs font-bold uppercase mb-2 ${formData.type === 'book' ? 'text-blue-800' : 'text-orange-800'}`}>
            {formData.type === 'book' ? 'ISBN GİRİNİZ' : 'DOI GİRİNİZ'}
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={formData.type === 'book' ? "Örn: 9789750719387" : "Örn: 10.1080/00263206.2024.123456"} 
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
              style={{ focusRingColor: formData.type === 'book' ? '#3b82f6' : '#f97316' }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-bold text-white transition disabled:opacity-50 ${formData.type === 'book' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {loading ? "..." : "Getir"}
            </button>
          </div>
        </div>

        {/* --- FORM ALANLARI --- */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Yazar</label>
              <input name="authors" value={formData.authors} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Birden fazla yazar için virgül kullanın: Ad Soyad, Ad Soyad</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                {formData.type === 'book' ? 'Kitap Başlığı' : 'Makale Başlığı'}
              </label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
            </div>
          </div>

          {/* KİTAP ALANLARI */}
          {formData.type === 'book' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Yayınevi</label>
                <input name="publisher" value={formData.publisher} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Yıl</label>
                <input name="year" value={formData.year} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
              </div>
            </div>
          )}

          {/* MAKALE ALANLARI */}
          {formData.type === 'article' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dergi Adı (Journal)</label>
                <input name="journal" value={formData.journal} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Cilt (Vol)</label>
                  <input name="volume" value={formData.volume} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sayı (No)</label>
                  <input name="issue" value={formData.issue} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Yıl</label>
                  <input name="year" value={formData.year} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sayfa Aralığı</label>
                  <input name="pages" value={formData.pages} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">DOI</label>
                  <input name="doi" value={formData.doi} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:border-black outline-none transition" />
                </div>
              </div>
            </>
          )}

          <button 
            onClick={handleGenerate}
            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 active:scale-95 transition mt-6 shadow-lg"
          >
            ATIF OLUŞTUR
          </button>
        </div>

        {/* --- SONUÇLAR --- */}
        {result && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Sonuçlar</h3>
            
            <div className="mb-6 group relative">
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase tracking-wider">Bibliyografya</span>
              <div 
                className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: result.bibliography }}
              />
            </div>

            <div className="group relative">
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 uppercase tracking-wider">Dipnot (Footnote)</span>
              <div 
                className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: result.note }}
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}