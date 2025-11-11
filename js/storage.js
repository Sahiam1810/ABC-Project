export function write(dbName, data){
  localStorage.setItem(dbName, JSON.stringify(data));
}
export function read(dbName){
  const raw = localStorage.getItem(dbName);
  try{ return raw ? JSON.parse(raw) : []; }catch{ return []; }
}
export function remove(dbName){
  localStorage.removeItem(dbName);
}