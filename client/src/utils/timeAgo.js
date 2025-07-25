import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const getTimeAgo = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ko });
};
