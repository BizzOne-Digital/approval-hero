import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import * as api from '../controllers/apiController';
import * as appCtrl from '../controllers/applicationController';

const router = Router();

const leadSchema = z.object({
  name: z.string().min(2).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email(),
  phone: z.string().min(7),
  preferredContact: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  timeAtAddress: z.string().optional(),
  housingStatus: z.string().optional(),
  dateOfBirth: z.string().optional(),
  creditSituation: z.string().optional(),
  vehiclePreference: z.string().optional(),
  vehicleType: z.string().optional(),
  employmentStatus: z.string().optional(),
  employerName: z.string().optional(),
  occupation: z.string().optional(),
  income: z.string().optional(),
  incomeFrequency: z.string().optional(),
  monthlyIncome: z.string().optional(),
  isEmployed: z.boolean().optional(),
  message: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, 'Consent is required'),
  sourcePage: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  submissionType: z.enum(['contact', 'application', 'lead']).optional(),
  applicationStep: z.string().optional(),
}).refine(
  (data) => data.name || (data.firstName && data.lastName),
  { message: 'Name or first/last name is required' }
);

const applicationSchema = leadSchema;

router.get('/settings', api.getPublicSettings);
router.get('/navigation', api.getPublicNavigation);
router.get('/pages/:slug', optionalAuth, api.getPublicPage);
router.get('/services', api.getPublicServices);
router.get('/services/:slug', api.getPublicService);
router.get('/gallery', api.getPublicGallery);
router.get('/testimonials', api.getPublicTestimonials);
router.get('/faqs', api.getPublicFaqs);
router.get('/blogs', api.getPublicBlogs);
router.get('/blogs/:slug', api.getPublicBlog);
router.get('/offers', api.getPublicOffers);
router.post('/contact', validateBody(leadSchema), api.submitContact);
router.post('/applications', validateBody(applicationSchema), api.submitApplication);

// Financing application workflow
const stepSchema = z.object({
  token: z.string().optional(),
  stepId: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

router.post('/applications/start', appCtrl.publicStartApplication);
router.get('/applications/session', appCtrl.publicGetApplicationSession);
router.patch('/applications/session/step', validateBody(stepSchema), appCtrl.publicSaveApplicationStep);
router.post('/applications/session/send-otp', appCtrl.publicSendOtp);
router.post('/applications/session/verify-otp', appCtrl.publicVerifyOtp);
router.post('/applications/session/submit', appCtrl.publicSubmitApplication);

export default router;
