import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Application, ApplicationActivity, ApplicationSettings } from '../models';
import {
  startApplicationSession,
  getApplicationSession,
  saveApplicationStep,
  requestOtp,
  confirmOtp,
  submitApplication,
  decryptApplicationForAdmin,
  sanitizeApplicationForClient,
} from '../services/applicationService';
import { getApplicationSettings, DEFAULT_APPLICATION_SETTINGS } from '../services/applicationSettingsService';

function getToken(req: AuthRequest): string | null {
  const header = req.headers['x-application-token'];
  if (typeof header === 'string' && header) return header;
  const bodyToken = req.body?.token;
  if (typeof bodyToken === 'string' && bodyToken) return bodyToken;
  const queryToken = req.query?.token;
  if (typeof queryToken === 'string' && queryToken) return queryToken;
  return null;
}

// ============ PUBLIC ============

export async function publicStartApplication(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { source, referrer, utmSource, utmMedium, utmCampaign, deviceCategory } = req.body || {};
    const result = await startApplicationSession({
      source,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceCategory,
    });
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed to start application', 500);
  }
}

export async function publicGetApplicationSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const token = getToken(req);
    if (!token) {
      sendError(res, 'Application token required', 401);
      return;
    }
    const session = await getApplicationSession(token);
    sendSuccess(res, session);
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Session not found', 404);
  }
}

export async function publicSaveApplicationStep(req: AuthRequest, res: Response): Promise<void> {
  try {
    const token = getToken(req);
    if (!token) {
      sendError(res, 'Application token required', 401);
      return;
    }
    const { stepId, data } = req.body;
    if (!stepId) {
      sendError(res, 'Step ID required', 400);
      return;
    }
    const app = await saveApplicationStep(token, stepId, data || {});
    const settings = await getApplicationSettings();
    sendSuccess(res, sanitizeApplicationForClient(app, settings));
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed to save step', 400);
  }
}

export async function publicSendOtp(req: AuthRequest, res: Response): Promise<void> {
  try {
    const token = getToken(req);
    if (!token) {
      sendError(res, 'Application token required', 401);
      return;
    }
    const ip = req.ip || req.socket.remoteAddress;
    const result = await requestOtp(token, ip);
    const payload: Record<string, unknown> = { sent: result.sent };
    if (result.cooldownSeconds) payload.cooldownSeconds = result.cooldownSeconds;
    if (result.mockCode && process.env.NODE_ENV !== 'production') {
      payload.mockCode = result.mockCode;
    }
    sendSuccess(res, payload);
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Failed to send OTP', 400);
  }
}

export async function publicVerifyOtp(req: AuthRequest, res: Response): Promise<void> {
  try {
    const token = getToken(req);
    const { code } = req.body;
    if (!token || !code) {
      sendError(res, 'Token and code required', 400);
      return;
    }
    await confirmOtp(token, String(code));
    const session = await getApplicationSession(token);
    sendSuccess(res, session);
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Verification failed', 400);
  }
}

export async function publicSubmitApplication(req: AuthRequest, res: Response): Promise<void> {
  try {
    const token = getToken(req);
    if (!token) {
      sendError(res, 'Application token required', 401);
      return;
    }
    const { consents } = req.body;
    const result = await submitApplication(token, consents || {});
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, err instanceof Error ? err.message : 'Submission failed', 400);
  }
}

// ============ ADMIN ============

export async function adminGetApplications(req: AuthRequest, res: Response): Promise<void> {
  const {
    page = '1', limit = '20', search, status, vehicleType, creditCategory,
    employmentStatus, monthlyIncomeRange, purchaseTimeline, assignedTo,
    dateFrom, dateTo, sort = '-createdAt',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, parseInt(limit as string, 10));
  const filter: Record<string, unknown> = { isArchived: false };

  if (status) filter.status = status;
  if (vehicleType) filter.vehicleType = vehicleType;
  if (creditCategory) filter.creditCategory = creditCategory;
  if (employmentStatus) filter.employmentStatus = employmentStatus;
  if (monthlyIncomeRange) filter.monthlyIncomeRange = monthlyIncomeRange;
  if (purchaseTimeline) filter.purchaseTimeline = purchaseTimeline;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) (filter.createdAt as Record<string, Date>).$gte = new Date(dateFrom as string);
    if (dateTo) (filter.createdAt as Record<string, Date>).$lte = new Date(dateTo as string);
  }
  if (search) {
    const s = String(search);
    filter.$or = [
      { referenceNumber: new RegExp(s, 'i') },
      { firstName: new RegExp(s, 'i') },
      { lastName: new RegExp(s, 'i') },
      { vehicleType: new RegExp(s, 'i') },
    ];
  }

  const total = await Application.countDocuments(filter);
  const apps = await Application.find(filter)
    .sort(sort as string)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const items = apps.map((app) => ({
    _id: app._id,
    referenceNumber: app.referenceNumber,
    applicantName: [app.firstName, app.lastName].filter(Boolean).join(' ') || '—',
    phone: app.encryptedPhone ? '***-***-****' : '—',
    email: app.encryptedEmail ? '***@***' : '—',
    vehicleType: app.vehicleType,
    preferredVehicle: app.preferredVehicle ? `${app.preferredVehicle.make} ${app.preferredVehicle.model}` : '—',
    creditCategory: app.creditCategory,
    employmentStatus: app.employmentStatus,
    monthlyIncomeRange: app.monthlyIncomeRange,
    purchaseTimeline: app.purchaseTimeline,
    phoneVerified: app.phoneVerified,
    status: app.status,
    assignedTo: app.assignedTo,
    source: app.source,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  }));

  sendSuccess(res, { items, total, page: pageNum, limit: limitNum });
}

export async function adminGetApplication(req: AuthRequest, res: Response): Promise<void> {
  const app = await Application.findById(req.params.id);
  if (!app) {
    sendError(res, 'Application not found', 404);
    return;
  }
  sendSuccess(res, decryptApplicationForAdmin(app));
}

export async function adminUpdateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
  const { status, note } = req.body;
  const app = await Application.findById(req.params.id);
  if (!app) {
    sendError(res, 'Application not found', 404);
    return;
  }
  const previous = app.status;
  app.status = status;
  app.lastActivityAt = new Date();
  await app.save();

  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'status_changed',
    description: note || `Status changed from ${previous} to ${status}`,
    previousStatus: previous,
    newStatus: status,
    performedBy: req.admin?.email,
  });

  sendSuccess(res, { status: app.status });
}

export async function adminAssignApplication(req: AuthRequest, res: Response): Promise<void> {
  const { assignedTo } = req.body;
  const app = await Application.findByIdAndUpdate(
    req.params.id,
    { assignedTo, lastActivityAt: new Date() },
    { new: true },
  );
  if (!app) {
    sendError(res, 'Application not found', 404);
    return;
  }
  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'assigned',
    description: `Assigned to ${assignedTo}`,
    performedBy: req.admin?.email,
  });
  sendSuccess(res, { assignedTo: app.assignedTo });
}

export async function adminAddApplicationNote(req: AuthRequest, res: Response): Promise<void> {
  const { text } = req.body;
  if (!text) {
    sendError(res, 'Note text required', 400);
    return;
  }
  const app = await Application.findById(req.params.id);
  if (!app) {
    sendError(res, 'Application not found', 404);
    return;
  }
  app.internalNotes.push({ text, author: req.admin?.email, createdAt: new Date() });
  app.lastActivityAt = new Date();
  await app.save();
  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'note_added',
    description: 'Internal note added',
    performedBy: req.admin?.email,
  });
  sendSuccess(res, app.internalNotes);
}

export async function adminGetApplicationActivity(req: AuthRequest, res: Response): Promise<void> {
  const activities = await ApplicationActivity.find({ applicationId: req.params.id })
    .sort('-createdAt')
    .lean();
  sendSuccess(res, activities);
}

export async function adminExportApplications(req: AuthRequest, res: Response): Promise<void> {
  const apps = await Application.find({ isArchived: false }).sort('-createdAt').lean();
  const headers = [
    'Reference', 'First Name', 'Last Name', 'Vehicle Type', 'Credit', 'Employment',
    'Income', 'Purchase Timeline', 'Status', 'Phone Verified', 'Source', 'Created',
  ];
  const rows = apps.map((app) => [
    app.referenceNumber || '',
    app.firstName || '',
    app.lastName || '',
    app.vehicleType || '',
    app.creditCategory || '',
    app.employmentStatus || '',
    app.monthlyIncomeRange || '',
    app.purchaseTimeline || '',
    app.status,
    app.phoneVerified ? 'Yes' : 'No',
    app.source || '',
    app.createdAt ? new Date(app.createdAt).toISOString() : '',
  ]);
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
  res.send(csv);
}

export async function adminDeleteApplication(req: AuthRequest, res: Response): Promise<void> {
  const app = await Application.findById(req.params.id);
  if (!app) {
    sendError(res, 'Application not found', 404);
    return;
  }
  app.isArchived = true;
  app.status = 'Closed';
  app.lastActivityAt = new Date();
  await app.save();
  await ApplicationActivity.create({
    applicationId: app._id,
    action: 'archived',
    description: 'Application archived',
    performedBy: req.admin?.email,
  });
  sendSuccess(res, null);
}

export async function adminGetApplicationSettings(_req: AuthRequest, res: Response): Promise<void> {
  const settings = await getApplicationSettings();
  sendSuccess(res, settings);
}

export async function adminUpdateApplicationSettings(req: AuthRequest, res: Response): Promise<void> {
  const settings = await ApplicationSettings.findOneAndUpdate(
    {},
    { $set: req.body },
    { new: true, upsert: true },
  );
  sendSuccess(res, settings);
}

export async function adminResetApplicationSettings(_req: AuthRequest, res: Response): Promise<void> {
  await ApplicationSettings.deleteMany({});
  const settings = await ApplicationSettings.create(DEFAULT_APPLICATION_SETTINGS);
  sendSuccess(res, settings);
}
