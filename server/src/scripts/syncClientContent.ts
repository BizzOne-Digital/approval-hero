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

const CLIENT_EMAIL = 'info@approvalhero.ca';
const OLD_EMAILS = ['ak_2123@hotmail.com', 'info@approvalhero.com'];

function deepReplaceEmail<T>(value: T): T {
  if (value instanceof mongoose.Types.ObjectId || value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
    let next = value;
    for (const old of OLD_EMAILS) {
      next = next.replaceAll(old, CLIENT_EMAIL);
    }
    return next as T;
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
        const label = OLD_EMAILS.some((e) => link.label?.includes(e)) ? CLIENT_EMAIL : link.label;
        const href = OLD_EMAILS.some((e) => link.href?.includes(e)) ? `mailto:${CLIENT_EMAIL}` : link.href;
        return { ...link, label, href };
      }),
    }));
    nav.footerColumns = cols;
    await nav.save();
    logger.info('Navigation footer columns updated.');
  }

  async function syncModelEmails(model: typeof Page | typeof FAQ, label: string) {
    const docs = await model.find({}).lean();
    let updated = 0;
    for (const doc of docs) {
      const next = deepReplaceEmail(doc);
      if (JSON.stringify(next) === JSON.stringify(doc)) continue;
      const { _id, ...rest } = next as { _id: mongoose.Types.ObjectId };
      await model.updateOne({ _id }, { $set: rest });
      updated += 1;
    }
    logger.info(`${label}: ${updated} document(s) updated for email.`);
  }

  await syncModelEmails(Page, 'pages');
  await syncModelEmails(FAQ, 'faqs');

  logger.info('Done. Redeploy the site if needed.');
  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
