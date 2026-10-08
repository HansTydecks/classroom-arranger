/**
 * Impressum und Datenschutzerklärung.
 *
 * Die Angaben im Impressum stimmen mit https://tinfo.space/about/impressum.html
 * überein (Quelle: Repository HansTydecks/tinfo_space). Rechtlich maßgeblich ist die
 * deutsche Fassung; die übrigen Sprachen sind Übersetzungen zur Orientierung.
 */

import { useI18n } from '../i18n/I18nContext';

const EMAIL = 'hanstydecks.tea@gmail.com';
const CONTACT_FORM = 'https://contact.tinfo.space/';

export function Imprint() {
  const { t, lang } = useI18n();

  return (
    <div className="panel prose">
      <h2>{t('imprint.title')}</h2>

      {lang !== 'de' && <p className="notice info">{t('imprint.translationNote')}</p>}

      <p>{t('imprint.legalBasis')}</p>

      <address>
        Hans Tydecks
        <br />
        Talamtstr. 9
        <br />
        06108 Halle (Saale)
        <br />
        {t('imprint.country')}
      </address>

      <h3>{t('imprint.contact')}</h3>
      <p>
        {t('imprint.email')}: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <br />
        {t('imprint.form')}:{' '}
        <a href={CONTACT_FORM} target="_blank" rel="noopener noreferrer">
          {CONTACT_FORM}
        </a>
      </p>

      <h3>{t('imprint.responsible')}</h3>
      <p>{t('imprint.responsibleText')}</p>
      <address>
        Hans Tydecks
        <br />
        Talamtstr. 9
        <br />
        06108 Halle (Saale)
      </address>

      <h3>{t('imprint.support')}</h3>
      <p>{t('imprint.supportText')}</p>

      <h3>{t('imprint.liabilityContent')}</h3>
      <p>{t('imprint.liabilityContentText')}</p>
      <p>{t('imprint.liabilityApp')}</p>

      <h3>{t('imprint.liabilityLinks')}</h3>
      <p>{t('imprint.liabilityLinksText')}</p>

      <h3>{t('imprint.copyright')}</h3>
      <p>{t('imprint.copyrightText')}</p>

      <h3>{t('imprint.note')}</h3>
      <p>{t('imprint.noteText')}</p>
    </div>
  );
}

export function Privacy() {
  const { t } = useI18n();

  return (
    <div className="panel prose">
      <h2>{t('privacy.title')}</h2>

      <h3>{t('privacy.firstTitle')}</h3>
      <p>{t('privacy.firstText')}</p>

      <h3>{t('privacy.whereTitle')}</h3>
      <dl>
        <dt>{t('privacy.dataTitle')}</dt>
        <dd>{t('privacy.dataText')}</dd>

        <dt>{t('privacy.langTitle')}</dt>
        <dd>{t('privacy.langText')}</dd>

        <dt>{t('privacy.trackingTitle')}</dt>
        <dd>{t('privacy.trackingText')}</dd>

        <dt>{t('privacy.exportTitle')}</dt>
        <dd>{t('privacy.exportText')}</dd>

        <dt>{t('privacy.logsTitle')}</dt>
        <dd>{t('privacy.logsText')}</dd>
      </dl>

      <h3>{t('privacy.controllerTitle')}</h3>
      <p>{t('privacy.controllerText')}</p>

      <h3>{t('privacy.minimisationTitle')}</h3>
      <p>{t('privacy.minimisationText')}</p>

      <h3>{t('privacy.deletionTitle')}</h3>
      <p>{t('privacy.deletionText')}</p>

      <h3>{t('privacy.rightsTitle')}</h3>
      <p>
        {t('privacy.rightsText')} <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    </div>
  );
}
