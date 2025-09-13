# 🔗 Integração Frontend React - Connexa API

Este guia mostra como integrar a API Connexa com um frontend React.

## 📋 Configuração Inicial

### 1. Instalar dependências necessárias
```bash
npm install axios react-router-dom
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto React:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_UPLOAD_URL=http://localhost:3001/uploads
```

## 🔧 Configuração da API

### api/config.js
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 🔐 Serviços de Autenticação

### services/authService.js
```javascript
import api from '../api/config';

export const authService = {
  // Login
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data;
      
      // Salvar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  },

  // Cadastro
  async cadastrar(dadosUsuario) {
    try {
      const response = await api.post('/usuarios/cadastro', dadosUsuario);
      const { token, usuario } = response.data;
      
      // Salvar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao cadastrar' 
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Verificar se está logado
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar token
  async verifyToken() {
    try {
      const response = await api.post('/auth/verify-token');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Token inválido' };
    }
  }
};
```

## 👤 Serviços de Usuário

### services/userService.js
```javascript
import api from '../api/config';

export const userService = {
  // Obter perfil
  async getProfile() {
    try {
      const response = await api.get('/usuarios/perfil');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter perfil' 
      };
    }
  },

  // Atualizar perfil
  async updateProfile(dados, fotoPerfil) {
    try {
      const formData = new FormData();
      
      // Adicionar dados do formulário
      Object.keys(dados).forEach(key => {
        if (dados[key] !== undefined && dados[key] !== null) {
          formData.append(key, dados[key]);
        }
      });
      
      // Adicionar foto se fornecida
      if (fotoPerfil) {
        formData.append('foto_perfil', fotoPerfil);
      }
      
      const response = await api.put('/usuarios/perfil', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao atualizar perfil' 
      };
    }
  },

  // Obter grupos do usuário
  async getUserGroups() {
    try {
      const response = await api.get('/usuarios/grupos');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter grupos' 
      };
    }
  }
};
```

## 👥 Serviços de Grupos

### services/groupService.js
```javascript
import api from '../api/config';

export const groupService = {
  // Buscar grupos
  async searchGroups(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });
      
      const response = await api.get(`/grupos/buscar?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao buscar grupos' 
      };
    }
  },

  // Obter grupo por ID
  async getGroup(id) {
    try {
      const response = await api.get(`/grupos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter grupo' 
      };
    }
  },

  // Criar grupo
  async createGroup(dadosGrupo) {
    try {
      const response = await api.post('/grupos', dadosGrupo);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao criar grupo' 
      };
    }
  },

  // Entrar em grupo
  async joinGroup(id) {
    try {
      const response = await api.post(`/grupos/${id}/entrar`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao entrar no grupo' 
      };
    }
  },

  // Sair do grupo
  async leaveGroup(id) {
    try {
      const response = await api.delete(`/grupos/${id}/sair`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao sair do grupo' 
      };
    }
  },

  // Obter participantes
  async getParticipants(id) {
    try {
      const response = await api.get(`/grupos/${id}/participantes`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter participantes' 
      };
    }
  }
};
```

## 💬 Serviços de Mensagens

### services/messageService.js
```javascript
import api from '../api/config';

export const messageService = {
  // Obter mensagens
  async getMessages(groupId, pagina = 1, limite = 50) {
    try {
      const response = await api.get(`/grupos/${groupId}/mensagens`, {
        params: { pagina, limite }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter mensagens' 
      };
    }
  },

  // Enviar mensagem
  async sendMessage(groupId, conteudo) {
    try {
      const response = await api.post(`/grupos/${groupId}/mensagens`, {
        conteudo
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao enviar mensagem' 
      };
    }
  },

  // Obter últimas mensagens
  async getLatestMessages(groupId, limite = 10) {
    try {
      const response = await api.get(`/grupos/${groupId}/mensagens/ultimas`, {
        params: { limite }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter mensagens' 
      };
    }
  },

  // Deletar mensagem
  async deleteMessage(groupId, messageId) {
    try {
      const response = await api.delete(`/grupos/${groupId}/mensagens/${messageId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao deletar mensagem' 
      };
    }
  }
};
```

## 🔔 Serviços de Notificações

### services/notificationService.js
```javascript
import api from '../api/config';

export const notificationService = {
  // Obter notificações
  async getNotifications(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined) {
          params.append(key, filtros[key]);
        }
      });
      
      const response = await api.get(`/notificacoes?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter notificações' 
      };
    }
  },

  // Marcar como lida
  async markAsRead(id) {
    try {
      const response = await api.put(`/notificacoes/${id}/lida`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao marcar notificação' 
      };
    }
  },

  // Marcar todas como lidas
  async markAllAsRead() {
    try {
      const response = await api.put('/notificacoes/marcar-todas-lidas');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao marcar notificações' 
      };
    }
  },

  // Obter estatísticas
  async getStatistics() {
    try {
      const response = await api.get('/notificacoes/estatisticas');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao obter estatísticas' 
      };
    }
  }
};
```

## 🎯 Hooks Personalizados

### hooks/useAuth.js
```javascript
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isLoggedIn()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        
        // Verificar se token ainda é válido
        const { success } = await authService.verifyToken();
        if (!success) {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, senha) => {
    const { success, data, error } = await authService.login(email, senha);
    if (success) {
      setUser(data.usuario);
    }
    return { success, error };
  };

  const cadastrar = async (dadosUsuario) => {
    const { success, data, error } = await authService.cadastrar(dadosUsuario);
    if (success) {
      setUser(data.usuario);
    }
    return { success, error };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    cadastrar,
    logout,
    isLoggedIn: !!user
  };
};
```

### hooks/useGroups.js
```javascript
import { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';

export const useGroups = (filtros = {}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const searchGroups = async (novosFiltros = {}) => {
    setLoading(true);
    const { success, data, error } = await groupService.searchGroups({
      ...filtros,
      ...novosFiltros
    });
    
    if (success) {
      setGroups(data.grupos);
      setPagination(data.paginacao);
    } else {
      console.error('Erro ao buscar grupos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchGroups();
  }, []);

  return {
    groups,
    loading,
    pagination,
    searchGroups,
    refresh: () => searchGroups()
  };
};
```

## 🎨 Componentes de Exemplo

### components/LoginForm.jsx
```jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { success, error: loginError } = await login(formData.email, formData.senha);
    
    if (!success) {
      setError(loginError);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Senha:</label>
        <input
          type="password"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          required
        />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm;
```

### components/GroupCard.jsx
```jsx
import React from 'react';
import { groupService } from '../services/groupService';

const GroupCard = ({ group, onJoin, onLeave, isMember }) => {
  const handleJoin = async () => {
    const { success, error } = await groupService.joinGroup(group.id);
    if (success) {
      onJoin && onJoin(group.id);
    } else {
      alert(error);
    }
  };

  const handleLeave = async () => {
    const { success, error } = await groupService.leaveGroup(group.id);
    if (success) {
      onLeave && onLeave(group.id);
    } else {
      alert(error);
    }
  };

  return (
    <div className="group-card">
      <h3>{group.nome}</h3>
      <p><strong>Matéria:</strong> {group.materia}</p>
      <p><strong>Objetivo:</strong> {group.objetivo}</p>
      <p><strong>Local:</strong> {group.local}</p>
      <p><strong>Participantes:</strong> {group.participantes_atual}/{group.limite_participantes}</p>
      <p><strong>Criado por:</strong> {group.criador_nome}</p>
      
      <div className="actions">
        {isMember ? (
          <button onClick={handleLeave} className="btn-danger">
            Sair do Grupo
          </button>
        ) : (
          <button onClick={handleJoin} className="btn-primary">
            Entrar no Grupo
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
```

## 🚀 Exemplo de Uso Completo

### App.jsx
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import GroupList from './components/GroupList';
import GroupDetail from './components/GroupDetail';
import Profile from './components/Profile';
import Navbar from './components/Navbar';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} />}
        
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<GroupList />} />
          <Route path="/grupo/:id" element={<GroupDetail />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## 📝 Dicas de Implementação

1. **Gerenciamento de Estado**: Use Context API ou Redux para estado global
2. **Validação**: Implemente validação no frontend usando bibliotecas como Yup
3. **Loading States**: Sempre mostre indicadores de carregamento
4. **Error Handling**: Trate erros de forma amigável para o usuário
5. **Responsive**: Use CSS Grid/Flexbox para layouts responsivos
6. **PWA**: Considere transformar em PWA para melhor experiência mobile

## 🔧 Configurações Adicionais

### CORS
A API já está configurada para aceitar requests do frontend React. Certifique-se de que a URL do frontend está correta no arquivo `.env` da API:

```env
FRONTEND_URL=http://localhost:3000
```

### Upload de Arquivos
Para upload de fotos de perfil, use FormData:

```javascript
const formData = new FormData();
formData.append('foto_perfil', file);
formData.append('nome', 'Novo Nome');

const response = await api.put('/usuarios/perfil', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### WebSocket (Futuro)
Para chat em tempo real, considere implementar WebSocket ou usar bibliotecas como Socket.io.

---

**Boa sorte com sua integração! 🚀**
