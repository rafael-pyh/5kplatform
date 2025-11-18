# 🎓 Guia de Melhores Práticas - Frontend

## 📋 Regras Gerais

### 1. **Componentização**
✅ **Faça**: Crie componentes pequenos e focados
```tsx
// BOM: Componente focado
function UserAvatar({ name, photoUrl }) {
  return <img src={photoUrl} alt={name} />;
}

// RUIM: Componente fazendo tudo
function UserProfile() {
  // 200 linhas de código...
}
```

❌ **Evite**: Componentes com mais de 300 linhas

---

### 2. **Performance**

#### Use React.memo para componentes que renderizam listas
```tsx
// ✅ BOM: Evita re-render desnecessário
export default memo(TableRow);

// ❌ RUIM: Re-renderiza sempre
export default TableRow;
```

#### Use useCallback para funções passadas como props
```tsx
// ✅ BOM: Função estável
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ RUIM: Nova função a cada render
const handleClick = () => doSomething(id);
```

#### Use useMemo para valores computados pesados
```tsx
// ✅ BOM: Só recalcula quando dados mudam
const filteredData = useMemo(() => 
  data.filter(item => item.active), 
  [data]
);

// ❌ RUIM: Recalcula toda vez
const filteredData = data.filter(item => item.active);
```

---

### 3. **Hooks Customizados**

#### Quando criar um hook?
✅ Quando a lógica é reutilizada em 2+ lugares
✅ Quando a lógica é complexa (50+ linhas)
✅ Quando envolve múltiplos estados relacionados

```tsx
// ✅ BOM: Lógica encapsulada
function useFormValidation(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  // ... validação complexa
  return { values, errors, handleChange, validate };
}

// ❌ RUIM: Lógica espalhada em cada componente
```

---

### 4. **Tipagem TypeScript**

```tsx
// ✅ BOM: Tipos explícitos
interface User {
  id: string;
  name: string;
  email: string;
}

function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ RUIM: any ou sem tipos
function UserCard({ user }: any) {
  return <div>{user.name}</div>;
}
```

---

### 5. **Estado**

#### Evite estado desnecessário
```tsx
// ❌ RUIM: Estado derivado
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0);

// ✅ BOM: Calcule na renderização
const [items, setItems] = useState([]);
const itemCount = items.length;
```

#### Use Context para dados globais
```tsx
// ✅ BOM: Dados compartilhados via Context
const AuthContext = createContext<AuthState>();

// ❌ RUIM: Props drilling em 5+ níveis
<A><B><C><D><E user={user} /></E></D></C></B></A>
```

---

### 6. **Estrutura de Arquivos**

```
feature/
├── components/           # Componentes da feature
│   ├── FeatureList.tsx
│   ├── FeatureItem.tsx
│   └── index.ts
├── hooks/               # Hooks específicos
│   └── useFeature.ts
├── types.ts             # Tipos TypeScript
├── utils.ts             # Funções auxiliares
└── index.ts             # Export público
```

---

### 7. **Imports/Exports**

#### Use barrel exports (index.ts)
```tsx
// components/ui/index.ts
export { default as Button } from './Button';
export { default as Badge } from './Badge';

// Uso
import { Button, Badge } from '@/components/ui';
```

#### Ordem de imports
```tsx
// 1. React
import { useState, useEffect } from 'react';

// 2. Bibliotecas externas
import { toast } from 'react-hot-toast';

// 3. Componentes internos
import Button from '@/components/ui/Button';

// 4. Hooks
import { usePersons } from '@/hooks';

// 5. Tipos
import type { Person } from '@/lib/types';

// 6. Estilos
import styles from './styles.module.css';
```

---

### 8. **Código Limpo**

#### Nomes descritivos
```tsx
// ✅ BOM
const filteredActiveUsers = users.filter(u => u.active);
const handleSubmitForm = () => { ... };

// ❌ RUIM
const x = users.filter(u => u.active);
const f = () => { ... };
```

#### Extraia constantes
```tsx
// ✅ BOM
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_FILE_TYPES = ['image/jpeg', 'image/png'];

if (file.size > MAX_UPLOAD_SIZE) { ... }

// ❌ RUIM
if (file.size > 5242880) { ... }
```

#### Early returns
```tsx
// ✅ BOM: Fácil de ler
function processUser(user: User | null) {
  if (!user) return null;
  if (!user.active) return null;
  
  return <UserCard user={user} />;
}

// ❌ RUIM: Aninhamento profundo
function processUser(user: User | null) {
  if (user) {
    if (user.active) {
      return <UserCard user={user} />;
    }
  }
  return null;
}
```

---

### 9. **Tratamento de Erros**

```tsx
// ✅ BOM: Tratamento específico
try {
  await api.createUser(data);
  toast.success('Usuário criado!');
} catch (error) {
  if (error.status === 409) {
    toast.error('Email já cadastrado');
  } else {
    toast.error('Erro ao criar usuário');
  }
  console.error('Create user error:', error);
}

// ❌ RUIM: Erro genérico
try {
  await api.createUser(data);
} catch (error) {
  console.log('error');
}
```

---

### 10. **Acessibilidade**

```tsx
// ✅ BOM: Acessível
<button
  onClick={handleDelete}
  aria-label="Deletar usuário"
  className="..."
>
  <TrashIcon />
</button>

// ❌ RUIM: Sem contexto
<button onClick={handleDelete}>
  <TrashIcon />
</button>
```

---

## 🎨 Padrões de Design

### 1. **Compound Components**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>
```

### 2. **Render Props**
```tsx
<DataFetcher
  url="/api/users"
  render={({ data, loading }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
/>
```

### 3. **Higher-Order Components (use com moderação)**
```tsx
const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Login />;
    return <Component {...props} />;
  };
};
```

---

## 🧪 Testes (Futuro)

### Estrutura de teste
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renderiza com texto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('chama onClick ao clicar', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📚 Recursos Recomendados

### Documentação
- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Artigos
- [React Performance](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Clean Code React](https://dev.to/abrahamlawson/clean-code-applied-to-react-2d0b)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## ✅ Checklist para Novos Componentes

- [ ] Nome descritivo e em PascalCase
- [ ] TypeScript com tipos explícitos
- [ ] Props interface documentada
- [ ] Memoizado se usado em listas
- [ ] useCallback para handlers
- [ ] useMemo para valores computados
- [ ] Acessibilidade (aria-labels)
- [ ] Responsivo (mobile-first)
- [ ] Loading/error states
- [ ] Comentários para lógica complexa

---

## 🚀 Performance Checklist

- [ ] Componentes memoizados onde necessário
- [ ] Imagens otimizadas (Next.js Image)
- [ ] Lazy loading de componentes pesados
- [ ] Code splitting configurado
- [ ] Bundle size monitorado
- [ ] Lighthouse score > 90
- [ ] Sem memory leaks (useEffect cleanup)

---

**Última atualização**: 18/11/2025
**Versão**: 1.0.0

