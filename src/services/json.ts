export const stringify = (json: any) => {
  return JSON.stringify(json, refReplacer());
};

function refReplacer() {
  const m = new Map(),
    v = new Map();
  let init: any = null;

  return function (this: any, field: any, value: any) {
    const p = m.get(this) + (Array.isArray(this) ? `[${field}]` : "." + field);
    const isComplex = value === Object(value);

    if (isComplex) m.set(value, p);

    const pp = v.get(value) || "";
    const path = p.replace(/undefined\.\.?/, "");
    let val = pp ? `#REF:${pp[0] == "[" ? "$" : "$."}${pp}` : value;

    !init ? (init = value) : val === init ? (val = "#REF:$") : 0;
    if (!pp && isComplex) v.set(value, path);

    return val;
  };
}
