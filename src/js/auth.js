import { read } from "./storage.js";

export function login(email, password){
  const users = read("administrativos");
  const found = users.find(u => u.email === email && u.password === password);
  if(found){
    localStorage.setItem("session", JSON.stringify({
      email: found.email,
      nombres: found.nombres,
      apellidos: found.apellidos,
      cargo: found.cargo,
      role: "admin"
    }));
    return true;
  }
  return false;
}

export function logout(){
  localStorage.removeItem("session");
  location.href = "../../index.html";
}

export function currentUser(){
  const raw = localStorage.getItem("session");
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn(){ return !!currentUser(); }
export function isAdmin(){ return !!currentUser(); }
