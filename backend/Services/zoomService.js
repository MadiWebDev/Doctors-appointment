import crypto from 'crypto';

class ZoomService {
  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY;
    this.apiSecret = process.env.ZOOM_API_SECRET;
    this.baseUrl = 'https://api.zoom.us/v2';
  }

  // Generate JWT token for Zoom API authentication
  generateZoomToken() {
    const payload = {
      iss: this.apiKey,
      exp: Date.now() + 5000,
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Create a Zoom meeting
  async createMeeting(meetingDetails) {
    try {
      const token = this.generateZoomToken();
      
      const response = await fetch(`${this.baseUrl}/users/me/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: meetingDetails.topic || 'Doctor Consultation',
          type: meetingDetails.type || 1, // 1 = instant, 2 = scheduled, 3 = recurring, 8 = recurring with fixed time
          start_time: meetingDetails.startTime,
          duration: meetingDetails.duration || 30,
          agenda: meetingDetails.agenda || 'Medical Consultation',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            watermark: false,
            use_pmi: false,
            approval_type: 2, // No registration required
            audio: 'both',
            auto_recording: 'cloud',
            enforce_login: false,
            waiting_room: true,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create Zoom meeting');
      }

      return {
        success: true,
        meetingId: data.id,
        meetingUrl: data.join_url,
        startUrl: data.start_url,
        password: data.password,
        topic: data.topic,
        startTime: data.start_time,
        duration: data.duration,
      };
    } catch (error) {
      console.error('Zoom meeting creation error:', error);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  // Get meeting details
  async getMeeting(meetingId) {
    try {
      const token = this.generateZoomToken();
      
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get meeting details');
      }

      return {
        success: true,
        meetingId: data.id,
        topic: data.topic,
        startTime: data.start_time,
        duration: data.duration,
        status: data.status,
        joinUrl: data.join_url,
        password: data.password,
      };
    } catch (error) {
      console.error('Zoom meeting details error:', error);
      throw new Error('Failed to get meeting details');
    }
  }

  // Update meeting
  async updateMeeting(meetingId, updateDetails) {
    try {
      const token = this.generateZoomToken();
      
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update meeting');
      }

      return {
        success: true,
        meetingId: data.id,
        ...data,
      };
    } catch (error) {
      console.error('Zoom meeting update error:', error);
      throw new Error('Failed to update meeting');
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId) {
    try {
      const token = this.generateZoomToken();
      
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete meeting');
      }

      return {
        success: true,
        message: 'Meeting deleted successfully',
      };
    } catch (error) {
      console.error('Zoom meeting deletion error:', error);
      throw new Error('Failed to delete meeting');
    }
  }

  // Get meeting participants (after meeting ends)
  async getMeetingParticipants(meetingId) {
    try {
      const token = this.generateZoomToken();
      
      const response = await fetch(`${this.baseUrl}/past_meetings/${meetingId}/participants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get meeting participants');
      }

      return {
        success: true,
        participants: data.participants || [],
      };
    } catch (error) {
      console.error('Zoom meeting participants error:', error);
      throw new Error('Failed to get meeting participants');
    }
  }

  // Generate meeting signature for client-side SDK
  generateMeetingSignature(meetingNumber, role) {
    try {
      const timestamp = new Date().getTime() - 30000;
      const msg = Buffer.from(meetingNumber + role + timestamp).toString('base64');
      
      const hmac = crypto.createHmac('sha256', this.apiSecret);
      hmac.update(msg);
      const signature = hmac.digest('base64');
      
      return Buffer.from(`${signature}.${timestamp}`).toString('base64');
    } catch (error) {
      console.error('Zoom signature generation error:', error);
      throw new Error('Failed to generate meeting signature');
    }
  }
}

export default new ZoomService();
