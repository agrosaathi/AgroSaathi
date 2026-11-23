var T = {
  en: {},
  hi: {
    n_home: "होम",
    n_dash: "डैशबोर्ड",
    n_dis: "रोग पहचान",
    n_ai: "AI सहायक",
    n_mkt: "बाज़ार",
    n_wx: "मौसम और पूर्वानुमान",
    n_crop: "फसल सुझाव",
    n_prof: "मेरी प्रोफ़ाइल",
    n_out: "साइन आउट",
    pill: "Gemini AI द्वारा संचालित • किसानों के लिए 100% मुफ़्त",
    h1: "भरपूर फसल के लिए स्मार्ट खेती",
    sub: "AI से फसल रोग तुरंत पहचानें, मौसम सलाह, फसल सुझाव पाएं और किसान बाज़ार में सीधे व्यापार करें।",
    scan: "फसल रोग स्कैन करें",
    ask: "AI साथी से पूछें",
    s1: "रोग स्कैन सटीकता",
    s2: "सत्यापित किसान",
    s3: "बिचौलिया शुल्क",
    live: "अभी लाइव स्कैन करें",
    f_h: "आधुनिक खेती के लिए सब कुछ",
    f_p: "मिट्टी, रोग निदान, मौसम सलाह और मंडी व्यापार के लिए एकीकृत AI टूल।",
    how_h: "एग्रोसाथी कैसे काम करता है",
    cta_h: "AI से अपनी खेती की उपज बढ़ाने के लिए तैयार?",
  },
  gu: {
    n_home: "હોમ",
    n_dash: "ડેશબોર્ડ",
    n_dis: "રોગ ઓળખ",
    n_ai: "AI સહાયક",
    n_mkt: "બજાર",
    n_wx: "હવામાન અને આગાહી",
    n_crop: "પાક ભલામણ",
    n_prof: "મારી પ્રોફાઇલ",
    n_out: "સાઇન આઉટ",
    pill: "Gemini AI દ્વારા સંચાલિત • ખેડૂતો માટે 100% મફત",
    h1: "મબલખ પાક માટે સ્માર્ટ ખેતી",
    sub: "AI વડે પાકના રોગ તરત ઓળખો, હવામાન સલાહ, પાક ભલામણ મેળવો અને ખેડૂત બજારમાં સીધો વેપાર કરો.",
    scan: "પાક રોગ સ્કેન કરો",
    ask: "AI સાથીને પૂછો",
    s1: "રોગ સ્કેન ચોકસાઈ",
    s2: "ચકાસાયેલ ખેડૂતો",
    s3: "વચેટિયા ફી",
    live: "હમણાં લાઇવ સ્કેન કરો",
    f_h: "આધુનિક ખેતી માટે બધું જ",
    f_p: "જમીન, રોગ નિદાન, હવામાન સલાહ અને મંડી વેપાર માટે સંકલિત AI સાધનો.",
    how_h: "એગ્રોસાથી કેવી રીતે કામ કરે છે",
    cta_h: "AI સાથે તમારી ખેતીની ઉપજ વધારવા તૈયાર?",
  },
};
var els = [].slice.call(document.querySelectorAll("[data-i]"));
els.forEach(function (e) {
  T.en[e.dataset.i] = e.innerHTML;
});
function setLang(l) {
  els.forEach(function (e) {
    var v = T[l][e.dataset.i];
    if (v) e.textContent = v;
  });
  document.documentElement.lang = l;
  [].forEach.call(document.querySelectorAll(".langs button"), function (b) {
    b.classList.toggle("on", b.dataset.l === l);
  });
  try {
    localStorage.setItem("lang", l);
  } catch (x) {}
}
document.querySelector(".langs").addEventListener("click", function (e) {
  if (e.target.dataset.l) setLang(e.target.dataset.l);
});
var m = document.getElementById("menu"),
  bg = document.getElementById("burger");
bg.onclick = function () {
  var o = m.classList.toggle("open");
  bg.textContent = o ? "✕" : "☰";
  bg.setAttribute("aria-expanded", o);
};
m.addEventListener("click", function (e) {
  if (e.target.closest("a")) {
    m.classList.remove("open");
    bg.textContent = "☰";
  }
});
var th = document.getElementById("theme"),
  r = document.documentElement;
function setTheme(t) {
  r.dataset.theme = t;
  th.textContent = t === "dark" ? "☀" : "☾";
}
th.onclick = function () {
  var t = r.dataset.theme === "dark" ? "light" : "dark";
  setTheme(t);
  try {
    localStorage.setItem("theme", t);
  } catch (x) {}
};
try {
  setTheme(localStorage.getItem("theme") || "dark");
  var sl = localStorage.getItem("lang");
  if (sl && sl !== "en") setLang(sl);
} catch (x) {
  setTheme("dark");
}

/* ---------- Disease scan ---------- */
(function () {
  var modal = document.getElementById("scanModal"),
    file = document.getElementById("scanFile"),
    prev = document.getElementById("scanPreview"),
    txt = document.getElementById("dropText"),
    go = document.getElementById("scanGo"),
    st = document.getElementById("scanStatus"),
    out = document.getElementById("scanResult"),
    b64 = null,
    mime = "image/jpeg";
  var API = "/.netlify/functions/scan";

  function open() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("menu").classList.remove("open");
  }
  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-scan]");
    if (t) {
      e.preventDefault();
      open();
    }
  });
  document.getElementById("scanClose").onclick = close;
  modal.addEventListener("click", function (e) {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });

  // resize photo in the browser so upload is small and fast
  file.addEventListener("change", function () {
    var f = file.files[0];
    if (!f) return;
    out.hidden = true;
    st.textContent = "";
    st.className = "status";
    var img = new Image(),
      url = URL.createObjectURL(f);
    img.onload = function () {
      var max = 1024,
        s = Math.min(1, max / Math.max(img.width, img.height)),
        c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      var data = c.toDataURL("image/jpeg", 0.85);
      b64 = data.split(",")[1];
      mime = "image/jpeg";
      prev.src = data;
      prev.hidden = false;
      txt.hidden = true;
      go.disabled = false;
      URL.revokeObjectURL(url);
    };
    img.onerror = function () {
      st.textContent =
        "This file could not be read. Please choose a photo (JPG or PNG).";
      st.className = "status err";
    };
    img.src = url;
  });

  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }
  function list(title, arr) {
    if (!arr || !arr.length) return null;
    var d = document.createElement("div");
    d.appendChild(el("h4", title));
    var u = el("ul");
    arr.forEach(function (x) {
      u.appendChild(el("li", x));
    });
    d.appendChild(u);
    return d;
  }
  function show(r) {
    out.innerHTML = "";
    var box = el("div", "", "rs");
    if (r.valid === false) {
      box.appendChild(el("h3", "No crop leaf found"));
      box.appendChild(
        el(
          "p",
          r.message ||
            "Please take a close, well-lit photo of one affected leaf.",
        ),
      );
    } else {
      box.appendChild(el("h3", r.disease || "Result"));
      var sev = (r.severity || "").toLowerCase(),
        tag = el(
          "span",
          r.healthy ? "Healthy" : r.severity || "Unknown",
          "tag" +
            (r.healthy || sev === "low" ? " ok" : sev === "high" ? " hi" : ""),
        );
      var meta = el("p");
      meta.appendChild(tag);
      meta.appendChild(
        document.createTextNode(
          (r.crop ? r.crop + " • " : "") +
            (r.confidence != null ? "Confidence " + r.confidence + "%" : ""),
        ),
      );
      box.appendChild(meta);
      if (r.symptoms) {
        box.appendChild(el("h4", "What we see"));
        box.appendChild(el("p", r.symptoms));
      }
      [
        list("Organic remedy", r.organic),
        list("Chemical option", r.chemical),
        list("Prevention", r.prevention),
      ].forEach(function (x) {
        if (x) box.appendChild(x);
      });
    }
    box.appendChild(
      el(
        "p",
        "AI guidance only. Confirm with your local KVK or agriculture officer and follow the pesticide label before spraying.",
        "note",
      ),
    );
    out.appendChild(box);
    out.hidden = false;
  }

  go.onclick = function () {
    if (!b64) return;
    go.disabled = true;
    out.hidden = true;
    st.className = "status";
    st.textContent = "Scanning leaf… this takes a few seconds.";
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: b64,
        mime: mime,
        lang: document.documentElement.lang || "en",
      }),
    })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error(j.error || "Scan failed");
          return j;
        });
      })
      .then(function (j) {
        st.textContent = "";
        show(j);
      })
      .catch(function (e) {
        st.className = "status err";
        st.textContent =
          location.protocol === "file:"
            ? "Scan needs the online (Netlify) version. It cannot run from a file on your device."
            : "Scan failed: " + e.message + ". Please try again.";
      })
      .finally(function () {
        go.disabled = false;
      });
  };
})();
