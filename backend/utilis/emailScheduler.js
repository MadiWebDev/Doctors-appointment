import cron from 'node-cron';
import Appointment from '../Models/appointmentModels.js';
import User from '../Models/userModels.js';
import Doctor from '../Models/doctorModels.js';
import sendEmail from '../utilis/sendEmail.js';
import { addHours, isBefore, isAfter, startOfHour } from 'date-fns';

// Send 24-hour reminder
const send24HourReminder = async () => {
  try {
    console.log('Running 24-hour reminder check...');
    
    const now = new Date();
    const tomorrow = addHours(now, 24);
    const tomorrowStart = startOfHour(tomorrow);
    const tomorrowEnd = addHours(tomorrowStart, 1);

    // Find appointments in the next 24 hours that haven't had reminders sent
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: tomorrowStart,
        $lt: tomorrowEnd,
      },
      status: { $in: ['pending', 'confirmed'] },
      'remindersSent.twentyFourHour': false,
    })
      .populate('patient', 'email name')
      .populate({
        path: 'doctor',
        select: 'firstName lastName user',
        populate: { path: 'user', select: 'email' },
      });

    for (const appointment of appointments) {
      try {
        // Send email to patient
        await sendEmail({
          email: appointment.patient.email,
          subject: 'Appointment Reminder - Tomorrow',
          message: `
            <h2>Appointment Reminder</h2>
            <p>Dear ${appointment.patient.name || 'Patient'},</p>
            <p>This is a reminder that you have an appointment scheduled for tomorrow:</p>
            <ul>
              <li><strong>Doctor:</strong> Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}</li>
              <li><strong>Date:</strong> ${appointment.appointmentDate.toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
              <li><strong>Type:</strong> ${appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}</li>
            </ul>
            <p>Please arrive 10 minutes early for your appointment.</p>
            <p>If you need to reschedule, please contact us or use the app.</p>
          `,
        });

        // Send email to doctor
        await sendEmail({
          email: appointment.doctor.user?.email,
          subject: 'Appointment Reminder - Tomorrow',
          message: `
            <h2>Appointment Reminder</h2>
            <p>Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName},</p>
            <p>You have an appointment scheduled for tomorrow:</p>
            <ul>
              <li><strong>Patient:</strong> ${appointment.patient.name || 'Patient'}</li>
              <li><strong>Date:</strong> ${appointment.appointmentDate.toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
              <li><strong>Reason:</strong> ${appointment.reason}</li>
            </ul>
          `,
        });

        // Mark reminder as sent
        appointment.remindersSent.twentyFourHour = true;
        await appointment.save();

        console.log(`24-hour reminder sent for appointment ${appointment._id}`);
      } catch (error) {
        console.error(`Failed to send 24-hour reminder for appointment ${appointment._id}:`, error);
      }
    }

    console.log(`24-hour reminder check completed. Processed ${appointments.length} appointments.`);
  } catch (error) {
    console.error('Error in 24-hour reminder scheduler:', error);
  }
};

// Send 1-hour reminder
const send1HourReminder = async () => {
  try {
    console.log('Running 1-hour reminder check...');
    
    const now = new Date();
    const oneHourLater = addHours(now, 1);
    const oneHourStart = startOfHour(oneHourLater);
    const oneHourEnd = addHours(oneHourStart, 1);

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: oneHourStart,
        $lt: oneHourEnd,
      },
      status: { $in: ['pending', 'confirmed'] },
      'remindersSent.oneHour': false,
    })
      .populate('patient', 'email name')
      .populate({
        path: 'doctor',
        select: 'firstName lastName user',
        populate: { path: 'user', select: 'email' },
      });

    for (const appointment of appointments) {
      try {
        // Send email to patient
        await sendEmail({
          email: appointment.patient.email,
          subject: 'Appointment Reminder - In 1 Hour',
          message: `
            <h2>Appointment Reminder</h2>
            <p>Dear ${appointment.patient.name || 'Patient'},</p>
            <p>Your appointment is scheduled to start in 1 hour:</p>
            <ul>
              <li><strong>Doctor:</strong> Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}</li>
              <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
              <li><strong>Type:</strong> ${appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}</li>
            </ul>
            ${appointment.appointmentType === 'video' && appointment.videoConsultation?.meetingUrl ? 
              `<p><strong>Meeting Link:</strong> <a href="${appointment.videoConsultation.meetingUrl}">Join Video Call</a></p>` : 
              ''}
            <p>Please be ready on time.</p>
          `,
        });

        // Mark reminder as sent
        appointment.remindersSent.oneHour = true;
        await appointment.save();

        console.log(`1-hour reminder sent for appointment ${appointment._id}`);
      } catch (error) {
        console.error(`Failed to send 1-hour reminder for appointment ${appointment._id}:`, error);
      }
    }

    console.log(`1-hour reminder check completed. Processed ${appointments.length} appointments.`);
  } catch (error) {
    console.error('Error in 1-hour reminder scheduler:', error);
  }
};

// Clean up old completed appointments (optional maintenance task)
const cleanupOldAppointments = async () => {
  try {
    console.log('Running cleanup of old appointments...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Appointment.deleteMany({
      status: { $in: ['completed', 'cancelled', 'no-show'] },
      updatedAt: { $lt: thirtyDaysAgo },
    });

    console.log(`Cleanup completed. Deleted ${result.deletedCount} old appointments.`);
  } catch (error) {
    console.error('Error in cleanup scheduler:', error);
  }
};

// Initialize schedulers
export const initializeSchedulers = () => {
  // Run 24-hour reminder check every hour
  cron.schedule('0 * * * *', send24HourReminder, {
    timezone: process.env.TIMEZONE || 'UTC',
  });

  // Run 1-hour reminder check every 5 minutes
  cron.schedule('*/5 * * * *', send1HourReminder, {
    timezone: process.env.TIMEZONE || 'UTC',
  });

  // Run cleanup task daily at 2 AM
  cron.schedule('0 2 * * *', cleanupOldAppointments, {
    timezone: process.env.TIMEZONE || 'UTC',
  });

  console.log('Email schedulers initialized successfully');
};

// Export functions for manual triggering (useful for testing)
export { send24HourReminder, send1HourReminder, cleanupOldAppointments };
