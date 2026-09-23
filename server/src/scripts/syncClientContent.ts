/**
 * One-time sync for live MongoDB: client email, footer copyright, intro off, hotmail links.
 * Run: npx tsx server/src/scripts/syncClientContent.ts
 */
import mongoose from 'mongoose';
import { env } from '../config/env';
import { SiteSettings } from '../models/SiteSettings';
import { Navigation } from '../models/Navigation';
import { Page } from '../models/Page';
import { FAQ } from '../models/FAQ';
import { logger } from '../utils/logger';

const CLIENT_EMAIL = 'info@approvalhero.com';
const OLD_EMAIL = 'ak_2123@hotmail.com';

function deepReplaceEmail<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replaceAll(OLD_EMAIL, CLIENT_EMAIL) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepReplaceEmail(item)) as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = deepReplaceEmail(val);
    }
    return out as T;
  }
  return value;
}

async function main() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }
  await mongoose.connect(env.MONGO_URI);

  await SiteSettings.updateOne(
    {},
    {
      $set: {
        'general.email': CLIENT_EMAIL,
        'contact.notificationEmail': CLIENT_EMAIL,
        'footer.copyright': 'Approval Hero. All rights reserved.',
        'animation.introEnabled': false,
      },
    },
    { upsert: false },
  );
  logger.info('Site settings updated.');

  const nav = await Navigation.findOne();
  if (nav?.footerColumns) {
    const cols = nav.footerColumns.map((col) => ({
      ...col,
      links: (col.links || []).map((link) => {
        const label = link.label?.includes(OLD_EMAIL) ? CLIENT_EMAIL : link.label;
        const href = link.href?.includes(OLD_EMAIL) ? `mailto:${CLIENT_EMAIL}` : link.href;
        return { ...link, label, href };
      }),
    }));
    nav.footerColumns = cols;
    await nav.save();
    logger.info('Navigation footer columns updated.');
  }

  const pages = await Page.find({});
  for (const page of pages) {
    const next = deepReplaceEmail(page.toObject());
    if (JSON.stringify(next) !== JSON.stringify(page.toObject())) {
      page.set(next);
      await page.save();
    }
  }
  logger.info('CMS pages scanned for old email.');

  const faqs = await FAQ.find({});
  for (const faq of faqs) {
    const next = deepReplaceEmail(faq.toObject());
    if (JSON.stringify(next) !== JSON.stringify(faq.toObject())) {
      faq.set(next);
      await faq.save();
    }
  }
  logger.info('FAQs scanned for old email.');

  logger.info('Done. Redeploy the site if needed.');
  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
