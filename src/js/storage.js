export function write( dbName, data ){
    console.log("[storage] write ->", dbName, data);
    localStorage.setItem(dbName, JSON.stringify(data));
}

export function read(dbName) {
  const raw = localStorage.getItem(dbName);
  console.log("[storage] read ->", dbName, raw);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}