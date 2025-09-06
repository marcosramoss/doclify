import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: string | Date, pattern: string = 'dd/MM/yyyy') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern, { locale: ptBR });
};

/**
 * Format a date to show relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency: string = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Truncate text to a specific length
 */
export const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate initials from a name
 */
export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Convert priority to readable text
 */
export const formatPriority = (priority: string) => {
  const priorities: Record<string, string> = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
    must_have: 'Obrigatório',
    should_have: 'Importante',
    could_have: 'Desejável',
    wont_have: 'Não será feito',
    primary: 'Primário',
    secondary: 'Secundário',
  };
  
  return priorities[priority] || priority;
};

/**
 * Convert category to readable text
 */
export const formatCategory = (category: string) => {
  const categories: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Banco de Dados',
    infrastructure: 'Infraestrutura',
    other: 'Outros',
    performance: 'Performance',
    security: 'Segurança',
    usability: 'Usabilidade',
    reliability: 'Confiabilidade',
    scalability: 'Escalabilidade',
  };
  
  return categories[category] || category;
};