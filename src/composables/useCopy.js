import { useToastStore } from '../store/toastStore.js';

export default function useCopy() {
  const $toast = useToastStore();

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      $toast.push(`${text} copiado com sucesso.`);
    } catch (error) {
      $toast.push(`Erro ao copiar ${text}: ${error}`);
    }
  };

  return {
    copy,
  };
}
