import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import * as auth from '../controllers/authController';
import * as api from '../controllers/apiController';
import * as appCtrl from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Auth
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});

router.post('/auth/login', validateBody(loginSchema), auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticate, auth.me);
router.put('/auth/password', authenticate, validateBody(changePasswordSchema), auth.changePassword);

// Dashboard
router.get('/dashboard', authenticate, api.getDashboard);

// Pages
router.get('/pages', authenticate, api.adminGetPages);
router.get('/pages/:id', authenticate, api.adminGetPage);
router.put('/pages/:id', authenticate, api.adminUpdatePage);

// Services
router.get('/services', authenticate, api.adminGetServices);
router.get('/services/:id', authenticate, api.adminGetService);
router.post('/services', authenticate, api.adminCreateService);
router.put('/services/:id', authenticate, api.adminUpdateService);
router.delete('/services/:id', authenticate, api.adminDeleteService);

// Gallery
router.get('/gallery/categories', authenticate, api.adminGetGalleryCategories);
router.post('/gallery/categories', authenticate, api.adminCreateGalleryCategory);
router.put('/gallery/categories/:id', authenticate, api.adminUpdateGalleryCategory);
router.delete('/gallery/categories/:id', authenticate, api.adminDeleteGalleryCategory);
router.get('/gallery/images', authenticate, api.adminGetGalleryImages);
router.post('/gallery/images', authenticate, api.adminCreateGalleryImage);
router.put('/gallery/images/:id', authenticate, api.adminUpdateGalleryImage);
router.delete('/gallery/images/:id', authenticate, api.adminDeleteGalleryImage);

// Testimonials
router.get('/testimonials', authenticate, api.adminGetTestimonials);
router.post('/testimonials', authenticate, api.adminCreateTestimonial);
router.put('/testimonials/:id', authenticate, api.adminUpdateTestimonial);
router.delete('/testimonials/:id', authenticate, api.adminDeleteTestimonial);

// FAQs
router.get('/faqs/categories', authenticate, api.adminGetFaqCategories);
router.post('/faqs/categories', authenticate, api.adminCreateFaqCategory);
router.put('/faqs/categories/:id', authenticate, api.adminUpdateFaqCategory);
router.delete('/faqs/categories/:id', authenticate, api.adminDeleteFaqCategory);
router.get('/faqs', authenticate, api.adminGetFaqs);
router.post('/faqs', authenticate, api.adminCreateFaq);
router.put('/faqs/:id', authenticate, api.adminUpdateFaq);
router.delete('/faqs/:id', authenticate, api.adminDeleteFaq);

// Blog
router.get('/blogs', authenticate, api.adminGetBlogs);
router.get('/blogs/:id', authenticate, api.adminGetBlog);
router.post('/blogs', authenticate, api.adminCreateBlog);
router.put('/blogs/:id', authenticate, api.adminUpdateBlog);
router.delete('/blogs/:id', authenticate, api.adminDeleteBlog);
router.get('/blog-categories', authenticate, api.adminGetBlogCategories);
router.post('/blog-categories', authenticate, api.adminCreateBlogCategory);

// Offers
router.get('/offers', authenticate, api.adminGetOffers);
router.post('/offers', authenticate, api.adminCreateOffer);
router.put('/offers/:id', authenticate, api.adminUpdateOffer);
router.delete('/offers/:id', authenticate, api.adminDeleteOffer);

// Leads
router.get('/leads', authenticate, api.adminGetLeads);
router.put('/leads/:id', authenticate, api.adminUpdateLead);
router.delete('/leads/:id', authenticate, api.adminDeleteLead);
router.get('/leads/export/csv', authenticate, api.adminExportLeads);

// Applications
router.get('/applications', authenticate, appCtrl.adminGetApplications);
router.get('/applications/export', authenticate, appCtrl.adminExportApplications);
router.get('/applications/:id', authenticate, appCtrl.adminGetApplication);
router.patch('/applications/:id/status', authenticate, appCtrl.adminUpdateApplicationStatus);
router.patch('/applications/:id/assign', authenticate, appCtrl.adminAssignApplication);
router.post('/applications/:id/notes', authenticate, appCtrl.adminAddApplicationNote);
router.get('/applications/:id/activity', authenticate, appCtrl.adminGetApplicationActivity);
router.delete('/applications/:id', authenticate, appCtrl.adminDeleteApplication);
router.get('/application-settings', authenticate, appCtrl.adminGetApplicationSettings);
router.put('/application-settings', authenticate, appCtrl.adminUpdateApplicationSettings);
router.post('/application-settings/reset', authenticate, appCtrl.adminResetApplicationSettings);

// Settings & Navigation
router.get('/settings', authenticate, api.adminGetSettings);
router.put('/settings', authenticate, api.adminUpdateSettings);
router.get('/navigation', authenticate, api.adminGetNavigation);
router.put('/navigation', authenticate, api.adminUpdateNavigation);

// Media
router.get('/media', authenticate, api.adminGetMedia);
router.post('/uploads', authenticate, upload.single('file'), api.adminUploadMedia);
router.put('/media/:id', authenticate, api.adminUpdateMedia);
router.delete('/uploads/:id', authenticate, api.adminDeleteMedia);

export default router;
