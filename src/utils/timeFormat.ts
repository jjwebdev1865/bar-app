import type { TTranslate } from '../types/common.types';

/** Formats a duration in whole seconds as e.g. "2 minutes 5 seconds". */
export function formatElapsedTime(totalSeconds: number, t: TTranslate) {
  if (totalSeconds < 60) {
    return `${totalSeconds} ${totalSeconds === 1 ? t('second') : t('seconds')}`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minuteLabel = `${minutes} ${minutes === 1 ? t('minute') : t('minutes')}`;

  if (seconds === 0) {
    return minuteLabel;
  }

  return `${minuteLabel} ${seconds} ${seconds === 1 ? t('second') : t('seconds')}`;
}
