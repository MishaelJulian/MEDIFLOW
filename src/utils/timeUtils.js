/**
 * Time and slot calculation utilities for MediFlow
 */

/**
 * Convert HH:MM time string to total minutes from 00:00
 * @param {string} timeStr - "HH:MM" (24h format)
 * @returns {number}
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes from 00:00 back to "HH:MM"
 * @param {number} minutes
 * @returns {string}
 */
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Check if interval A overlaps with interval B
 * Conflict rule: A.start < B.end AND B.start < A.end
 * @param {string} aStart - HH:MM
 * @param {string} aEnd - HH:MM
 * @param {string} bStart - HH:MM
 * @param {string} bEnd - HH:MM
 * @returns {boolean}
 */
const isIntervalOverlapping = (aStart, aEnd, bStart, bEnd) => {
  const aStartMin = timeToMinutes(aStart);
  const aEndMin = timeToMinutes(aEnd);
  const bStartMin = timeToMinutes(bStart);
  const bEndMin = timeToMinutes(bEnd);

  return aStartMin < bEndMin && bStartMin < aEndMin;
};

/**
 * Check if requested interval is completely inside an availability window
 * @param {string} reqStart - HH:MM
 * @param {string} reqEnd - HH:MM
 * @param {string} availStart - HH:MM
 * @param {string} availEnd - HH:MM
 * @returns {boolean}
 */
const isIntervalWithin = (reqStart, reqEnd, availStart, availEnd) => {
  const reqStartMin = timeToMinutes(reqStart);
  const reqEndMin = timeToMinutes(reqEnd);
  const availStartMin = timeToMinutes(availStart);
  const availEndMin = timeToMinutes(availEnd);

  return reqStartMin >= availStartMin && reqEndMin <= availEndMin;
};

/**
 * Generate discrete slots (e.g. 30-min intervals) between startTime and endTime
 * @param {string} startTime - HH:MM
 * @param {string} endTime - HH:MM
 * @param {number} duration - minutes (default 30)
 * @returns {Array<{startTime: string, endTime: string}>}
 */
const generateDiscreteSlots = (startTime, endTime, duration = 30) => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const slots = [];

  for (let current = startMin; current + duration <= endMin; current += duration) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + duration),
    });
  }

  return slots;
};

/**
 * Check if a date string YYYY-MM-DD + time is in the future
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:MM
 * @returns {boolean}
 */
const isFutureDateTime = (dateStr, timeStr) => {
  const targetDate = new Date(`${dateStr}T${timeStr}:00`);
  return targetDate.getTime() > Date.now();
};

/**
 * Normalize date to YYYY-MM-DD string
 * @param {Date|string} date
 * @returns {string}
 */
const formatDateYYYYMMDD = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  isIntervalOverlapping,
  isIntervalWithin,
  generateDiscreteSlots,
  isFutureDateTime,
  formatDateYYYYMMDD,
};
