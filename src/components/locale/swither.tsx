import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcherSelect from './swither-select';

export default function LocaleSwitcher() {
  const t = useTranslations('locale-switcher');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: 'en',
          label: t('en')
        },
        {
          value: 'zh-CN',
          label: t('zh-CN')
        }
      ]}
      label={t('label')}
    />
  );
}