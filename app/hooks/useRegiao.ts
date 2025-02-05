export const useRegiao = () => {
  const fetchRegiao = async () => {
    const resposta = await fetch('https://bodymap-back.vercel.app/regiao');
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    return await resposta.json();
  };
  return { fetchRegiao };
};
