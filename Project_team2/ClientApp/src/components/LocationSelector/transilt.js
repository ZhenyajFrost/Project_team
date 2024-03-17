export function transliterate(word) {
  const translitMap = {
    a: "а",
    b: "б",
    c: "ц",
    d: "д",
    e: "е",
    f: "ф",
    g: "г",
    h: "г",
    i: "і",
    j: "й",
    k: "к",
    l: "л",
    m: "м",
    n: "н",
    o: "о",
    p: "п",
    q: "к",
    r: "р",
    s: "с",
    t: "т",
    u: "у",
    v: "в",
    w: "в",
    x: "х",
    y: "и",
    z: "з",
    A: "А",
    B: "Б",
    C: "Ц",
    D: "Д",
    E: "Е",
    F: "Ф",
    G: "Г",
    H: "Г",
    I: "І",
    J: "Й",
    K: "К",
    L: "Л",
    M: "М",
    N: "Н",
    O: "О",
    P: "П",
    Q: "К",
    R: "Р",
    S: "С",
    T: "Т",
    U: "У",
    V: "В",
    W: "В",
    X: "Х",
    Y: "И",
    Z: "З",
    ch: "ч",
    Ch: "Ч",
    CH: "Ч",
    ts: "ц",
    Ts: "Ц",
    TS: "Ц",
    ya: "я",
    Ya: "Я",
    YA: "Я",
    zh: "ж",
    Zh: "Ж",
    ZH: "Ж",
    sh: "ш",
    Sh: "Ш",
    SH: "Ш",
    ay: "ай",
    Ay: "Ай",
    AY: "Ай",
  };

  let transliteratedWord = "";
  let i = 0;
  while (i < word.length) {
    let currentChar = word[i];
    let nextChar = word[i + 1];

    // Check for two-letter transliterations
    if (translitMap.hasOwnProperty(currentChar + nextChar)) {
      transliteratedWord += translitMap[currentChar + nextChar];
      i += 2; // Skip to the next character
    }
    // Check for single-letter transliterations
    else if (translitMap.hasOwnProperty(currentChar)) {
      transliteratedWord += translitMap[currentChar];
      i++;
    }
    // If not found in the map, keep the original character
    else {
      transliteratedWord += currentChar;
      i++;
    }
  }
  return transliteratedWord;
}
