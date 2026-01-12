import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private USERS_KEY = 'healthtrack_users';   // Onde guardamos todas as contas
  private SESSION_KEY = 'healthtrack_session'; // Onde guardamos quem está logado agora

  constructor() { }

  // --- 1. REGISTAR (Cria conta) ---
  register(user: any): boolean {
    const users = this.getUsers();
    
    // Verifica se o email já existe
    if (users.find((u: any) => u.email === user.email)) {
      return false; // Erro: Utilizador já existe
    }

    // Adiciona o novo utilizador à lista
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return true; // Sucesso
  }

  // --- 2. LOGIN (Entrar) ---
  login(email: string, pass: string): boolean {
    const users = this.getUsers();
    
    // Procura alguém com este email E esta password
    const foundUser = users.find((u: any) => u.email === email && u.password === pass);

    if (foundUser) {
      // Guarda na sessão que este utilizador está online
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  }

  // --- 3. LOGOUT (Sair) ---
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // --- 4. VERIFICAÇÃO ---
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.SESSION_KEY);
  }

  // Obter o utilizador atual (para mostrar o nome no Perfil)
  getCurrentUser() {
    const data = localStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Ajuda interna para ler a lista de todos os utilizadores
  private getUsers() {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }
}
