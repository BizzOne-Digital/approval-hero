import { Response } from 'express';
import {
  Page, Service, GalleryCategory, GalleryImage, Testimonial,
  FAQCategory, FAQ, BlogPost, BlogCategory, Offer, Lead,
  SiteSettings, Navigation, ActivityLog, MediaAsset,
} from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { sanitizeRichText } from '../utils/sanitize';
import { sendLeadNotification } from '../services/emailService';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';

// ============ PUBLIC ============

export async function getPublicSettings(_req: AuthRequest, res: Response): Promise<void> {
  const settings = await SiteSettings.findOne().lean();
  if (!settings) {
    sendError(res, 'Settings not found', 404);
    return;
  }
  sendSuccess(res, settings);
}

export async function getPublicNavigation(_req: AuthRequest, res: Response): Promise<void> {
  const nav = await Navigation.findOne().lean();
  const services = await Service.find({ status: 'published' }).select('title slug order').sort('order').lean();
  sendSuccess(res, { navigation: nav, services });
}

export async function getPublicPage(req: AuthRequest, res: Response): Promise<void> {
  const { slug } = req.params;
  const isPreview = req.query.preview === 'true' && req.admin;

  const query: Record<string, unknown> = { slug };
  if (!isPreview) query.status = 'published';

  const page = await Page.findOne(query).lean();
  if (!page) {
    sendError(res, 'Page not found', 404);
    return;
  }
  sendSuccess(res, page);
}

export async function getPublicServices(_req: AuthRequest, res: Response): Promise<void> {
  const services = await Service.find({ status: 'published' }).sort('order').lean();
  sendSuccess(res, services);
}

export async function getPublicService(req: AuthRequest, res: Response): Promise<void> {
  const service = await Service.findOne({ slug: req.params.slug, status: 'published' }).lean();
  if (!service) {
    sendError(res, 'Service not found', 404);
    return;
  }
  sendSuccess(res, service);
}

export async function getPublicGallery(req: AuthRequest, res: Response): Promise<void> {
  const { category, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const categories = await GalleryCategory.find().sort('order').lean();

  const filter: Record<string, unknown> = { status: 'published' };
  if (category) {
    const cat = await GalleryCategory.findOne({ slug: category });
    if (cat) filter.categoryId = cat._id;
  }

  const total = await GalleryImage.countDocuments(filter);
  const images = await GalleryImage.find(filter)
    .populate('categoryId', 'name slug')
    .sort('order')
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  sendSuccess(res, {
    categories,
    images,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
}

export async function getPublicTestimonials(_req: AuthRequest, res: Response): Promise<void> {
  const testimonials = await Testimonial.find({ status: 'published' }).sort('order').lean();
  sendSuccess(res, testimonials);
}

export async function getPublicFaqs(req: AuthRequest, res: Response): Promise<void> {
  const { category, search } = req.query;
  const categories = await FAQCategory.find().sort('order').lean();

  const filter: Record<string, unknown> = { status: 'published' };
  if (category) {
    const cat = await FAQCategory.findOne({ slug: category });
    if (cat) filter.categoryId = cat._id;
  }

  let faqs = await FAQ.find(filter).populate('categoryId', 'name slug').sort('order').lean();

  if (search) {
    const s = (search as string).toLowerCase();
    faqs = faqs.filter(
      (f) => f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s)
    );
  }

  sendSuccess(res, { categories, faqs });
}

export async function getPublicBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { page = '1', limit = '9', category, search } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const filter: Record<string, unknown> = { status: 'published' };
  if (category) {
    const cat = await BlogCategory.findOne({ slug: category });
    if (cat) filter.categoryId = cat._id;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await BlogPost.countDocuments(filter);
  const posts = await BlogPost.find(filter)
    .populate('categoryId', 'name slug')
    .sort({ publishedAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const categories = await BlogCategory.find().lean();
  const featured = await BlogPost.findOne({ status: 'published', isFeatured: true })
    .populate('categoryId', 'name slug')
    .lean();

  sendSuccess(res, { posts, categories, featured, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
}

export async function getPublicBlog(req: AuthRequest, res: Response): Promise<void> {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' })
    .populate('categoryId', 'name slug')
    .lean();
  if (!post) {
    sendError(res, 'Blog post not found', 404);
    return;
  }

  const related = await BlogPost.find({
    status: 'published',
    categoryId: post.categoryId,
    _id: { $ne: post._id },
  }).limit(3).lean();

  sendSuccess(res, { post, related });
}

export async function getPublicOffers(_req: AuthRequest, res: Response): Promise<void> {
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    $and: [
      { $or: [{ startDate: { $lte: now } }, { startDate: { $exists: false } }, { startDate: null }] },
      { $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }, { endDate: null }] },
    ],
  }).lean();
  sendSuccess(res, offers);
}

export async function submitContact(req: AuthRequest, res: Response): Promise<void> {
  const lead = await Lead.create({
    submissionType: req.body.submissionType || 'contact',
    ...req.body,
    status: 'New',
  });

  sendLeadNotification(lead).catch(() => {});

  const settings = await SiteSettings.findOne();
  sendSuccess(res, { id: lead.id }, settings?.contact?.successMessage || 'Thank you!');
}

export async function submitApplication(req: AuthRequest, res: Response): Promise<void> {
  const body = { ...req.body };
  if (!body.name && body.firstName && body.lastName) {
    body.name = `${body.firstName} ${body.lastName}`.trim();
  }

  const lead = await Lead.create({
    submissionType: 'application',
    ...body,
    status: 'New',
  });

  sendLeadNotification(lead).catch(() => {});

  const settings = await SiteSettings.findOne();
  sendSuccess(res, { id: lead.id }, settings?.contact?.successMessage || 'Application received!');
}

// ============ ADMIN DASHBOARD ============

export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  const [
    pageCount, serviceCount, galleryCount, testimonialCount,
    faqCount, blogCount, newLeads, totalLeads, recentLeads,
    recentActivity,
  ] = await Promise.all([
    Page.countDocuments({ status: 'published' }),
    Service.countDocuments({ status: 'published' }),
    GalleryImage.countDocuments(),
    Testimonial.countDocuments({ status: 'published' }),
    FAQ.countDocuments({ status: 'published' }),
    BlogPost.countDocuments({ status: 'published' }),
    Lead.countDocuments({ status: 'New', isArchived: false }),
    Lead.countDocuments({ isArchived: false }),
    Lead.find({ isArchived: false }).sort({ createdAt: -1 }).limit(10).lean(),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'name email').lean(),
  ]);

  const leadStatusBreakdown = await Lead.aggregate([
    { $match: { isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const leadSourceBreakdown = await Lead.aggregate([
    { $match: { isArchived: false } },
    { $group: { _id: '$sourcePage', count: { $sum: 1 } } },
  ]);

  let storageUsage = 0;
  try {
    const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    const getDirSize = async (dir: string): Promise<number> => {
      let size = 0;
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          size += await getDirSize(fullPath);
        } else {
          const stat = await fs.stat(fullPath);
          size += stat.size;
        }
      }
      return size;
    };
    storageUsage = await getDirSize(uploadDir);
  } catch {
    storageUsage = 0;
  }

  const settings = await SiteSettings.findOne().lean();

  sendSuccess(res, {
    stats: {
      pages: pageCount,
      services: serviceCount,
      galleryImages: galleryCount,
      testimonials: testimonialCount,
      faqs: faqCount,
      blogs: blogCount,
      newLeads,
      totalLeads,
    },
    recentLeads,
    leadStatusBreakdown,
    leadSourceBreakdown,
    recentActivity,
    storageUsage,
    storageUsageMB: (storageUsage / (1024 * 1024)).toFixed(2),
    contact: settings?.general,
  });
}

// ============ ADMIN CRUD HELPERS ============

export async function adminGetPages(_req: AuthRequest, res: Response): Promise<void> {
  const pages = await Page.find().sort({ title: 1 }).lean();
  sendSuccess(res, pages);
}

export async function adminGetPage(req: AuthRequest, res: Response): Promise<void> {
  const page = await Page.findById(req.params.id).lean();
  if (!page) { sendError(res, 'Page not found', 404); return; }
  sendSuccess(res, page);
}

export async function adminUpdatePage(req: AuthRequest, res: Response): Promise<void> {
  const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!page) { sendError(res, 'Page not found', 404); return; }

  if (req.admin) {
    await ActivityLog.create({
      adminId: req.admin.id,
      action: 'update',
      entityType: 'Page',
      entityId: page.id,
      details: `Updated page: ${page.title}`,
    });
  }

  sendSuccess(res, page, 'Page updated');
}

export async function adminGetServices(_req: AuthRequest, res: Response): Promise<void> {
  const services = await Service.find().sort('order').lean();
  sendSuccess(res, services);
}

export async function adminGetService(req: AuthRequest, res: Response): Promise<void> {
  const service = await Service.findById(req.params.id).lean();
  if (!service) { sendError(res, 'Service not found', 404); return; }
  sendSuccess(res, service);
}

export async function adminCreateService(req: AuthRequest, res: Response): Promise<void> {
  const service = await Service.create(req.body);
  if (req.admin) {
    await ActivityLog.create({
      adminId: req.admin.id,
      action: 'create',
      entityType: 'Service',
      entityId: service.id,
      details: `Created service: ${service.title}`,
    });
  }
  sendSuccess(res, service, 'Service created', 201);
}

export async function adminUpdateService(req: AuthRequest, res: Response): Promise<void> {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) { sendError(res, 'Service not found', 404); return; }
  if (req.admin) {
    await ActivityLog.create({
      adminId: req.admin.id,
      action: 'update',
      entityType: 'Service',
      entityId: service.id,
      details: `Updated service: ${service.title}`,
    });
  }
  sendSuccess(res, service, 'Service updated');
}

export async function adminDeleteService(req: AuthRequest, res: Response): Promise<void> {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) { sendError(res, 'Service not found', 404); return; }
  sendSuccess(res, null, 'Service deleted');
}

export async function adminGetLeads(req: AuthRequest, res: Response): Promise<void> {
  const { page = '1', limit = '20', status, search, sort = '-createdAt' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const filter: Record<string, unknown> = { isArchived: false };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Lead.countDocuments(filter);
  const leads = await Lead.find(filter).sort(sort as string).skip((pageNum - 1) * limitNum).limit(limitNum).lean();
  sendPaginated(res, leads, pageNum, limitNum, total);
}

export async function adminUpdateLead(req: AuthRequest, res: Response): Promise<void> {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lead) { sendError(res, 'Lead not found', 404); return; }
  sendSuccess(res, lead, 'Lead updated');
}

export async function adminDeleteLead(req: AuthRequest, res: Response): Promise<void> {
  await Lead.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Lead deleted');
}

export async function adminExportLeads(_req: AuthRequest, res: Response): Promise<void> {
  const leads = await Lead.find({ isArchived: false }).sort({ createdAt: -1 }).lean();
  const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Province', 'Credit', 'Vehicle', 'Source', 'Date'];
  const rows = leads.map((l) => [
    l.name, l.email, l.phone, l.submissionType, l.status,
    l.province || '', l.creditSituation || '', l.vehiclePreference || '',
    l.sourcePage || '', l.createdAt.toISOString(),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
  res.send(csv);
}

export async function adminGetSettings(_req: AuthRequest, res: Response): Promise<void> {
  const settings = await SiteSettings.findOne();
  sendSuccess(res, settings);
}

export async function adminUpdateSettings(req: AuthRequest, res: Response): Promise<void> {
  const settings = await SiteSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  sendSuccess(res, settings, 'Settings updated');
}

export async function adminGetNavigation(_req: AuthRequest, res: Response): Promise<void> {
  const nav = await Navigation.findOne();
  sendSuccess(res, nav);
}

export async function adminUpdateNavigation(req: AuthRequest, res: Response): Promise<void> {
  const nav = await Navigation.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  sendSuccess(res, nav, 'Navigation updated');
}

// Gallery admin
export async function adminGetGalleryCategories(_req: AuthRequest, res: Response): Promise<void> {
  const categories = await GalleryCategory.find().sort('order').lean();
  sendSuccess(res, categories);
}

export async function adminCreateGalleryCategory(req: AuthRequest, res: Response): Promise<void> {
  const category = await GalleryCategory.create(req.body);
  sendSuccess(res, category, 'Category created', 201);
}

export async function adminUpdateGalleryCategory(req: AuthRequest, res: Response): Promise<void> {
  const category = await GalleryCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) { sendError(res, 'Category not found', 404); return; }
  sendSuccess(res, category);
}

export async function adminDeleteGalleryCategory(req: AuthRequest, res: Response): Promise<void> {
  await GalleryImage.deleteMany({ categoryId: req.params.id });
  await GalleryCategory.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Category deleted');
}

export async function adminGetGalleryImages(req: AuthRequest, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  const images = await GalleryImage.find(filter).populate('categoryId', 'name slug').sort('order').lean();
  sendSuccess(res, images);
}

export async function adminCreateGalleryImage(req: AuthRequest, res: Response): Promise<void> {
  const image = await GalleryImage.create(req.body);
  sendSuccess(res, image, 'Image created', 201);
}

export async function adminUpdateGalleryImage(req: AuthRequest, res: Response): Promise<void> {
  const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!image) { sendError(res, 'Image not found', 404); return; }
  sendSuccess(res, image);
}

export async function adminDeleteGalleryImage(req: AuthRequest, res: Response): Promise<void> {
  await GalleryImage.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Image deleted');
}

// Testimonials admin
export async function adminGetTestimonials(_req: AuthRequest, res: Response): Promise<void> {
  const testimonials = await Testimonial.find().sort('order').lean();
  sendSuccess(res, testimonials);
}

export async function adminCreateTestimonial(req: AuthRequest, res: Response): Promise<void> {
  const testimonial = await Testimonial.create(req.body);
  sendSuccess(res, testimonial, 'Testimonial created', 201);
}

export async function adminUpdateTestimonial(req: AuthRequest, res: Response): Promise<void> {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) { sendError(res, 'Testimonial not found', 404); return; }
  sendSuccess(res, testimonial);
}

export async function adminDeleteTestimonial(req: AuthRequest, res: Response): Promise<void> {
  await Testimonial.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Testimonial deleted');
}

// FAQ admin
export async function adminGetFaqCategories(_req: AuthRequest, res: Response): Promise<void> {
  const categories = await FAQCategory.find().sort('order').lean();
  sendSuccess(res, categories);
}

export async function adminCreateFaqCategory(req: AuthRequest, res: Response): Promise<void> {
  const category = await FAQCategory.create(req.body);
  sendSuccess(res, category, 'Category created', 201);
}

export async function adminUpdateFaqCategory(req: AuthRequest, res: Response): Promise<void> {
  const category = await FAQCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) { sendError(res, 'Category not found', 404); return; }
  sendSuccess(res, category);
}

export async function adminDeleteFaqCategory(req: AuthRequest, res: Response): Promise<void> {
  await FAQ.deleteMany({ categoryId: req.params.id });
  await FAQCategory.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Category deleted');
}

export async function adminGetFaqs(_req: AuthRequest, res: Response): Promise<void> {
  const faqs = await FAQ.find().populate('categoryId', 'name slug').sort('order').lean();
  sendSuccess(res, faqs);
}

export async function adminCreateFaq(req: AuthRequest, res: Response): Promise<void> {
  const data = { ...req.body, answer: sanitizeRichText(req.body.answer) };
  const faq = await FAQ.create(data);
  sendSuccess(res, faq, 'FAQ created', 201);
}

export async function adminUpdateFaq(req: AuthRequest, res: Response): Promise<void> {
  const data = { ...req.body };
  if (data.answer) data.answer = sanitizeRichText(data.answer);
  const faq = await FAQ.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!faq) { sendError(res, 'FAQ not found', 404); return; }
  sendSuccess(res, faq);
}

export async function adminDeleteFaq(req: AuthRequest, res: Response): Promise<void> {
  await FAQ.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'FAQ deleted');
}

// Blog admin
export async function adminGetBlogs(_req: AuthRequest, res: Response): Promise<void> {
  const blogs = await BlogPost.find().populate('categoryId', 'name slug').sort({ createdAt: -1 }).lean();
  sendSuccess(res, blogs);
}

export async function adminGetBlog(req: AuthRequest, res: Response): Promise<void> {
  const blog = await BlogPost.findById(req.params.id).lean();
  if (!blog) { sendError(res, 'Blog not found', 404); return; }
  sendSuccess(res, blog);
}

export async function adminCreateBlog(req: AuthRequest, res: Response): Promise<void> {
  const data = { ...req.body, content: sanitizeRichText(req.body.content) };
  const blog = await BlogPost.create(data);
  sendSuccess(res, blog, 'Blog created', 201);
}

export async function adminUpdateBlog(req: AuthRequest, res: Response): Promise<void> {
  const data = { ...req.body };
  if (data.content) data.content = sanitizeRichText(data.content);
  const blog = await BlogPost.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!blog) { sendError(res, 'Blog not found', 404); return; }
  sendSuccess(res, blog);
}

export async function adminDeleteBlog(req: AuthRequest, res: Response): Promise<void> {
  await BlogPost.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Blog deleted');
}

export async function adminGetBlogCategories(_req: AuthRequest, res: Response): Promise<void> {
  const categories = await BlogCategory.find().lean();
  sendSuccess(res, categories);
}

export async function adminCreateBlogCategory(req: AuthRequest, res: Response): Promise<void> {
  const category = await BlogCategory.create(req.body);
  sendSuccess(res, category, 'Category created', 201);
}

// Offers admin
export async function adminGetOffers(_req: AuthRequest, res: Response): Promise<void> {
  const offers = await Offer.find().sort({ createdAt: -1 }).lean();
  sendSuccess(res, offers);
}

export async function adminCreateOffer(req: AuthRequest, res: Response): Promise<void> {
  const offer = await Offer.create(req.body);
  sendSuccess(res, offer, 'Offer created', 201);
}

export async function adminUpdateOffer(req: AuthRequest, res: Response): Promise<void> {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!offer) { sendError(res, 'Offer not found', 404); return; }
  sendSuccess(res, offer);
}

export async function adminDeleteOffer(req: AuthRequest, res: Response): Promise<void> {
  await Offer.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Offer deleted');
}

// Media admin
export async function adminGetMedia(req: AuthRequest, res: Response): Promise<void> {
  const { folder, page = '1', limit = '24' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const filter: Record<string, unknown> = {};
  if (folder) filter.folder = folder;

  const total = await MediaAsset.countDocuments(filter);
  const assets = await MediaAsset.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean();
  sendPaginated(res, assets, pageNum, limitNum, total);
}

export async function adminUploadMedia(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) {
    sendError(res, 'No file uploaded', 400);
    return;
  }

  const { storageService } = await import('../services/storageService');
  const folder = (req.body.folder as string) || 'temp';
  const alt = (req.body.alt as string) || '';

  const processed = await storageService.processUpload(req.file, folder);

  const asset = await MediaAsset.create({
    filename: processed.filename,
    originalName: req.file.originalname,
    mimeType: processed.mimeType,
    size: processed.size,
    url: processed.url,
    thumbnailUrl: processed.thumbnailUrl,
    alt,
    folder,
    width: processed.width,
    height: processed.height,
    uploadedBy: req.admin?.id,
  });

  sendSuccess(res, asset, 'File uploaded', 201);
}

export async function adminDeleteMedia(req: AuthRequest, res: Response): Promise<void> {
  const { storageService } = await import('../services/storageService');
  await storageService.safeDeleteByMediaId(String(req.params.id));
  sendSuccess(res, null, 'Media deleted');
}

export async function adminUpdateMedia(req: AuthRequest, res: Response): Promise<void> {
  const asset = await MediaAsset.findByIdAndUpdate(req.params.id, { alt: req.body.alt }, { new: true });
  if (!asset) { sendError(res, 'Media not found', 404); return; }
  sendSuccess(res, asset);
}
