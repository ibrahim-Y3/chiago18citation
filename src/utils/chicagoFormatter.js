export function formatChicago18(data) {
  const { type, authors, title, publisher, year, journal, volume, issue, pages, doi } = data;

  // --- YAZAR FORMATLAYICI (GELİŞMİŞ) ---
  const formatAuthors = (isBibliography) => {
    if (!authors || authors.trim() === "") return "";
    
    // Virgülle ayrılmış stringi listeye çevir
    const list = authors.split(",").map(a => a.trim());

    // "Ad Soyad" -> "Soyad, Ad" çevirici
    const invertName = (fullName) => {
      const parts = fullName.split(" ");
      if (parts.length === 1) return fullName;
      const last = parts.pop();
      const first = parts.join(" ");
      return `${last}, ${first}`;
    };

    if (isBibliography) {
      // --- BİBLİYOGRAFYA ---
      if (list.length === 1) return `${invertName(list[0])}.`;
      if (list.length === 2) return `${invertName(list[0])} ve ${list[1]}.`;
      
      // 3 ve daha fazla yazar: Sadece ilki ters, sonuncudan önce "ve"
      if (list.length >= 3) {
        let output = invertName(list[0]);
        for (let i = 1; i < list.length - 1; i++) {
          output += `, ${list[i]}`;
        }
        output += ` ve ${list[list.length - 1]}.`;
        return output;
      }
    } else {
      // --- DİPNOT ---
      // 4 veya daha fazla yazar varsa "vd." kullanılır
      if (list.length >= 4) return `${list[0]} vd.,`;
      
      if (list.length === 2) return `${list[0]} ve ${list[1]},`;
      if (list.length === 3) return `${list[0]}, ${list[1]} ve ${list[2]},`;
      return `${list[0]},`;
    }
  };

  let bibliography = "";
  let note = "";

  // --- KİTAP FORMATI ---
  if (type === "book") {
    const authorBib = formatAuthors(true);
    const authorNote = formatAuthors(false);
    const pubString = publisher ? `${publisher}, ` : "";
    
    bibliography = `
      <div style="padding-left: 30px; text-indent: -30px;">
        ${authorBib} <em>${title}</em>. ${pubString}${year}.
      </div>
    `;

    note = `
      1. ${authorNote} <em>${title}</em> (${pubString}${year}), [SAYFA].
    `;

  } else if (type === "article") {
    // --- MAKALE FORMATI ---
    const authorBib = formatAuthors(true);
    const authorNote = formatAuthors(false);
    
    let volIssue = "";
    if (volume) volIssue += volume;
    if (issue) volIssue += `, no. ${issue}`;

    const doiLink = doi ? (doi.startsWith("http") ? doi : `https://doi.org/${doi}`) : "";

    bibliography = `
      <div style="padding-left: 30px; text-indent: -30px;">
        ${authorBib} "${title}." <em>${journal}</em> ${volIssue} (${year}): ${pages}. ${doiLink}.
      </div>
    `;

    note = `
      1. ${authorNote} "${title}," <em>${journal}</em> ${volIssue} (${year}): [SAYFA], ${doiLink}.
    `;
  }

  return { bibliography, note };
}