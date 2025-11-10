import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useMemo, useState } from "react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

const BASE_URL = import.meta.env.PROD ? "/api" : "http://18.229.149.224:8080";


export default function CursosApp() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState("");
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nota, setNota] = useState("");
  const [professor, setProfessor] = useState("");


  const roles = useMemo(
    () => (user?.["https://curso-api/roles"] ?? []),
    [user]
  );
  const isAdmin = roles.includes("admin"); 

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const t = await getAccessTokenSilently();
        setToken(t);
      } catch (e) {
        setErr("Falha ao obter token");
      }
    })();
  }, [isAuthenticated, getAccessTokenSilently]);

  async function carregar() {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${BASE_URL}/cursos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(`Erro ao carregar (${e.message})`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) carregar();
  }, [token]);

  async function criar(e) {
    e.preventDefault(); setErr("");

    const notaNum = nota === "" ? null : Number(nota);
    if (notaNum != null && (isNaN(notaNum) || notaNum < 0 || notaNum > 5)) {
      setErr("Nota deve ser número entre 0 e 5.");
      return;
    }

    const dto = { nome: nome || null, descricao: descricao || null, nota: notaNum, professor: professor || null };

    try {
      const res = await fetch(`${BASE_URL}/cursos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dto)
      });
      if (!res.ok) throw new Error(await res.text());
      const criado = await res.json();
      setCursos(prev => [criado, ...prev]);
      setNome(""); setDescricao(""); setNota(""); setProfessor("");
    } catch (e) {
      setErr(`Erro ao criar (${e.message})`);
    }
  }

  async function excluir(id) {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${BASE_URL}/cursos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 204) {
        setCursos(prev => prev.filter(c => c.id !== id));
      } else if (res.status === 403) {
        setErr("Sem permissão para excluir.");
      } else {
        setErr(`Erro ao excluir (${res.status})`);
      }
    } catch {
      setErr("Erro ao excluir.");
    }
  }

  if (!isAuthenticated) return <LoginButton />;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-4 flex items-center gap-3">
        <img src={user.picture} alt={user.name} width={40} height={40} style={{borderRadius: 999}} />
        <div>
          <div>{user.name}</div>
          <div style={{fontSize: 12, opacity: .7}}>{roles.join(", ") || "sem roles"}</div>
        </div>
        <div className="ml-auto"><LogoutButton /></div>
      </div>

      <form onSubmit={criar} className="bg-white p-4 rounded-xl shadow mb-6 grid gap-3 md:grid-cols-4">
        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do curso" className="p-2 border rounded" required />
        <input value={professor} onChange={e=>setProfessor(e.target.value)} placeholder="Professor" className="p-2 border rounded" required />
        <input type="number" min="0" max="5" step="0.1" value={nota} onChange={e=>setNota(e.target.value)} placeholder="Nota (0-5)" className="p-2 border rounded" />
        <input value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Descrição" className="p-2 border rounded md:col-span-2" />
        <button type="submit" className="p-2 rounded bg-black text-white">Cadastrar</button>
        <button type="button" onClick={carregar} className="p-2 rounded bg-gray-200">Recarregar</button>
      </form>

      {err && <div className="mb-3 text-red-600">{err}</div>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Nome</th>
              <th className="p-2">Descrição</th>
              <th className="p-2">Nota</th>
              <th className="p-2">Professor</th>
              <th className="p-2 w-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.nome ?? "-"}</td>
                <td className="p-2">{c.descricao ?? "-"}</td>
                <td className="p-2">{c.nota ?? "-"}</td>
                <td className="p-2">{c.professor ?? "-"}</td>
                <td className="p-2">
                  {isAdmin ? (
                    <button onClick={()=>excluir(c.id)} className="px-2 py-1 rounded bg-red-600 text-white">Excluir</button>
                  ) : <span style={{opacity:.5}}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
