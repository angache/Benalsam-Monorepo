import { supabase } from './supabaseClient';
import NetInfo from '@react-native-community/netinfo';

interface SessionLogData {
  user_id: string;
  session_id?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class SessionLoggerService {
  private edgeFunctionUrl: string;

  constructor() {
    this.edgeFunctionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/session-logger`;
  }

  private async getCurrentIP(): Promise<string> {
    try {
      // Public IP al (dış IP)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      console.log('🌐 Public IP detected:', data.ip);
      return data.ip;
    } catch (error) {
      console.warn('⚠️ Could not get public IP:', error);
      return 'unknown';
    }
  }

  private async getNetworkType(): Promise<string> {
    try {
      const state = await NetInfo.fetch();
      return state.type || 'unknown';
    } catch (error) {
      console.warn('⚠️ Could not get network type:', error);
      return 'unknown';
    }
  }

  async logSessionActivity(action: 'login' | 'logout' | 'activity', metadata: Record<string, any> = {}): Promise<void> {
    try {
      console.log('🔍 Enterprise Session Logger: Logging session activity:', { action, metadata });

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Enterprise Session Logger: Session error:', sessionError);
        throw new Error('Session error');
      }

      if (!session) {
        console.error('❌ Enterprise Session Logger: No active session found');
        throw new Error('No active session found');
      }

      // Get current IP info
      const currentIP = await this.getCurrentIP();
      console.log('🔍 Enterprise Session Logger: Current IP:', currentIP);

      const logData: SessionLogData = {
        user_id: session.user.id,
        session_id: session.access_token,
        action,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          platform: 'mobile',
          current_ip: currentIP,
          network_type: await this.getNetworkType()
        }
      };

      console.log('🔍 Enterprise Session Logger: Sending log data:', logData);

      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Enterprise Session Logger: Edge function error:', errorText);
        throw new Error(`Edge function error: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Enterprise Session Logger: Session activity logged successfully:', result);

    } catch (error) {
      console.error('❌ Enterprise Session Logger: Failed to log session activity', { error });
      throw error;
    }
  }
}

export default new SessionLoggerService(); 